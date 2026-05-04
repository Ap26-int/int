"""Iteration 4 backend tests — Lead CRM (status/follow_up_date/tags/comments) + Social Connections."""
import os
import re
import uuid
import pathlib
from datetime import datetime, timezone

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = pathlib.Path("/app/frontend/.env")
    if env_path.exists():
        m = re.search(r"REACT_APP_BACKEND_URL=(\S+)", env_path.read_text())
        if m:
            BASE_URL = m.group(1).rstrip("/")

ADMIN_EMAIL = "admin@lumierebysambita.com"
ADMIN_PASSWORD = "Lumiere@2026"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def anon():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return s


@pytest.fixture
def fresh_lead_id(anon):
    """Create a fresh lead via public endpoint and return its id."""
    u = uuid.uuid4().hex[:8]
    payload = {
        "name": f"TEST_CRM_{u}",
        "phone": "+919999998888",
        "email": f"crm_{u}@example.com",
        "project_type": "Full Home",
        "message": "iter4 crm test",
    }
    r = anon.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["id"]


# ---------- Lead PATCH ----------
class TestLeadPatch:
    def test_patch_status(self, admin_session, fresh_lead_id):
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"status": "contacted"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "contacted"
        assert data["id"] == fresh_lead_id
        # GET to verify persistence
        r2 = admin_session.get(f"{BASE_URL}/api/leads/{fresh_lead_id}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["status"] == "contacted"

    def test_patch_invalid_status(self, admin_session, fresh_lead_id):
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"status": "garbage"},
            timeout=10,
        )
        assert r.status_code in (400, 422)

    def test_patch_follow_up_set_and_clear(self, admin_session, fresh_lead_id):
        # SET
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"follow_up_date": "2026-03-15"},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["follow_up_date"] == "2026-03-15"
        # CLEAR via empty string
        r2 = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"follow_up_date": ""},
            timeout=10,
        )
        assert r2.status_code == 200
        assert r2.json()["follow_up_date"] in (None, "")
        # GET — confirm persisted as null
        r3 = admin_session.get(f"{BASE_URL}/api/leads/{fresh_lead_id}", timeout=10)
        assert r3.json().get("follow_up_date") in (None, "")

    def test_patch_tags(self, admin_session, fresh_lead_id):
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"tags": ["vip", "delhi", "luxury"]},
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["tags"] == ["vip", "delhi", "luxury"]
        # update — replace
        r2 = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"tags": ["vip"]},
            timeout=10,
        )
        assert r2.json()["tags"] == ["vip"]

    def test_patch_combined(self, admin_session, fresh_lead_id):
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={
                "status": "qualified",
                "follow_up_date": "2026-04-01",
                "tags": ["hot-lead"],
            },
            timeout=10,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "qualified"
        assert d["follow_up_date"] == "2026-04-01"
        assert d["tags"] == ["hot-lead"]
        assert d.get("updated_at")

    def test_patch_404(self, admin_session):
        r = admin_session.patch(
            f"{BASE_URL}/api/leads/does-not-exist-{uuid.uuid4().hex}",
            json={"status": "contacted"},
            timeout=10,
        )
        assert r.status_code == 404

    def test_patch_requires_auth(self, anon, fresh_lead_id):
        s = requests.Session()
        r = s.patch(
            f"{BASE_URL}/api/leads/{fresh_lead_id}",
            json={"status": "contacted"},
            timeout=10,
        )
        assert r.status_code == 401


# ---------- Lead Comments ----------
class TestLeadComments:
    def test_add_comment_then_delete(self, admin_session, fresh_lead_id):
        # ADD
        r = admin_session.post(
            f"{BASE_URL}/api/leads/{fresh_lead_id}/comments",
            json={"text": "Called the client; very interested."},
            timeout=10,
        )
        assert r.status_code == 200, r.text
        c = r.json()
        assert c.get("id")
        assert c["text"] == "Called the client; very interested."
        assert c["author_email"] == ADMIN_EMAIL
        assert c.get("author_name")
        assert c.get("created_at")
        comment_id = c["id"]

        # GET lead — comments array grows
        rg = admin_session.get(f"{BASE_URL}/api/leads/{fresh_lead_id}", timeout=10)
        assert rg.status_code == 200
        comments = rg.json().get("comments", [])
        assert any(x["id"] == comment_id for x in comments)

        # DELETE
        rd = admin_session.delete(
            f"{BASE_URL}/api/leads/{fresh_lead_id}/comments/{comment_id}",
            timeout=10,
        )
        assert rd.status_code == 200
        # GET again
        rg2 = admin_session.get(f"{BASE_URL}/api/leads/{fresh_lead_id}", timeout=10)
        comments2 = rg2.json().get("comments", [])
        assert all(x["id"] != comment_id for x in comments2)

    def test_add_comment_empty_rejected(self, admin_session, fresh_lead_id):
        r = admin_session.post(
            f"{BASE_URL}/api/leads/{fresh_lead_id}/comments",
            json={"text": ""},
            timeout=10,
        )
        assert r.status_code in (400, 422)

    def test_add_comment_lead_404(self, admin_session):
        r = admin_session.post(
            f"{BASE_URL}/api/leads/does-not-exist/comments",
            json={"text": "hello"},
            timeout=10,
        )
        assert r.status_code == 404

    def test_comment_requires_auth(self, anon, fresh_lead_id):
        s = requests.Session()
        r = s.post(
            f"{BASE_URL}/api/leads/{fresh_lead_id}/comments",
            json={"text": "noauth"},
            timeout=10,
        )
        assert r.status_code == 401


# ---------- Social Credentials ----------
PLATFORM_FIELDS = {
    "instagram": ["ig_business_account_id", "page_access_token"],
    "facebook": ["fb_page_id", "page_access_token"],
    "twitter": ["bearer_token", "access_token", "access_token_secret"],
    "linkedin": ["access_token", "author_urn"],
}


class TestSocialCredentials:
    def test_credentials_requires_auth(self):
        s = requests.Session()
        r = s.get(f"{BASE_URL}/api/social/credentials", timeout=10)
        assert r.status_code == 401

    def test_get_credentials_initial_shape(self, admin_session):
        # Cleanup any pre-existing creds first to ensure deterministic state
        for p in PLATFORM_FIELDS:
            admin_session.delete(f"{BASE_URL}/api/social/credentials/{p}", timeout=10)
        r = admin_session.get(f"{BASE_URL}/api/social/credentials", timeout=10)
        assert r.status_code == 200
        data = r.json()
        for p, fields in PLATFORM_FIELDS.items():
            assert p in data, f"missing platform {p}"
            entry = data[p]
            assert entry["configured"] is False
            assert entry["required_fields"] == fields
            assert entry.get("updated_at") in (None, "")
            preview = entry.get("preview") or {}
            for f in fields:
                assert f in preview

    def test_put_missing_field_rejected(self, admin_session):
        # Send just one of two required fields for instagram
        r = admin_session.put(
            f"{BASE_URL}/api/social/credentials/instagram",
            json={"fields": {"ig_business_account_id": "12345"}},
            timeout=10,
        )
        assert r.status_code == 400, r.text
        assert "Missing field" in (r.json().get("detail") or "")

    def test_put_unknown_platform(self, admin_session):
        r = admin_session.put(
            f"{BASE_URL}/api/social/credentials/myspace",
            json={"fields": {"x": "y"}},
            timeout=10,
        )
        assert r.status_code == 400

    def test_put_full_then_get_then_config_then_delete(self, admin_session):
        # PUT full instagram creds
        creds = {"ig_business_account_id": "1234567890", "page_access_token": "EAA_dummy_token_value_here"}
        r = admin_session.put(
            f"{BASE_URL}/api/social/credentials/instagram",
            json={"fields": creds},
            timeout=10,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("configured") is True
        assert body.get("platform") == "instagram"

        # GET credentials — instagram now configured + masked preview
        rg = admin_session.get(f"{BASE_URL}/api/social/credentials", timeout=10)
        assert rg.status_code == 200
        ig = rg.json()["instagram"]
        assert ig["configured"] is True
        prev = ig["preview"]
        # mask format: prefix•••suffix (or all dots if short)
        for f, v in creds.items():
            masked = prev.get(f)
            assert masked, f"preview for {f} missing"
            assert masked != v, f"preview should be masked, got raw: {masked}"
            # original token must NOT appear fully
            assert v not in masked

        # /api/social/config should now have instagram=true (DB merge)
        rc = admin_session.get(f"{BASE_URL}/api/social/config", timeout=10)
        assert rc.status_code == 200
        cfg = rc.json()
        assert cfg["configured"]["instagram"] is True

        # DELETE
        rd = admin_session.delete(
            f"{BASE_URL}/api/social/credentials/instagram", timeout=10
        )
        assert rd.status_code == 200

        # GET again — instagram unconfigured
        rg2 = admin_session.get(f"{BASE_URL}/api/social/credentials", timeout=10)
        assert rg2.json()["instagram"]["configured"] is False

        # config also flips back
        rc2 = admin_session.get(f"{BASE_URL}/api/social/config", timeout=10)
        assert rc2.json()["configured"]["instagram"] is False

    def test_put_other_platforms_basic(self, admin_session):
        for platform, fields in [
            ("facebook", {"fb_page_id": "1234", "page_access_token": "EAAtok123"}),
            ("twitter", {
                "bearer_token": "AAAA-bearer-xxx",
                "access_token": "1234-acc",
                "access_token_secret": "secretsecret",
            }),
            ("linkedin", {
                "access_token": "AQVlinkedin",
                "author_urn": "urn:li:person:abc",
            }),
        ]:
            r = admin_session.put(
                f"{BASE_URL}/api/social/credentials/{platform}",
                json={"fields": fields},
                timeout=10,
            )
            assert r.status_code == 200, f"{platform}: {r.text}"
            assert r.json()["configured"] is True
            # cleanup
            admin_session.delete(
                f"{BASE_URL}/api/social/credentials/{platform}", timeout=10
            )
