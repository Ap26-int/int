"""Backend API tests for Lumière — auth + social drafts (iteration 3)."""
import os
import re
import pathlib
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = pathlib.Path("/app/frontend/.env")
    if env_path.exists():
        m = re.search(r"REACT_APP_BACKEND_URL=(\S+)", env_path.read_text())
        if m:
            BASE_URL = m.group(1).rstrip("/")

ADMIN_EMAIL = "sambita@lumierebysambita.com"
ADMIN_PASSWORD = "Lumiere@2026"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def anon():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session():
    """Login once, return a Session with cookies set."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    assert "access_token" in s.cookies, f"access_token cookie not set: {s.cookies}"
    assert "refresh_token" in s.cookies
    return s


@pytest.fixture(scope="session")
def shared_draft_id(admin_session):
    """Generate exactly ONE draft for this test session and reuse it.
    AI generation is costly — keep this at module/session scope."""
    r = admin_session.post(
        f"{BASE_URL}/api/social/drafts/generate",
        json={"theme": "soft luxury minimalism"},
        timeout=120,
    )
    assert r.status_code == 200, f"generate failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert data.get("id"), data
    return data["id"]


# ---------- AUTH ----------
class TestAuth:
    def test_login_success(self, anon):
        r = anon.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert "access_token" in r.cookies
        assert "refresh_token" in r.cookies
        # httpOnly + secure flags
        raw = r.headers.get("set-cookie", "") + " ; " + " ".join(r.raw.headers.getlist("set-cookie"))
        assert "HttpOnly" in raw or "httponly" in raw.lower()

    def test_login_wrong_password(self, anon):
        # use unique email to avoid hitting lockout threshold of shared admin identifier
        r = anon.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nobody@example.com", "password": "wrong"},
            timeout=15,
        )
        assert r.status_code == 401
        body = r.json()
        assert "Invalid email or password" in (body.get("detail") or "")

    def test_me_without_cookie(self, anon):
        fresh = requests.Session()
        r = fresh.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 200
        user = r.json()["user"]
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"

    def test_brute_force_lockout(self):
        # Isolated session with a distinct email so we don't lock out the real admin
        uniq = f"brute_{uuid.uuid4().hex[:6]}@example.com"
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        last = None
        for _ in range(6):
            last = s.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": uniq, "password": "wrong"},
                timeout=10,
            )
        # 6th attempt should be 429 (threshold is 5)
        assert last.status_code == 429, f"Expected 429 lockout, got {last.status_code}: {last.text[:200]}"

    def test_logout_clears_cookies(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        r = s.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200
        r2 = s.post(f"{BASE_URL}/api/auth/logout", timeout=10)
        assert r2.status_code == 200
        # FastAPI's delete_cookie sets Max-Age=0; requests removes expired cookies from jar on next use
        r3 = s.get(f"{BASE_URL}/api/auth/me", timeout=10)
        # cookie should now be empty/expired → 401
        # (requests keeps the expired cookie until next request — after this call jar should be empty)
        assert r3.status_code == 401, f"Expected 401 after logout, got {r3.status_code}"


# ---------- LEADS (protection) ----------
class TestLeadsAuth:
    def test_list_leads_requires_auth(self, anon):
        fresh = requests.Session()
        r = fresh.get(f"{BASE_URL}/api/leads", timeout=15)
        assert r.status_code == 401

    def test_list_leads_with_admin(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/leads", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_lead_public(self, anon):
        payload = {
            "name": "TEST_auth_iter3",
            "phone": "+919999999999",
            "email": f"test_iter3_{uuid.uuid4().hex[:6]}@example.com",
            "project_type": "Residence",
            "message": "iter3 smoke",
            "source": "site",
        }
        r = anon.post(f"{BASE_URL}/api/leads", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


# ---------- SOCIAL CONFIG ----------
class TestSocialConfig:
    def test_config_requires_auth(self, anon):
        fresh = requests.Session()
        r = fresh.get(f"{BASE_URL}/api/social/config", timeout=10)
        assert r.status_code == 401

    def test_config_admin(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/social/config", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert set(data["platforms"]) >= {"instagram", "facebook", "twitter", "linkedin"}
        assert data["daily_time_ist"] == "10:00"
        configured = data["configured"]
        # All platforms should currently be unconfigured (mocked)
        assert all(v is False for v in configured.values()), f"Expected all False, got {configured}"


# ---------- SOCIAL DRAFTS ----------
class TestSocialDrafts:
    def test_generate_draft(self, admin_session, shared_draft_id):
        # use the already-generated shared draft; fetch it via /today (faster than re-generating)
        r = admin_session.get(f"{BASE_URL}/api/social/drafts/today", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data.get("id"), f"today draft empty: {data}"
        # caption rules
        cap = data["caption"]
        assert isinstance(cap, str) and len(cap) > 0
        assert "!" not in cap, f"caption contains exclamation: {cap!r}"
        # hashtags
        tags = data["hashtags"]
        assert isinstance(tags, list) and len(tags) >= 8, f"tags={tags}"
        assert tags[0].lower() == "#lumierebysambitabose", f"first tag={tags[0]}"
        # image path
        img = data["image_url"]
        assert img.startswith("/api/static/social/"), f"image_url={img}"
        assert data["status"] == "draft"

    def test_image_served(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/social/drafts/today", timeout=15)
        img = r.json()["image_url"]
        full = f"{BASE_URL}{img}"
        resp = requests.get(full, timeout=30)
        assert resp.status_code == 200, f"image fetch {resp.status_code}"
        assert resp.headers.get("content-type", "").startswith("image/")

    def test_list_drafts(self, admin_session, shared_draft_id):
        r = admin_session.get(f"{BASE_URL}/api/social/drafts", timeout=15)
        assert r.status_code == 200
        drafts = r.json()
        assert isinstance(drafts, list) and len(drafts) >= 1
        assert all("_id" not in d for d in drafts)
        # desc by created_at
        times = [d.get("created_at", "") for d in drafts]
        assert times == sorted(times, reverse=True)

    def test_patch_draft(self, admin_session, shared_draft_id):
        new_caption = "Edited caption for testing — quiet luxury in every corner."
        new_tags = ["#LumiereBySambitaBose", "#QuietLuxury", "#InteriorDesign",
                    "#Bespoke", "#HomeDecor", "#Luxury", "#Mumbai", "#Atelier"]
        r = admin_session.patch(
            f"{BASE_URL}/api/social/drafts/{shared_draft_id}",
            json={"caption": new_caption, "hashtags": new_tags,
                  "platforms": ["instagram", "facebook"]},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["caption"] == new_caption
        assert d["hashtags"] == new_tags
        assert d["platforms"] == ["instagram", "facebook"]

    def test_publish_now_mocked(self, admin_session, shared_draft_id):
        r = admin_session.post(
            f"{BASE_URL}/api/social/drafts/{shared_draft_id}/publish",
            json={"publish_now": True, "platforms": ["instagram", "facebook"]},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        results = data["results"]
        assert len(results) == 2
        for res in results:
            assert res.get("mocked") is True, f"expected mocked:true in {res}"
            assert res.get("platform") in ("instagram", "facebook")
            assert res.get("ok") is True
        # status posted
        r2 = admin_session.get(f"{BASE_URL}/api/social/drafts", timeout=10)
        doc = next((x for x in r2.json() if x["id"] == shared_draft_id), None)
        assert doc and doc["status"] == "posted"

    def test_schedule_draft(self, admin_session, shared_draft_id):
        future = (datetime.now(timezone.utc) + timedelta(hours=5)).isoformat()
        r = admin_session.post(
            f"{BASE_URL}/api/social/drafts/{shared_draft_id}/publish",
            json={"publish_now": False, "scheduled_for": future,
                  "platforms": ["instagram"]},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "scheduled"
        # verify DB state
        r2 = admin_session.get(f"{BASE_URL}/api/social/drafts", timeout=10)
        doc = next((x for x in r2.json() if x["id"] == shared_draft_id), None)
        assert doc and doc["status"] == "scheduled"
        assert doc.get("scheduled_for")

    def test_reject_draft(self, admin_session, shared_draft_id):
        r = admin_session.post(
            f"{BASE_URL}/api/social/drafts/{shared_draft_id}/reject", timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True
        r2 = admin_session.get(f"{BASE_URL}/api/social/drafts", timeout=10)
        doc = next((x for x in r2.json() if x["id"] == shared_draft_id), None)
        assert doc and doc["status"] == "rejected"
