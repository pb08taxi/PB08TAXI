# PB08 TAXI — Simple & Fast Taxi Booking Website

A complete, lightweight, and responsive taxi booking platform named **PB08 TAXI** built for Punjab, India and airport/outstation travel. Features an iconic Black, Yellow, and White taxi visual theme, animated homepage image slider, "One Click Book Your Ride" instant booking modal, Neon.tech PostgreSQL database persistence, OpenWA WhatsApp Gateway integration, and an admin panel.

---

## 🚖 Key Features

- **Iconic Taxi Aesthetic**: Custom Black (`#0A0A0A`), Taxi Yellow (`#FACC15`), and White theme with smooth lightweight CSS animations.
- **Dynamic Homepage Slider**: Admin-manageable slides with headlines, descriptions, and photo uploads. Reflects immediately on the site without redeployment.
- **One Click Book Your Ride**:
  - Customer Name (Required).
  - WhatsApp Number (Required).
  - Pickup Location & Destination (Optional).
  - Marketing Consent checkbox for promotional updates.
  - Generates instant reference code (e.g. `PB08-26-XXXX`).
  - Automatic customer deduplication (updates existing profile on phone match).
  - Automatic WhatsApp confirmation dispatch via OpenWA:
    > *"Hi {Customer Name}, our support team will contact you shortly. You will receive a call from us soon. Thank you for connecting with PB08 TAXI!"*
  - Graceful fallback: If WhatsApp is offline or fails, booking is safely saved in Neon PostgreSQL and logged.
- **Admin Control Panel (`/admin`)**:
  - Secure bcrypt password hashing and JWT authentication.
  - **Dashboard**: Total customers, total bookings, today's bookings, pending bookings, and WhatsApp dispatch rates.
  - **Customer Directory**: Real-time search by name or phone, total booking count, and marketing consent management.
  - **Bookings Management**: Filter by status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), view route details, and assign drivers/notes.
  - **Image Slider Manager**: Upload images, update titles and descriptions, toggle visibility, and reorder slides.
  - **Site Settings**:
    - Manage customer calling helpline and floating WhatsApp support numbers.
    - Site Logo and Favicon customization with recommended resolutions (512x512px / 500x120px for logo, 32x32px / 64x64px for favicon).
    - Update Administrator ID (Username) and Password with bcrypt hashing and eye open/close toggles.
    - Interactive checkbox to show/hide default credentials hint on `/admin/login`.
  - **WhatsApp Settings**: Live OpenWA Gateway status, Connect/Disconnect session, QR code companion display, and test message sender.
  - **WhatsApp Offers**: Broadcast promotional messages strictly to opted-in consented customers with rate-pacing anti-spam delays.
  - **Message Audit Logs**: Full history of sent/failed messages and error details.
- **Floating WhatsApp Button**: Bottom-right pulsing button connecting customers directly to WhatsApp.
- **Mobile Responsive**: Fully optimized across desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router 6 |
| **Backend** | Python FastAPI, Pydantic v2, SlowAPI Rate Limiter, HTTPX |
| **Database** | Neon.tech Serverless PostgreSQL, SQLAlchemy 2.0 ORM, Alembic Migrations |
| **Auth & Security** | Passwords hashed with bcrypt, JWT Bearer tokens |
| **WhatsApp Gateway** | [OpenWA WhatsApp Gateway](https://github.com/rmyndharis/OpenWA) (Multi-device REST API & QR code companion) |
| **Hosting** | Vercel (Frontend SPA) + Render (FastAPI Web Service) |

---

## 📁 Project Structure

```
PBO8TAXI/
├── backend/
│   ├── alembic/                 # Alembic database migration scripts
│   │   ├── versions/            # 001_initial_schema.py
│   │   └── env.py
│   ├── app/
│   │   ├── models.py            # SQLAlchemy models (Neon PostgreSQL)
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── database.py          # Database session engine (Neon & local fallback)
│   │   ├── config.py            # Environment settings
│   │   ├── security.py          # Bcrypt hashing & JWT verification
│   │   ├── main.py              # FastAPI app & CORS configuration
│   │   ├── services/
│   │   │   └── whatsapp_service.py # OpenWA REST API client & session manager
│   │   └── routers/
│   │       ├── public.py        # Booking creation & public slider
│   │       ├── auth.py          # Admin login & profile
│   │       ├── admin_dashboard.py # Metrics & overview
│   │       ├── admin_customers.py # Customer search & consent
│   │       ├── admin_bookings.py  # Bookings list & status updates
│   │       ├── admin_slider.py    # Slider CRUD & image uploads
│   │       └── admin_whatsapp.py  # OpenWA QR, pairing, offers & logs
│   ├── uploads/                 # Local directory for uploaded slide images
│   ├── seed.py                  # Seed script for initial admin & slides
│   ├── test_api.py              # Automated backend test suite
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Production container for Render
│   ├── render.yaml              # Render Blueprint configuration
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client & JWT interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header & mobile drawer
│   │   │   ├── HeroSlider.jsx   # Hero slider & One Click Book CTA
│   │   │   ├── BookingModal.jsx # Booking form & instant confirmation
│   │   │   ├── ServicesSection.jsx # Services cards
│   │   │   ├── WhyChooseUs.jsx  # Value propositions
│   │   │   ├── ContactSection.jsx # Contact info & helpline
│   │   │   ├── Footer.jsx       # Footer & admin link
│   │   │   ├── FloatingWhatsApp.jsx # Floating WhatsApp button
│   │   │   └── AdminLayout.jsx  # Admin sidebar & live WhatsApp indicator
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminCustomersPage.jsx
│   │   │   ├── AdminBookingsPage.jsx
│   │   │   ├── AdminSliderPage.jsx
│   │   │   ├── AdminWhatsAppPage.jsx
│   │   │   ├── AdminOffersPage.jsx
│   │   │   └── AdminLogsPage.jsx
│   │   ├── App.jsx              # Client router with protected admin routes
│   │   ├── index.css            # Tailwind & taxi custom styling
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json              # Vercel SPA routing rewrites
│   └── .env.example
└── README.md
```

---

## 🚀 Local Run Instructions

### ⚡ 1-Click Start (Windows)
Double-click **`start.bat`** in the project root folder. It will:
1. Stop any old/stale processes on ports 8000 and 5173.
2. Launch the FastAPI backend and Vite frontend in dedicated terminal windows.
3. Automatically open `http://localhost:5173` in your default web browser!

To **stop all running servers and close the terminals**, simply double-click **`stop.bat`**.

---

### Manual Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit backend/.env if you have a Neon PostgreSQL DATABASE_URL
# If left blank, it automatically uses local SQLite for instant testing!

# Run database migrations and seed default admin + initial slides
python seed.py
alembic stamp head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

### 4. Admin Credentials
- **URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `PB08Taxi@2026!`

---

## 💬 WhatsApp API (OpenWA) Configuration

PB08 TAXI connects to WhatsApp using **[OpenWA](https://github.com/rmyndharis/OpenWA)**, an open-source, self-hosted WhatsApp API Gateway.

### Option A: Run OpenWA with Docker (Recommended)
```bash
docker run -d \
  --name openwa \
  -p 2785:2785 \
  -v openwa_data:/app/data \
  rmyndharis/openwa:latest
```

### Option B: Run OpenWA from Source
```bash
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
npm install
npm run build
npm start
```

### Pairing Your WhatsApp Account:
1. Ensure OpenWA is running at `http://localhost:2785`.
2. In `backend/.env`, set:
   ```env
   OPENWA_BASE_URL=http://localhost:2785/api
   OPENWA_API_KEY=your_api_key_if_configured
   OPENWA_SESSION_NAME=pb08-taxi
   ```
3. Log in to the Admin Panel at `http://localhost:5173/admin`.
4. Navigate to **WhatsApp Settings**.
5. Click **Connect WhatsApp (Start Session)**.
6. The companion QR code will appear on screen.
7. Open WhatsApp on your phone ➔ **Linked Devices** ➔ **Link a Device** ➔ Scan the QR code.
8. Status will immediately switch to **Connected**!

*Note:* If OpenWA is not yet running locally, PB08 TAXI's intelligent fallback allows you to set `OPENWA_SIMULATOR_MODE=true` in `.env` to test all booking and promotional flows smoothly.

---

## 🗄️ Neon.tech PostgreSQL Configuration

1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech).
2. Copy your connection string from the Neon dashboard (e.g., `postgresql://username:password@ep-sample-1234.us-east-2.aws.neon.tech/pb08taxi?sslmode=require`).
3. Set `DATABASE_URL` in your backend `.env` (or in Render environment variables):
   ```env
   DATABASE_URL=postgresql://username:password@ep-sample-1234.us-east-2.aws.neon.tech/pb08taxi?sslmode=require
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   python seed.py
   ```
5. All customers, bookings, slider images, and WhatsApp logs will now persist securely on Neon.

---

## 🌐 Deployment Instructions

### 1. Deploy Backend to Render

1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Blueprint** (or **Web Service**).
3. If using **Blueprint**, connect your repo — Render will detect `backend/render.yaml` automatically.
4. If configuring manually as a **Web Service**:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
5. Configure Environment Variables in Render:
   - `DATABASE_URL`: Your Neon.tech PostgreSQL connection string.
   - `JWT_SECRET`: A secure random 64-character secret.
   - `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://pb08taxi.vercel.app`).
   - `OPENWA_BASE_URL`: Your hosted OpenWA Gateway URL.
   - `OPENWA_SESSION_NAME`: `pb08-taxi`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: Your strong admin password.
6. Click **Deploy**. Your backend will be live at `https://your-service.onrender.com`.

### 2. Deploy Frontend to Vercel

1. In [Vercel Dashboard](https://vercel.com), click **Add New** ➔ **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-service.onrender.com` (Your deployed Render backend URL).
5. Click **Deploy**.
6. Vercel will build and serve your site globally with SSL and SPA routing configured via `frontend/vercel.json`.

---

## 🔒 Security & Launch Checklist

- [x] **Password Hashing**: Strong bcrypt hashing for admin credentials.
- [x] **Rate Limiting**: SlowAPI protection on bookings and authentication endpoints.
- [x] **SQL Injection Defense**: SQLAlchemy 2.0 parameterized ORM queries.
- [x] **CORS Guard**: Strict origin filtering between frontend and backend.
- [x] **Consent Compliance**: Marketing consent explicitly captured and checked before sending promotional broadcasts.
- [x] **Deduplication**: Unique constraints prevent duplicate customer profiles.
- [x] **Non-Blocking Architecture**: Booking persistence is never blocked even if WhatsApp gateway has downtime.
