from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app.database import get_db
from app.models import AdminUser, AnalyticsEvent, Booking
from app.schemas import AnalyticsEventCreate, AnalyticsStatsOut, AnalyticsDailyPoint, AnalyticsRecentEventOut
from app.security import get_current_admin

router = APIRouter(tags=["Analytics & Tracker"])

@router.post("/public/analytics/track")
def track_visitor_event(
    event: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public non-blocking analytics ingestion endpoint.
    Collects anonymous page views, button clicks, and funnel interactions.
    """
    try:
        # Detect device type from User-Agent if not specified or generic
        ua = request.headers.get("user-agent", "").lower()
        device = event.device_type or "Mobile"
        if not event.device_type or event.device_type == "Unknown":
            if "mobile" in ua or "android" in ua or "iphone" in ua:
                device = "Mobile"
            elif "tablet" in ua or "ipad" in ua:
                device = "Tablet"
            else:
                device = "Desktop"

        browser_detected = event.browser or "Other"
        if not event.browser:
            if "chrome" in ua and "edg" not in ua and "opr" not in ua:
                browser_detected = "Chrome"
            elif "safari" in ua and "chrome" not in ua:
                browser_detected = "Safari"
            elif "firefox" in ua:
                browser_detected = "Firefox"
            elif "edg" in ua:
                browser_detected = "Edge"

        db_event = AnalyticsEvent(
            visitor_id=event.visitor_id[:64],
            event_type=event.event_type[:50],
            event_label=(event.event_label[:255] if event.event_label else None),
            page_path=(event.page_path[:255] if event.page_path else "/"),
            device_type=device[:30],
            browser=browser_detected[:50],
            created_at=datetime.utcnow()
        )
        db.add(db_event)
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        db.rollback()
        return {"status": "ignored", "error": str(e)}

@router.get("/admin/analytics/stats", response_model=AnalyticsStatsOut)
def get_analytics_stats(
    days: int = Query(7, ge=1, le=90),
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Aggregates live visitor analytics, click tracking metrics, and booking conversion funnel.
    """
    today_start = datetime.combine(date.today(), datetime.min.time())
    period_start = datetime.combine(date.today() - timedelta(days=days - 1), datetime.min.time())

    # 1. Today's live metrics
    today_visitors = db.query(distinct(AnalyticsEvent.visitor_id)).filter(
        AnalyticsEvent.created_at >= today_start
    ).count()

    today_pageviews = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= today_start,
        AnalyticsEvent.event_type.in_(["pageview", "page_view"])
    ).count()

    today_calls = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= today_start,
        AnalyticsEvent.event_type == "click_call"
    ).count()

    today_whatsapps = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= today_start,
        AnalyticsEvent.event_type == "click_whatsapp"
    ).count()

    today_modal_opens = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= today_start,
        AnalyticsEvent.event_type == "open_booking_modal"
    ).count()

    today_bookings = db.query(Booking).filter(
        Booking.created_at >= today_start
    ).count()

    conversion_rate = 0.0
    if today_modal_opens > 0:
        conversion_rate = round((today_bookings / today_modal_opens) * 100.0, 1)

    # 2. Period totals (e.g. 7 days)
    total_visitors_period = db.query(distinct(AnalyticsEvent.visitor_id)).filter(
        AnalyticsEvent.created_at >= period_start
    ).count()

    total_pageviews_period = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        AnalyticsEvent.event_type.in_(["pageview", "page_view"])
    ).count()

    total_clicks_period = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        ~AnalyticsEvent.event_type.in_(["pageview", "page_view"])
    ).count()

    # 3. Device Breakdown in Period
    device_counts = db.query(
        AnalyticsEvent.device_type,
        func.count(AnalyticsEvent.id)
    ).filter(
        AnalyticsEvent.created_at >= period_start
    ).group_by(AnalyticsEvent.device_type).all()

    device_breakdown = {k: count for k, count in device_counts if k}
    if not device_breakdown:
        device_breakdown = {"Mobile": 0, "Desktop": 0}

    # 4. Clicks by Category in Period
    call_clicks = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        AnalyticsEvent.event_type == "click_call"
    ).count()

    whatsapp_clicks = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        AnalyticsEvent.event_type == "click_whatsapp"
    ).count()

    book_button_clicks = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        AnalyticsEvent.event_type.in_(["click_book_ride", "open_booking_modal"])
    ).count()

    route_clicks = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.created_at >= period_start,
        AnalyticsEvent.event_type == "click_route"
    ).count()

    clicks_by_category = {
        "Helpline Calls": call_clicks,
        "WhatsApp Clicks": whatsapp_clicks,
        "Book Ride Buttons": book_button_clicks,
        "Route Cards": route_clicks
    }

    # 5. Daily Trends for chart
    daily_trends: List[AnalyticsDailyPoint] = []
    for i in range(days):
        day_date = date.today() - timedelta(days=days - 1 - i)
        d_start = datetime.combine(day_date, datetime.min.time())
        d_end = datetime.combine(day_date, datetime.max.time())

        d_visitors = db.query(distinct(AnalyticsEvent.visitor_id)).filter(
            AnalyticsEvent.created_at >= d_start,
            AnalyticsEvent.created_at <= d_end
        ).count()

        d_pageviews = db.query(AnalyticsEvent).filter(
            AnalyticsEvent.created_at >= d_start,
            AnalyticsEvent.created_at <= d_end,
            AnalyticsEvent.event_type.in_(["pageview", "page_view"])
        ).count()

        d_clicks = db.query(AnalyticsEvent).filter(
            AnalyticsEvent.created_at >= d_start,
            AnalyticsEvent.created_at <= d_end,
            ~AnalyticsEvent.event_type.in_(["pageview", "page_view"])
        ).count()

        d_bookings = db.query(Booking).filter(
            Booking.created_at >= d_start,
            Booking.created_at <= d_end
        ).count()

        daily_trends.append(
            AnalyticsDailyPoint(
                date=day_date.strftime("%d %b"),
                visitors=d_visitors,
                pageviews=d_pageviews,
                clicks=d_clicks,
                bookings=d_bookings
            )
        )

    # 6. Recent live events (last 15)
    recent_events = db.query(AnalyticsEvent).order_by(
        AnalyticsEvent.created_at.desc()
    ).limit(15).all()

    return AnalyticsStatsOut(
        today_visitors=today_visitors,
        today_pageviews=today_pageviews,
        today_calls=today_calls,
        today_whatsapps=today_whatsapps,
        today_modal_opens=today_modal_opens,
        today_bookings=today_bookings,
        conversion_rate=conversion_rate,
        total_visitors_period=total_visitors_period,
        total_pageviews_period=total_pageviews_period,
        total_clicks_period=total_clicks_period,
        device_breakdown=device_breakdown,
        clicks_by_category=clicks_by_category,
        daily_trends=daily_trends,
        recent_events=recent_events
    )
