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

## What's Been Implemented (2026-04-30)
- **Backend (FastAPI + MongoDB)**
  - `POST /api/leads` — Create lead (name, phone, email, project_type, message)
  - `GET /api/leads` — List leads, desc by created_at, _id excluded
  - Pydantic validation incl. EmailStr
- **Frontend (React + Tailwind + framer-motion)**
  - Preloader with gold reveal animation
  - Sticky header (glassmorphism) + mobile drawer
  - Hero with parallax background, staggered text reveal, 2 CTAs
  - About with split layout, signature quote, founding-year badge
  - Services — 6-card luxury grid with hover icon micro-interactions
  - Portfolio — filterable bento masonry (5 categories), lightbox modal
  - Why Choose Us — 4 animated counters (useInView)
  - Testimonials — slider with prev/next
  - Contact CTA — full lead form (sonner toast feedback) + studio details + WhatsApp CTA + dark-styled Google Maps embed
  - Footer — giant brand wordmark + social links
  - `/admin/leads` route — table view of all submissions
- **Testing**: 100% backend (8/8 pytest), 100% frontend flows verified by testing agent (iteration_1.json)

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
