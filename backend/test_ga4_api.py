import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.security import create_access_token

client = TestClient(app)

def test_ga4_endpoints():
    token = create_access_token({"sub": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Unauthenticated check
    res_unauth = client.get("/api/admin/analytics/ga4/status")
    assert res_unauth.status_code == 401

    # 2. Authenticated check - initial status (not connected)
    res = client.get("/api/admin/analytics/ga4/status", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "connected" in data
    assert "property_id" in data
    assert data["property_id"] == "411659377"

    # 3. GET ga4 data in setup mode (returns graceful fallback with connected=False)
    res_data = client.get("/api/admin/analytics/ga4/data?days=7", headers=headers)
    assert res_data.status_code == 200
    d_data = res_data.json()
    assert "connected" in d_data
    assert "realtime_active_users" in d_data

    # 4. POST test invalid json (should return error gracefully, not crash)
    res_invalid = client.post(
        "/api/admin/analytics/ga4/credentials",
        headers=headers,
        json={"service_account_json": "invalid_json_text", "property_id": "411659377"}
    )
    assert res_invalid.status_code == 200
    assert res_invalid.json()["connected"] is False

    # 5. Delete credentials
    res_del = client.delete("/api/admin/analytics/ga4/credentials", headers=headers)
    assert res_del.status_code == 200
