from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends, Body
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import resend

from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies, get_current_admin, seed_admin,
    is_locked_out, register_failed_attempt, clear_failed_attempts, _decode,
)
from social_ai import generate_full_draft, UPLOADS_DIR
from social_publish import publish_to_platforms, configured_platforms, PLATFORMS

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
LEAD_NOTIFY_EMAIL = os.environ.get('LEAD_NOTIFY_EMAIL', 'studio@lumierebysambita.com')
FRONTEND_URL = os.environ.get('FRONTEND_URL', '*')
SOCIAL_HOUR_IST = int(os.environ.get('SOCIAL_DAILY_HOUR_IST', '10'))
SOCIAL_MIN_IST = int(os.environ.get('SOCIAL_DAILY_MINUTE_IST', '0'))

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI(title="Lumière By Sambita Bose API")
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth")
social_router = APIRouter(prefix="/api/social")

# Mount AI-generated images
app.mount("/api/static/social", StaticFiles(directory=str(UPLOADS_DIR)), name="social-images")

logger = logging.getLogger(__name__)


# ============================================================
#   MODELS
# ============================================================
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


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class GenerateDraftPayload(BaseModel):
    theme: Optional[str] = None


class UpdateDraftPayload(BaseModel):
    caption: Optional[str] = Field(None, max_length=4000)
    hashtags: Optional[List[str]] = None
    image_url: Optional[str] = None
    platforms: Optional[List[str]] = None


class PublishDraftPayload(BaseModel):
    publish_now: bool = True
    scheduled_for: Optional[datetime] = None
    platforms: Optional[List[str]] = None


# ============================================================
#   HELPERS
# ============================================================
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
    if not RESEND_API_KEY:
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


def _doc_to_lead(d: dict) -> dict:
    if isinstance(d.get('created_at'), str):
        try:
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        except Exception:
            d['created_at'] = datetime.now(timezone.utc)
    return d


def _serialize_draft(d: dict) -> dict:
    if not d:
        return d
    d.pop("_id", None)
    return d


# ============================================================
#   PUBLIC ROUTES
# ============================================================
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
        asyncio.create_task(_send_lead_email(lead))
        return LeadResponse(success=True, id=lead.id, message="Thank you. Our concierge will reach out within 24 hours.")
    except Exception as e:
        logger.exception("Failed to create lead")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
#   AUTH ROUTES
# ============================================================
@auth_router.post("/login")
async def login(payload: LoginPayload, request: Request, response: Response):
    email = str(payload.email).strip().lower()
    ip = request.client.host if request.client else "?"
    identifier = f"{ip}:{email}"

    if await is_locked_out(db, identifier):
        raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await register_failed_attempt(db, identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await clear_failed_attempts(db, identifier)
    user_id = str(user.get("_id"))
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {
        "ok": True,
        "user": {"email": email, "name": user.get("name"), "role": user.get("role")},
        "access_token": access,
    }


@auth_router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@auth_router.get("/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"user": admin}


@auth_router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = _decode(token, "refresh")
    user_id = payload["sub"]
    email_payload = payload.get("email", "")
    access = create_access_token(user_id, email_payload)
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none",
                        max_age=8 * 3600, path="/")
    return {"ok": True}


# ============================================================
#   PROTECTED LEAD ROUTES
# ============================================================
@api_router.get("/leads", response_model=List[Lead])
async def list_leads(admin: dict = Depends(get_current_admin)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [_doc_to_lead(l) for l in leads]


# ============================================================
#   SOCIAL DRAFTS ROUTES (admin-only)
# ============================================================
@social_router.get("/config")
async def social_config(admin: dict = Depends(get_current_admin)):
    return {
        "platforms": list(PLATFORMS),
        "configured": configured_platforms(),
        "daily_time_ist": f"{SOCIAL_HOUR_IST:02d}:{SOCIAL_MIN_IST:02d}",
    }


@social_router.get("/drafts")
async def list_drafts(admin: dict = Depends(get_current_admin), limit: int = 50):
    items = await db.social_drafts.find({}, {"_id": 0}).sort("created_at", -1).to_list(max(1, min(limit, 200)))
    return items


@social_router.get("/drafts/today")
async def get_today_draft(admin: dict = Depends(get_current_admin)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc = await db.social_drafts.find_one({"date_key": today}, {"_id": 0}, sort=[("created_at", -1)])
    return doc or {}


@social_router.post("/drafts/generate")
async def generate_draft(payload: GenerateDraftPayload, admin: dict = Depends(get_current_admin)):
    try:
        result = await generate_full_draft(theme=payload.theme)
    except Exception as e:
        logger.exception("AI generation failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    draft_id = str(uuid.uuid4())
    draft = {
        "id": draft_id,
        "date_key": today,
        "theme": result["theme"],
        "caption": result["caption"],
        "hashtags": result["hashtags"],
        "image_prompt": result["image_prompt"],
        "image_url": result["image_url"],
        "platforms": list(PLATFORMS),
        "status": "draft",
        "scheduled_for": None,
        "publish_results": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": "scheduler" if admin.get("email") == "scheduler" else admin.get("email"),
    }
    await db.social_drafts.insert_one(draft.copy())
    draft.pop("_id", None)
    return draft


@social_router.patch("/drafts/{draft_id}")
async def update_draft(draft_id: str, payload: UpdateDraftPayload, admin: dict = Depends(get_current_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.social_drafts.update_one({"id": draft_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    doc = await db.social_drafts.find_one({"id": draft_id}, {"_id": 0})
    return doc


@social_router.post("/drafts/{draft_id}/reject")
async def reject_draft(draft_id: str, admin: dict = Depends(get_current_admin)):
    await db.social_drafts.update_one(
        {"id": draft_id},
        {"$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True}


@social_router.post("/drafts/{draft_id}/publish")
async def publish_draft(
    draft_id: str,
    payload: PublishDraftPayload,
    admin: dict = Depends(get_current_admin),
):
    draft = await db.social_drafts.find_one({"id": draft_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    platforms = payload.platforms or draft.get("platforms") or list(PLATFORMS)
    platforms = [p for p in platforms if p in PLATFORMS]

    if not payload.publish_now and payload.scheduled_for:
        await db.social_drafts.update_one(
            {"id": draft_id},
            {"$set": {
                "status": "scheduled",
                "scheduled_for": payload.scheduled_for.isoformat(),
                "platforms": platforms,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        return {"ok": True, "status": "scheduled", "scheduled_for": payload.scheduled_for.isoformat()}

    # Publish now
    caption = draft.get("caption", "")
    image_url = draft.get("image_url")
    hashtags = draft.get("hashtags", [])
    # If image_url is internal /api/static/, transform to absolute when needed by publishers
    results = await publish_to_platforms(platforms, caption, image_url, hashtags)
    any_ok = any(r.get("ok") for r in results)
    await db.social_drafts.update_one(
        {"id": draft_id},
        {"$set": {
            "status": "posted" if any_ok else "failed",
            "platforms": platforms,
            "publish_results": results,
            "posted_at": datetime.now(timezone.utc).isoformat() if any_ok else None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    return {"ok": any_ok, "results": results}


# ============================================================
#   APP WIRING
# ============================================================
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(social_router)

allowed_origins = [FRONTEND_URL] if FRONTEND_URL and FRONTEND_URL != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# ============================================================
#   STARTUP — seed admin + start scheduler
# ============================================================
_scheduler = None


async def _scheduled_daily_job():
    """Runs daily at SOCIAL_HOUR_IST. Generates a draft if none exists for today."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.social_drafts.find_one({"date_key": today})
    if existing:
        logger.info(f"[scheduler] draft already exists for {today}; skipping")
        return
    try:
        result = await generate_full_draft()
        draft = {
            "id": str(uuid.uuid4()),
            "date_key": today,
            "theme": result["theme"],
            "caption": result["caption"],
            "hashtags": result["hashtags"],
            "image_prompt": result["image_prompt"],
            "image_url": result["image_url"],
            "platforms": list(PLATFORMS),
            "status": "draft",
            "scheduled_for": None,
            "publish_results": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "scheduler",
        }
        await db.social_drafts.insert_one(draft)
        logger.info(f"[scheduler] generated draft for {today}")
    except Exception as e:
        logger.exception(f"[scheduler] generation failed: {e}")


@app.on_event("startup")
async def on_startup():
    await seed_admin(db)
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.social_drafts.create_index("date_key")
        await db.social_drafts.create_index("status")
        await db.leads.create_index("created_at")
    except Exception as e:
        logger.warning(f"index creation: {e}")

    # Scheduler — daily at IST hour:minute (UTC = IST - 5:30)
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger
        global _scheduler
        _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
        _scheduler.add_job(
            _scheduled_daily_job,
            CronTrigger(hour=SOCIAL_HOUR_IST, minute=SOCIAL_MIN_IST),
            id="social-daily",
            replace_existing=True,
        )
        _scheduler.start()
        logger.info(f"Scheduler started — daily social job at {SOCIAL_HOUR_IST:02d}:{SOCIAL_MIN_IST:02d} IST")
    except Exception as e:
        logger.error(f"Scheduler start failed: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    global _scheduler
    if _scheduler:
        try:
            _scheduler.shutdown(wait=False)
        except Exception:
            pass
    client.close()
