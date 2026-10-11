import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings

client = TestClient(app)
settings = get_settings()

def test_full_flow():
    print("\n--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health response:", res.json())

    print("\n--- 2. Testing Slider Images ---")
    res = client.get("/api/slider-images")
    assert res.status_code == 200, f"Slider fetch failed: {res.text}"
    slides = res.json()
    print(f"Retrieved {len(slides)} public slider images.")
    assert len(slides) > 0, "Expected at least 1 slider image"

    print("\n--- 3. Testing Booking Creation (Customer 1) ---")
    booking_payload = {
        "customer_name": "Harpreet Singh",
        "whatsapp_number": "+91 98765 43210",
        "pickup_location": "Model Town, Jalandhar",
        "destination": "Amritsar Airport (ATQ)",
        "marketing_consent": True
    }
    res = client.post("/api/bookings", json=booking_payload)
    assert res.status_code == 201, f"Booking creation failed: {res.text}"
    booking_data = res.json()
    print("Booking Created:", booking_data)
    assert "booking_reference" in booking_data
    assert booking_data["booking_reference"].startswith("PB08-")
    customer_1_id = booking_data["customer_id"]

    print("\n--- 4. Testing Customer Deduplication (Same Phone, Updated Name) ---")
    booking_payload_2 = {
        "customer_name": "Harpreet S. Jalandhar",
        "whatsapp_number": "+919876543210",
        "pickup_location": "BMC Chowk, Jalandhar",
        "destination": "Chandigarh Sector 17",
        "marketing_consent": True
    }
    res2 = client.post("/api/bookings", json=booking_payload_2)
    assert res2.status_code == 201, f"Second booking failed: {res2.text}"
    booking_data_2 = res2.json()
    print("Second Booking Created:", booking_data_2)
    assert booking_data_2["customer_id"] == customer_1_id, "Deduplication failed: Customer ID should be identical!"
    assert booking_data_2["booking_reference"] != booking_data["booking_reference"], "Booking references must be distinct"
    print("SUCCESS: Customer was deduplicated and updated correctly!")

    print("\n--- 5. Testing Admin Login ---")
    login_payload = {
        "username": settings.ADMIN_USERNAME,
        "password": settings.ADMIN_PASSWORD
    }
    res_login = client.post("/api/admin/login", json=login_payload)
    assert res_login.status_code == 200, f"Admin login failed: {res_login.text}"
    token_data = res_login.json()
    token = token_data["access_token"]
    print("Admin login successful. Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 6. Testing Admin Dashboard Stats ---")
    res_stats = client.get("/api/admin/stats", headers=headers)
    assert res_stats.status_code == 200, f"Stats failed: {res_stats.text}"
    stats = res_stats.json()
    print("Dashboard Stats:", stats)
    assert stats["total_customers"] >= 1
    assert stats["total_bookings"] >= 2

    print("\n--- 7. Testing Customer Search ---")
    res_cust = client.get("/api/admin/customers?q=Harpreet", headers=headers)
    assert res_cust.status_code == 200, f"Customer search failed: {res_cust.text}"
    cust_list = res_cust.json()
    print("Customer search result count:", len(cust_list))
    assert len(cust_list) >= 1
    assert cust_list[0]["total_bookings"] >= 2

    print("\n--- 8. Testing Booking Status Update ---")
    res_update = client.patch(
        f"/api/admin/bookings/{booking_data['id']}/status",
        headers=headers,
        json={"status": "CONFIRMED", "notes": "Driver assigned: Balwinder (Swift Dzire)"}
    )
    assert res_update.status_code == 200, f"Status update failed: {res_update.text}"
    updated_booking = res_update.json()
    assert updated_booking["status"] == "CONFIRMED"
    print("Booking status successfully updated to CONFIRMED:", updated_booking)

    print("\n--- 9. Testing WhatsApp Status & Test Message ---")
    res_wa_status = client.get("/api/admin/whatsapp/status", headers=headers)
    assert res_wa_status.status_code == 200
    print("WhatsApp status:", res_wa_status.json())

    res_test_wa = client.post(
        "/api/admin/whatsapp/test-message",
        headers=headers,
        json={"phone": "919876543210", "message": "PB08 TAXI automated verification test"}
    )
    assert res_test_wa.status_code == 200
    print("Test WhatsApp result:", res_test_wa.json())

    print("\n--- 10. Testing WhatsApp Message Logs ---")
    res_logs = client.get("/api/admin/whatsapp/logs", headers=headers)
    assert res_logs.status_code == 200
    logs = res_logs.json()
    print("\n--- 11. Testing Site Settings & Admin Credentials Update ---")
    res_pub_settings = client.get("/api/site-settings")
    assert res_pub_settings.status_code == 200
    pub_settings = res_pub_settings.json()
    print("Public Site Settings:", pub_settings)
    assert "support_phone" in pub_settings
    assert "whatsapp_number" in pub_settings
    assert "show_credentials_hint" in pub_settings

    # Update site settings
    res_update_settings = client.post(
        "/api/admin/settings",
        headers=headers,
        json={
            "support_phone": "+91 99887 76655",
            "whatsapp_number": "919988776655",
            "show_credentials_hint": False
        }
    )
    assert res_update_settings.status_code == 200
    updated_settings = res_update_settings.json()
    print("Updated Settings:", updated_settings)
    assert updated_settings["support_phone"] == "+91 99887 76655"
    assert updated_settings["whatsapp_number"] == "919988776655"
    assert updated_settings["show_credentials_hint"] is False

    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == "__main__":
    test_full_flow()

