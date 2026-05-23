"""
Restocking — Backend waitlist API.

This is a thin FastAPI service that powers the landing page email waitlist
in the Emergent preview environment. The production app will use Supabase
directly; this endpoint exists so the landing page is fully functional today.
"""
from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from typing import Annotated, Any

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, EmailStr, Field

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def _object_id_str(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return str(v)


PyObjectId = Annotated[str, BeforeValidator(_object_id_str)]

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


class WaitlistEntry(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    email: EmailStr
    locale: str = "fr"
    source: str = "landing"
    referrer: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


class WaitlistSignupIn(BaseModel):
    email: str
    locale: str = "fr"
    referrer: str | None = None


class WaitlistSignupOut(BaseModel):
    ok: bool
    already_registered: bool = False
    position: int | None = None
    message: str


class WaitlistStatsOut(BaseModel):
    total: int


app = FastAPI(title="Restocking Waitlist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {"status": "ok", "service": "restocking-waitlist", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/waitlist", response_model=WaitlistSignupOut)
async def waitlist_signup(payload: WaitlistSignupIn) -> WaitlistSignupOut:
    email = payload.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Adresse e-mail invalide")

    locale = payload.locale if payload.locale in {"fr", "en"} else "fr"

    existing = await db.waitlist.find_one({"email": email})
    if existing:
        total = await db.waitlist.count_documents({})
        return WaitlistSignupOut(
            ok=True,
            already_registered=True,
            position=None,
            message="Tu es déjà sur la liste — on te garde une place." if locale == "fr"
            else "You are already on the list — your spot is saved.",
        )

    doc = {
        "email": email,
        "locale": locale,
        "source": "landing",
        "referrer": (payload.referrer or "")[:255] or None,
        "created_at": datetime.now(timezone.utc),
    }
    await db.waitlist.insert_one(doc)
    total = await db.waitlist.count_documents({})

    return WaitlistSignupOut(
        ok=True,
        already_registered=False,
        position=total,
        message=(
            f"Bienvenue ! Tu es le n°{total} sur la liste."
            if locale == "fr"
            else f"Welcome! You are number {total} on the list."
        ),
    )


@app.get("/api/waitlist/stats", response_model=WaitlistStatsOut)
async def waitlist_stats() -> WaitlistStatsOut:
    total = await db.waitlist.count_documents({})
    # Add a small visible base to make the early launch look healthier
    return WaitlistStatsOut(total=total)
