# EduGate
A backend API for a location-based school registration platform. EduGate replaces manual school application processes with a centralised digital system — allowing students to discover nearby schools, view school profiles, and apply online from a single platform.

---

## The Problem
Students and parents searching for schools navigate a fragmented process — visiting school websites individually, submitting paper applications, and having no visibility into their application status. EduGate consolidates school discovery and the registration process into one structured, accessible platform.

---

## What It Does
- **Location-based school discovery** — Returns schools relevant to the user's location so students see options available to them
- **School profiles** — Each school has a dedicated profile with information available for prospective applicants
- **Online registration** — Students submit applications digitally through the platform, replacing paper-based processes
- **Application tracking** — Applicants can track the status of their submitted applications
- **Admin dashboard** — Administrators manage schools, applications, and platform data from a centralised view
- **User authentication** — Secure account creation and login for students, schools, and administrators

---

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT |
| Frontend | In progress |

---

## System Architecture

```
Client (Frontend — in progress)
│
▼
REST API (Node.js + Express)
│
├── Auth Service (JWT)
├── School Discovery Service (location-based)
├── School Profile Service
├── Application & Registration Service
└── Admin Dashboard Service
│
▼
PostgreSQL Database
```
---

## Key Features

### Location-Based School Discovery
The API returns schools based on the user's location, surfacing relevant options without requiring manual searching across multiple sources.

### Online Registration
Students apply to schools directly through the platform. Applications are structured and consistent, replacing uncoordinated paper or email-based submissions.

### Application Tracking
Applicants have visibility into where their application stands at each stage of the process.

### Role-Based Access
| Role | Access |
|---|---|
| Administrator | Full platform access, school management, user oversight |
| School | Manage school profile, view and process incoming applications |
| Student / Applicant | Discover schools, submit applications, track status |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Installation
```bash
# Clone the repository
git clone https://github.com/andile593/EduGate.git
cd EduGate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your DATABASE_URL and JWT_SECRET

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## Roadmap
- [ ] Frontend (React) — school discovery UI, registration forms, applicant dashboard
- [ ] Application status notifications via email
- [ ] School search and filtering by grade, type, and proximity
- [ ] Document uploads for application submissions
- [ ] Analytics dashboard — application volumes and trends by school