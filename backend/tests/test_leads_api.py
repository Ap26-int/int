"""Backend API tests for Lumière By Sambita Bose - leads API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://lumiere-interior.preview.emergentagent.com").rstrip("/")
# Fall back to frontend/.env if not exported
if not BASE_URL or BASE_URL.endswith("None"):
    import re, pathlib
    env_path = pathlib.Path("/app/frontend/.env")
    if env_path.exists():
        m = re.search(r"REACT_APP_BACKEND_URL=(\S+)", env_path.read_text())
        if m:
            BASE_URL = m.group(1).rstrip("/")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Health -----
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "message" in data
        assert "Lumière" in data["message"] or "Lumi" in data["message"]


# ----- Create lead -----
class TestCreateLead:
    def test_create_valid_lead(self, api):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Client_{unique}",
            "phone": "+91 9876543210",
            "email": f"test_{unique}@example.com",
            "project_type": "Full Home",
            "message": "Looking for luxury interior in Delhi.",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert isinstance(data["id"], str) and len(data["id"]) > 0
        assert "message" in data and len(data["message"]) > 0

        # Verify persistence via GET
        r2 = api.get(f"{BASE_URL}/api/leads")
        assert r2.status_code == 200
        leads = r2.json()
        match = [l for l in leads if l["id"] == data["id"]]
        assert len(match) == 1, "Created lead not returned by GET /api/leads"
        m = match[0]
        assert m["name"] == payload["name"]
        assert m["phone"] == payload["phone"]
        assert m["email"] == payload["email"].lower()
        assert m["project_type"] == payload["project_type"]
        assert m["message"] == payload["message"]
        assert "_id" not in m, "MongoDB _id should not be exposed"

    def test_reject_invalid_email(self, api):
        payload = {
            "name": "TEST_BadEmail",
            "phone": "1234567",
            "email": "not-an-email",
            "project_type": "Kitchen",
            "message": "",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        # FastAPI/Pydantic validation returns 422
        assert r.status_code in (400, 422), f"Expected validation error, got {r.status_code}: {r.text}"

    def test_reject_missing_required(self, api):
        payload = {"name": "NoPhone", "email": "x@y.com"}  # missing phone & project_type
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code in (400, 422)

    def test_reject_empty_name(self, api):
        payload = {
            "name": "",
            "phone": "12345",
            "email": "ok@example.com",
            "project_type": "Bedroom",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code in (400, 422)

    def test_create_lead_with_source(self, api):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Source_{unique}",
            "phone": "+919876543211",
            "email": f"src_{unique}@example.com",
            "project_type": "Full Home",
            "message": "Source test",
            "source": "popup_offer",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True
        # Verify persisted source
        r2 = api.get(f"{BASE_URL}/api/leads")
        leads = r2.json()
        match = [l for l in leads if l["id"] == r.json()["id"]]
        assert len(match) == 1
        assert match[0]["source"] == "popup_offer"

    def test_create_lead_default_source(self, api):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_DefSrc_{unique}",
            "phone": "+919876543212",
            "email": f"defsrc_{unique}@example.com",
            "project_type": "Kitchen",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        # Verify default source
        r2 = api.get(f"{BASE_URL}/api/leads")
        match = [l for l in r2.json() if l["id"] == r.json()["id"]]
        assert len(match) == 1
        assert match[0]["source"] == "site"

    def test_optional_message_empty(self, api):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_NoMsg_{unique}",
            "phone": "+919999999999",
            "email": f"nomsg_{unique}@example.com",
            "project_type": "Living Room",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


# ----- List leads -----
class TestListLeads:
    def test_list_returns_array(self, api):
        r = api.get(f"{BASE_URL}/api/leads")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_list_no_mongo_id_and_sorted_desc(self, api):
        # create 2 leads sequentially
        ids = []
        for i in range(2):
            u = uuid.uuid4().hex[:8]
            payload = {
                "name": f"TEST_Order_{i}_{u}",
                "phone": "1234567890",
                "email": f"o{i}_{u}@example.com",
                "project_type": "Office",
                "message": f"order {i}",
            }
            r = api.post(f"{BASE_URL}/api/leads", json=payload)
            assert r.status_code == 200
            ids.append(r.json()["id"])

        r = api.get(f"{BASE_URL}/api/leads")
        assert r.status_code == 200
        leads = r.json()
        # No _id
        for l in leads:
            assert "_id" not in l
            assert "id" in l and "created_at" in l

        # Sorted desc by created_at (newest first). The second created should appear before first.
        created_ats = [l["created_at"] for l in leads]
        # Locate positions of our two ids
        pos = {l["id"]: idx for idx, l in enumerate(leads)}
        assert ids[1] in pos and ids[0] in pos
        assert pos[ids[1]] < pos[ids[0]], "Leads should be sorted desc by created_at"
        # Overall ordering
        assert created_ats == sorted(created_ats, reverse=True)
