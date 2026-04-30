from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Lumière By Sambita Bose API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=4, max_length=40)
    email: EmailStr
    project_type: str = Field(..., min_length=1, max_length=80)
    message: Optional[str] = Field(default="", max_length=2000)


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    project_type: str
    message: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadResponse(BaseModel):
    success: bool
    id: str
    message: str


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
        )
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.leads.insert_one(doc)
        return LeadResponse(
            success=True,
            id=lead.id,
            message="Thank you. Our concierge will reach out within 24 hours."
        )
    except Exception as e:
        logging.exception("Failed to create lead")
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
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
