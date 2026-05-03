# Lumière By Sambita Bose — PRD

## Original Problem Statement
Build a premium, ultra-luxury landing page for "Lumière By Sambita Bose", a bespoke interior design atelier based in Rohini, Delhi. Tagline: *Elevate your Home, Celebrity Style*. Required: cinematic hero, about, services, portfolio with categories, why-choose-us, testimonials, lead capture form, contact + WhatsApp + map, footer. Aesthetic: black + ivory + antique gold, dark mode default, serif + sans pairing, micro-interactions, scroll animations.

## User Personas
- **High-net-worth homeowners** (Delhi/Mumbai/Bangalore) commissioning villas, penthouses, full-home interiors
- **Celebrities & public figures** seeking discreet, signature interior design
- **Premium clients** (founders, doctors, hospitality groups) wanting turnkey luxury

## Core Requirements (Static)
- Cinematic dark luxury aesthetic (black/ivory/gold; Playfair Display + Manrope)
- Sticky glassmorphism header with smooth-scroll nav
- Lead capture stored in MongoDB
- Mobile-first responsive
- Single-page experience with anchor sections

## What's Been Implemented (2026-04-30 → 2026-05-03)
- **Backend (FastAPI + MongoDB + Resend)**
  - `POST /api/leads` — Create lead with `source` tracking (site/popup_offer/main_form)
  - `GET /api/leads` — List leads, desc by created_at, _id excluded, includes source
  - Resend email notification on new lead (fire-and-forget, non-blocking) → studio@lumierebysambita.com
  - HTML luxury email template with all lead fields
  - Pydantic validation incl. EmailStr; email failures do not block lead save
- **Frontend (React + Tailwind + framer-motion)**
  - Preloader, sticky glassmorphism header with real LS logo (transparent PNG), mobile drawer
  - Hero with parallax, **offer pill** ("This Week · Flat 10% Off")
  - About section with founder award photo + S.B. monogram
  - Services — 6-card luxury grid
  - Portfolio — filterable bento masonry with lightbox
  - Why Choose Us — 4 animated counters
  - Testimonials slider
  - **Contact CTA with offer banner** + "Claim My 10% Offer" button
  - **EnquiryPopup** — auto-opens 8s after landing, shows studio image + offer + compact form; sessionStorage-gated
  - Footer with actual logo (not wordmark)
  - `/admin/leads` route — table with new **Source** column (site / popup_offer / main_form)
- **Testing**: iteration_1 + iteration_2 both 100% pass (backend 10/10 pytest, frontend flows all verified)

## Prioritized Backlog
- **P1** — Add basic auth/password gate on `/admin/leads`
- **P1** — Email notification on new lead (Resend or SendGrid integration)
- **P1** — Friendlier 422 error formatting in lead form
- **P2** — Rate limiting on `POST /api/leads`
- **P2** — CMS-driven portfolio (currently static in `data/content.js`)
- **P2** — Replace placeholder phone/email/Instagram with real brand handles
- **P3** — Optional luxury background music toggle
- **P3** — Press / Editorial section ("As Featured In")
- **P3** — Dedicated project case-study pages with deep-linkable URLs

## Next Tasks
- Provide real contact details (phone/WhatsApp/email/Instagram/address) to replace placeholders
- Decide on email-notification provider for new leads
- Consider adding Instagram feed embed for live social proof
