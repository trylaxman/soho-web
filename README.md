# SoHo Web

Premium end-to-end web platform for SoHo Cleaning Group.

Built for a luxury cleaning experience focused on Manhattan and NYC customers, this platform handles:

- Customer onboarding
- Professional onboarding
- Booking management
- Scheduling
- User dashboards
- Professional dashboards
- Admin operations
- Real-time workflows
- Premium UI/UX

---

# Tech Stack

## Frontend
- Next.js 15 (App Router)
- React
- TypeScript
- TailwindCSS

## Backend
- Next.js Server Actions / Route Handlers
- Prisma ORM
- Supabase PostgreSQL

## Authentication
- Supabase Auth

## Database
- PostgreSQL (Supabase)

## Deployment
- Vercel

---

# Features

## Customer Features
- User onboarding
- Instant cleaning request
- Booking management
- Real-time status updates
- Recurring cleaning setup
- Secure authentication

## Professional Features
- Professional onboarding
- Availability management
- Job assignments
- Earnings tracking
- Profile verification

## Admin Features
- Booking management
- Cleaner assignment
- Dashboard analytics
- Customer management
- Operations management

---

# Branding

SoHo Cleaning Group focuses on:

- Luxury experience
- Premium trust
- White-glove service
- Eco-friendly cleaning
- Manhattan-focused positioning

Design language:
- Black + Gold theme
- Elegant typography
- Minimal luxury UI

---

# Project Structure

```bash
app/
components/
lib/
prisma/
public/
styles/
types/
```

---

# Getting Started

## Install dependencies

```bash
npm install
```

---

## Setup environment variables

Create:

```bash
.env
```

Add:

```env
DATABASE_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

---

# Prisma

## Generate Prisma client

```bash
npx prisma generate
```

## Run migrations

```bash
npx prisma migrate dev
```

---

# Development

## Run local server

```bash
npm run dev
```

## Open

```bash
http://localhost:3000
```

---

# Deployment

## Recommended deployment

- Frontend: Vercel
- Database: Supabase

---

# Vision

Build the most trusted premium cleaning platform in NYC.

> “Pristine Spaces. Premium Care.”
