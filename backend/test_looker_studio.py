import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.security import create_access_token

client = TestClient(app)

def test_looker_studio_endpoints():
    token = create_access_token({"sub": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET current configuration
    res = client.get("/api/admin/analytics/looker-studio", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "embed_url" in data
    assert "google_analytics_id" in data
    assert "ga4_property_id" in data
    assert data["google_analytics_id"] == "G-MD0W9GNM7V"
    assert data["ga4_property_id"] == "411659377"

    # 2. POST update configuration with iframe extraction
    test_iframe = '<iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/sample-test-report" frameborder="0" style="border:0" allowfullscreen></iframe>'
    res_update = client.post(
        "/api/admin/analytics/looker-studio",
        headers=headers,
        json={"embed_url": test_iframe}
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    # It should extract the pure URL from iframe
    assert updated["embed_url"] == "https://lookerstudio.google.com/embed/reporting/sample-test-report"

    # 3. Reset back to blank for clean UI
    res_reset = client.post(
        "/api/admin/analytics/looker-studio",
        headers=headers,
        json={"embed_url": ""}
    )
    assert res_reset.status_code == 200
    assert res_reset.json()["embed_url"] in ("", None)

    # 4. Unauthorized check
    res_unauth = client.get("/api/admin/analytics/looker-studio")
    assert res_unauth.status_code == 401
