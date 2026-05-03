from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
LEAD_NOTIFY_EMAIL = os.environ.get('LEAD_NOTIFY_EMAIL', 'studio@lumierebysambita.com')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI(title="Lumière By Sambita Bose API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)


# ---------- Models ----------
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=4, max_length=40)
    email: EmailStr
    project_type: str = Field(..., min_length=1, max_length=80)
    message: Optional[str] = Field(default="", max_length=2000)
    source: Optional[str] = Field(default="site", max_length=40)


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    project_type: str
    message: str = ""
    source: str = "site"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadResponse(BaseModel):
    success: bool
    id: str
    message: str


# ---------- Helpers ----------
def _render_lead_email_html(lead: Lead) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#F5EFE6;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid rgba(201,169,97,0.3);">
          <tr><td style="padding:28px 32px;border-bottom:1px solid rgba(201,169,97,0.2);">
            <div style="color:#C9A961;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Lumière · New Enquiry</div>
            <div style="color:#F5EFE6;font-size:22px;margin-top:6px;font-weight:300;">A new consultation request has arrived.</div>
          </td></tr>
          <tr><td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.7;">
              <tr><td style="color:#9a927f;width:140px;">Name</td><td style="color:#F5EFE6;"><strong>{lead.name}</strong></td></tr>
              <tr><td style="color:#9a927f;">Phone</td><td style="color:#F5EFE6;">{lead.phone}</td></tr>
              <tr><td style="color:#9a927f;">Email</td><td style="color:#F5EFE6;">{lead.email}</td></tr>
              <tr><td style="color:#9a927f;">Project Type</td><td style="color:#F5EFE6;">{lead.project_type}</td></tr>
              <tr><td style="color:#9a927f;">Source</td><td style="color:#F5EFE6;">{lead.source}</td></tr>
              <tr><td style="color:#9a927f;vertical-align:top;">Message</td><td style="color:#F5EFE6;">{lead.message or '—'}</td></tr>
              <tr><td style="color:#9a927f;">Received</td><td style="color:#F5EFE6;">{lead.created_at.strftime('%d %b %Y · %H:%M UTC')}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:20px 32px;background:#0A0A0A;border-top:1px solid rgba(201,169,97,0.2);color:#9a927f;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
            Reply within 24 hours · Offer: 10% off first project
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def _send_lead_email(lead: Lead) -> None:
    """Fire-and-forget. Never raise — email is best-effort."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping email")
        return
    try:
        params = {
            "from": f"Lumière Studio <{SENDER_EMAIL}>",
            "to": [LEAD_NOTIFY_EMAIL],
            "reply_to": lead.email,
            "subject": f"New Enquiry · {lead.name} · {lead.project_type}",
            "html": _render_lead_email_html(lead),
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Lead email sent: {result.get('id') if isinstance(result, dict) else result}")
    except Exception as e:
        logger.error(f"Lead email failed: {e}")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Lumière By Sambita Bose – Luxury Interior Design"}


@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(payload: LeadCreate):
    try:
        lead = Lead(
            name=payload.name.strip(),
            phone=payload.phone.strip(),
            email=str(payload.email).strip().lower(),
            project_type=payload.project_type.strip(),
            message=(payload.message or "").strip(),
            source=(payload.source or "site").strip().lower(),
        )
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.leads.insert_one(doc)

        # Fire-and-forget email notification
        asyncio.create_task(_send_lead_email(lead))

        return LeadResponse(
            success=True,
            id=lead.id,
            message="Thank you. Our concierge will reach out within 24 hours."
        )
    except Exception as e:
        logger.exception("Failed to create lead")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/leads", response_model=List[Lead])
async def list_leads():
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for l in leads:
        if isinstance(l.get('created_at'), str):
            try:
                l['created_at'] = datetime.fromisoformat(l['created_at'])
            except Exception:
                l['created_at'] = datetime.now(timezone.utc)
    return leads


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
