# Doctor Tracker

> Online doctor appointments across Bangladesh, with a clinic workspace for admins and doctors.
> Bilingual (English / বাংলা) · three roles · slot booking with a 5-minute payment hold.
> Backend repository: [doctor-tracker-backend](https://github.com/sadatnuman/doctor-tracker-backend)

| | |
|---|---|
| **Live app** | _added after deployment_ |
| **Live API** | _added after deployment_ |
| **Admin** | `admin@doctortracker.com` / `Admin@12345` |
| **Doctor** | `doctor@doctortracker.com` / `Doctor@12345` (Dr. Ayesha Rahman) |
| **Patient** | `patient@doctortracker.com` / `Patient@12345` (Rafi Ahmed) |

All three accounts sign in on the same page, and each lands in its own area. The sign-in page also has one-click demo buttons.

> **Access:** the admin portal (`/admin`) and the doctor workspace (`/doctor`) are sign-in only, as the brief requires. The landing page and doctor directory are the public, patient-facing booking site; a patient needs an account only to book.

![Landing page](docs/screenshots/desktop-landing.png)

---

## Description

Hospitals keep their rosters of doctors and the hundreds of patients each doctor looks after in spreadsheets that can't answer simple questions such as _"who is overloaded?"_, while patients still phone a front desk to find a free slot. **Doctor Tracker** gives administrators one secure, sign-in-only portal to keep the doctor roster and every patient record current, with fast search, filters and pagination over thousands of records and a dashboard that turns caseload, conditions, admissions, bookings and revenue into insights. Doctors get their own workspace for their schedule, bookings and patient list, and patients can browse doctors by specialty and book a slot that is held for five minutes while they pay. Everything works in English and Bangla. This repository is the **Next.js frontend**; it talks to a standalone Express + MongoDB REST API.

## Features

### By role

| Role | Area | What they can do |
|---|---|---|
| Visitor | `/{lang}`, `/{lang}/doctors`, `/{lang}/specialties/*` | Landing page, doctor directory (search, specialty, hospital, fee, day and sort filters), 24 specialty pages, doctor profiles with live slot availability. |
| Patient | `/{lang}/account` | Register or sign in **only when booking**, pick a slot, pay within 5 minutes (card, bKash or Nagad, simulated), see receipts, cancel with refund, edit profile and photo. |
| Doctor | `/{lang}/doctor` | Today's schedule and month stats, appointments (mark completed), their own patient list, consulting days, hours and slot length, profile and photo. |
| Admin | `/{lang}/admin` | Dashboard, doctor CRUD (with a sign-in account per doctor), doctor profile with their patients (add or remove), patients page (edit, reassign, delete), all appointments, profile. |

### Highlights

- **One sign-in, three roles.** Role-based route guards run in `proxy.ts` before anything renders, and a role gate in each area layout checks again. The API enforces RBAC and row-level scope on every request.
- **Sessions.**
  - A 15-minute access token plus a rotating 7-day refresh token, both in httpOnly cookies.
  - When a token expires, the client refreshes silently and replays the request.
  - "Sign out everywhere" is available.
- **Booking you can't double-book.**
  - Choosing a slot creates a `pending_payment` hold with a live countdown.
  - Paying confirms the appointment and adds the patient to that doctor's patient list.
  - An unpaid hold is released to everyone after 5 minutes.
- **English and Bangla.**
  - `/en` and `/bn` routes with typed dictionaries.
  - Numbers, dates, times and money (৳) are formatted through `Intl` in `bn-BD`, which also gives Bengali digits.
  - The language switcher keeps you on the same page.
- **Technical SEO:**
  - Per-page titles and descriptions, canonical URLs and `hreflang` (en, bn-BD, x-default).
  - JSON-LD: WebSite with SearchAction, MedicalOrganization, FAQPage, BreadcrumbList and Physician with opening hours.
  - `sitemap.xml` with language alternates, `robots.txt` that keeps private areas out, and one H1 per page.
  - **Link previews:** a 1200 × 630 thumbnail for every shared link on LinkedIn, Facebook, WhatsApp and X. The site has its own card, and each doctor gets a generated card with name, specialty, hospital, hours and fee.
  - Specialty landing pages for keyword targeting, and internal links through the footer, specialty chips and related doctors.
- **Profile pictures** for every role. The image is cropped to a square and resized to 256 px WebP in the browser before upload, and it shows on doctor profiles, cards and tables.
- **Dashboard:**
  - Headline figures, including online bookings and revenue.
  - Admissions trend drawn as a monitor trace, plus top-10 caseloads, condition mix, a status band, age groups and roster by specialty.
  - Every chart has a table view.
- **UX details:**
  - Filters are synced to the URL.
  - Skeletons, empty and error states, optimistic deletes, and server validation errors shown on the matching field.
  - A show-password toggle on every password field, light and dark themes, reduced-motion support, and a notice while the free-tier server wakes up.
- **Responsive.** A sidebar on desktop and a drawer on mobile; tables become cards and filters move to a bottom sheet below 768 px.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Cache Components / Partial Prerendering, `proxy.ts`, `next/root-params`) + React 19 |
| Language | TypeScript (strict) |
| UI | **Tailwind CSS 4** + **shadcn/ui** (Radix primitives), lucide icons |
| Type | **Inter** across the app, with Noto Sans Bengali for Bangla glyphs (Inter has none) |
| Server state | **TanStack Query 5** |
| URL state | **nuqs** (type-safe search params) |
| Forms | react-hook-form + **Zod 4** (schemas mirror the API's, messages localized) |
| Charts | Recharts 3 via shadcn charts (lazy-loaded) |
| Auth check | `jose` (JWT verification in the proxy) |

## Setup guide

**Prerequisites:**
- Node.js 20 or newer.
- The [API](https://github.com/sadatnuman/doctor-tracker-backend) running locally (default `http://localhost:4000`) with demo data seeded (`npm run seed` in the API repo).

```bash
# 1. Clone and install
git clone https://github.com/sadatnuman/doctor-tracker-frontend.git
cd doctor-tracker-frontend
npm install

# 2. Configure environment
cp .env.example .env.local
#    API_URL     = where the API runs (http://localhost:4000)
#    JWT_SECRET  = exactly the same value as the API's JWT_SECRET

# 3. Run
npm run dev                # http://localhost:3000  (redirects to /en or /bn)
# or a production build
npm run build && npm start
```

### Environment variables

See [`.env.example`](./.env.example).

| Variable | Required | Description |
|---|---|---|
| `API_URL` | ✅ | Base URL of the Express API. `/api/*` is rewritten to `${API_URL}/api/*`. Also used on the server to prerender public pages. |
| `JWT_SECRET` | ✅ | Same secret as the API. It lets `src/proxy.ts` verify the access token and its role before rendering. |
| `NEXT_PUBLIC_SITE_URL` | | Canonical origin for canonical URLs, sitemap and structured data. On Vercel it defaults to the production URL. |
| `NEXT_PUBLIC_DEMO_LOGINS` | | Optional. `email:password` pairs for admin, doctor and patient, comma-separated. Shows one-click demo sign-in buttons. |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (type-checks and prerenders public pages and static shells) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run test:e2e` | Playwright end-to-end tests (needs the API running with demo data; set `E2E_BASE_URL` to test a deployment) |

### End-to-end tests

`npm run test:e2e` runs 17 Playwright tests on desktop and mobile Chrome:
- Route protection for every role, and a 401 from the API without a session.
- The full booking journey: visitor picks a slot, signs in, holds it, a declined card keeps the hold, bKash pays, the receipt appears, and cancelling refunds.
- Locale redirects, Bangla rendering, directory search, canonical and hreflang tags, `robots.txt`, `sitemap.xml` and the link-preview image.

The booking test cancels its appointment at the end, so it can run repeatedly against the demo data.

### Trying the booking flow

1. Open a doctor's profile and pick a free slot, then choose **Sign in to book**.
2. Sign in as the patient and add a reason. You'll see the **payment page** with a 4:59 countdown.
3. Pay with a test card (`4242 4242 4242 4242`, any future expiry, any CVC), or with bKash or Nagad (any 11-digit `01…` mobile number and a 4–6 digit PIN). The card `4000 0000 0000 0002` is declined and keeps your hold.
4. Your receipt appears. Sign in as the doctor to see the booking and the new patient on their list.

No real money moves: payments run through a simulated gateway on the API.

## System architecture

```mermaid
flowchart LR
    B[Browser] -->|page request| P[proxy.ts<br/>locale + role guard]
    P -->|public page| PUB[Prerendered / cached<br/>server components]
    P -->|right role| WS[Workspace shell<br/>+ client components]
    P -->|no session| L[/lang/login?next=…/]
    P -->|wrong role| H[that role's home]
    PUB -->|'use cache' fetch| A
    WS -->|TanStack Query /api/*| R[Next.js rewrite]
    R -->|same request, cookies attached| A[Express API on Render]
    A --> M[(MongoDB Atlas)]
```

1. **Every page request** first goes through `src/proxy.ts`.
   - It redirects paths without a language prefix to `/en` or `/bn`, choosing from the saved choice, then the browser language, then English.
   - For `/admin`, `/doctor` and `/account` it verifies the access-token cookie (signature, issuer, audience, role). Signed-out visitors go to sign-in with `?next=`. A signed-in user in the wrong area goes to their own home.
2. **Public pages are server components.** They fetch through `'use cache'` functions with a revalidation lifetime, so the landing page, directory, profiles and specialty pages ship as HTML for crawlers. Specialty pages are fully static.
3. **Workspaces are static shells with client views.** Those views read their state from the URL (nuqs) and their data through TanStack Query.
4. **Data requests go to `/api/*` on the app's own origin.** `next.config.ts` rewrites them to the API, so session cookies are first-party.
5. **An expired access token** gets one silent refresh, shared by every request in the tab, and then the original request is replayed. A failed refresh sends the user to sign-in.

👉 More detail is in **[ARCHITECTURE.md](./ARCHITECTURE.md)**: rendering, i18n, SEO, sessions, the booking flow, state model, caching rules, components, performance, accessibility and the design system.

## Technical decisions

### 1. TanStack Query + URL state (nuqs) instead of Redux or Context

Almost all of this app's state is **server state** (doctors, patients, slots, appointments, stats) plus **view state** (which page, which filters). Neither belongs in Redux or React Context:

- **Server state needs a cache, not a store.**
  - With Redux, every list would need hand-written loading, error and success actions, normalization, refetch-on-mutation logic and request de-duplication. TanStack Query does all of that by default.
  - Each resource has one `useQuery`, keyed by its params. A request that's no longer needed is cancelled through `AbortSignal`.
  - `placeholderData` keeps the current page visible while the next one loads, so the table doesn't flicker.
  - Hierarchical keys make invalidation precise. Paying for a booking refreshes slots, appointments, the doctor's overview and the stats, and nothing else.
- **View state belongs in the URL.** Filters, search, sort and page live in search params through `nuqs`, with typed parsers. Every view is therefore **shareable and bookmarkable** and survives a refresh, and the back button undoes a filter change. Context and Redux need extra syncing code for each of those.
- **Context re-render cost.** A Context holding filters re-renders every consumer on each keystroke. Here the search box keeps keystrokes local and commits to the URL after 300 ms of idle typing. A list re-renders once per *search*, not once per *character*.

What's left is tiny UI state, such as which dialog is open, kept in `useState` next to the component that owns it. The result is no global store at all, and less code.

### 2. httpOnly cookie sessions behind a same-origin rewrite instead of tokens in localStorage

The usual SPA approach keeps the JWT in `localStorage` and sends it as a header. That has two problems:
- Any injected script can read the token, so one XSS bug means account takeover.
- The frontend server can't see the session, so protected pages render first and redirect afterwards.

Instead, the API sets two **httpOnly** cookies (`Secure` and `SameSite=Lax` in production):
- A short-lived **access token** (15 minutes, a signed JWT that carries the role).
- An opaque **refresh token** (7 days). It is stored on the server only as a hash, rotated on every use and revoked as a family if an old one is replayed.

The frontend (Vercel) and the API (Render) live on different domains. A direct call would make these **third-party cookies**, which browsers increasingly block. So `next.config.ts` **rewrites `/api/*` to the API**: the browser only ever talks to the frontend's own origin, the cookies are first-party, and no CORS preflights are needed.

Because the access cookie arrives with every page request, `src/proxy.ts` can verify it with `jose` and route by **role** before rendering. Nobody sees a flash of the admin area they aren't allowed in. The API still checks every request, including role and row-level scope: the proxy is the UX layer, and the API is the security boundary.

Scripts can't read httpOnly cookies. So the API also sets a non-secret `dt_session=1` hint cookie that only tells the client "a session might exist". Visitors who have never signed in therefore never trigger a pointless `/auth/me` or refresh call.

## Visual evidence

### Desktop

| Landing page | Landing page (বাংলা) |
|---|---|
| ![Landing](docs/screenshots/desktop-landing.png) | ![Landing in Bangla](docs/screenshots/desktop-landing-bn.png) |

| Doctor directory | Specialty page |
|---|---|
| ![Directory](docs/screenshots/desktop-directory.png) | ![Specialty](docs/screenshots/desktop-specialty.png) |

| Doctor profile with slots | Sign in (all roles) |
|---|---|
| ![Doctor profile](docs/screenshots/desktop-doctor-profile.png) | ![Sign in](docs/screenshots/desktop-login.png) |

| Payment (5-minute hold) | Receipt |
|---|---|
| ![Payment](docs/screenshots/desktop-payment.png) | ![Receipt](docs/screenshots/desktop-receipt.png) |

| Patient: my appointments | Profile with photo |
|---|---|
| ![My appointments](docs/screenshots/desktop-my-appointments.png) | ![Profile](docs/screenshots/desktop-profile.png) |

| Doctor: overview | Doctor: appointments (বাংলা) |
|---|---|
| ![Doctor overview](docs/screenshots/desktop-doctor-overview.png) | ![Doctor appointments in Bangla](docs/screenshots/desktop-doctor-appointments-bn.png) |

| Doctor: schedule | Register (বাংলা) |
|---|---|
| ![Doctor schedule](docs/screenshots/desktop-doctor-schedule.png) | ![Register in Bangla](docs/screenshots/desktop-register-bn.png) |

| Admin: dashboard | Admin: doctors |
|---|---|
| ![Admin dashboard](docs/screenshots/desktop-admin-dashboard.png) | ![Admin doctors](docs/screenshots/desktop-admin-doctors.png) |

| Admin: doctor profile and patients | Admin: patients |
|---|---|
| ![Admin doctor detail](docs/screenshots/desktop-admin-doctor-detail.png) | ![Admin patients](docs/screenshots/desktop-admin-patients.png) |

| Admin: appointments | Dark theme: dashboard |
|---|---|
| ![Admin appointments](docs/screenshots/desktop-admin-appointments.png) | ![Dark dashboard](docs/screenshots/desktop-dark-admin-dashboard.png) |

| Dark theme: landing (বাংলা) | |
|---|---|
| ![Dark landing in Bangla](docs/screenshots/desktop-dark-landing-bn.png) | |

### Mobile

| Landing | Landing (বাংলা) | Directory |
|---|---|---|
| <img src="docs/screenshots/mobile-landing.png" width="260" alt="Mobile landing"> | <img src="docs/screenshots/mobile-landing-bn.png" width="260" alt="Mobile landing in Bangla"> | <img src="docs/screenshots/mobile-directory.png" width="260" alt="Mobile directory"> |

| Doctor profile | Sign in | Payment |
|---|---|---|
| <img src="docs/screenshots/mobile-doctor-profile.png" width="260" alt="Mobile doctor profile"> | <img src="docs/screenshots/mobile-login.png" width="260" alt="Mobile sign in"> | <img src="docs/screenshots/mobile-payment.png" width="260" alt="Mobile payment"> |

| Receipt | My appointments | Doctor overview |
|---|---|---|
| <img src="docs/screenshots/mobile-receipt.png" width="260" alt="Mobile receipt"> | <img src="docs/screenshots/mobile-my-appointments.png" width="260" alt="Mobile my appointments"> | <img src="docs/screenshots/mobile-doctor-overview.png" width="260" alt="Mobile doctor overview"> |

| Admin dashboard | | |
|---|---|---|
| <img src="docs/screenshots/mobile-admin-dashboard.png" width="260" alt="Mobile admin dashboard"> | | |

## Project structure

```
src/
├─ app/
│  ├─ [lang]/                    every route is prefixed with /en or /bn
│  │  ├─ (public)/               landing, doctors directory + [id] profile, specialties/[slug]
│  │  ├─ (auth)/                 login, register (one sign-in for every role)
│  │  ├─ account/                patient area: appointments, appointments/[id] (pay / receipt), profile
│  │  ├─ doctor/                 doctor area: overview, appointments, patients, schedule, profile
│  │  ├─ admin/                  admin area: dashboard, doctors (+ [id]), patients, appointments, profile
│  │  └─ layout.tsx              fonts (Inter + Noto Sans Bengali), <html lang>, providers
│  ├─ sitemap.ts · robots.ts · manifest.ts · icon.svg
│  └─ globals.css                design tokens (light/dark), chart paper, trace animation
│  ├─ [lang]/opengraph-image.tsx link-preview card (doctor profiles have their own)
├─ proxy.ts                      locale routing + role-based route protection
├─ i18n/                         config, typed en/bn dictionaries, server + client helpers
├─ components/
│  ├─ ui/                        shadcn/ui primitives
│  ├─ public/                    site nav/footer, doctor card, directory + filters, booking panel
│  ├─ appointments/              lists per role, hold countdown, payment form, detail/receipt
│  ├─ doctor-area/               doctor overview, my patients, my schedule
│  ├─ profile/                   profile form, avatar uploader
│  ├─ layout/                    workspace shell, sidebars per role, header, user menu, cold-start notice
│  ├─ data/                      search, filter bar, selects, date range, sort, pagination
│  ├─ common/                    password input, avatar, role gate, language switcher, badges, dialogs, states
│  ├─ doctors/ · patients/       admin roster and patient management
│  └─ dashboard/                 dashboard view, chart panel, lazy-loaded charts
├─ hooks/                        data hooks (auth, doctors, patients, appointments, overview), media hooks
└─ lib/                          API client, server fetchers, site/SEO helpers, formatters, validators, types
e2e/                             Playwright tests (access, booking, public site and SEO)
assets/fonts/                    Inter files for the link-preview images
```

## Deployment

Deployed on **Vercel** from the `main` branch. In the Vercel project's environment variables, set:
- `API_URL`: the Render URL.
- `JWT_SECRET`: the same value as the API.
- `NEXT_PUBLIC_DEMO_LOGINS`: optional; shows the demo sign-in buttons.

`NEXT_PUBLIC_SITE_URL` only needs to be set when using a custom domain. On the API side, `CLIENT_ORIGIN` must be set to the Vercel URL.

Order matters:
1. Deploy the API first, and open its `/api/health` once so it's awake. The build prerenders public pages from the API; a sleeping API doesn't break the build, but those pages start empty until they revalidate.
2. Deploy the frontend, then set the API's `CLIENT_ORIGIN` to the Vercel URL.
3. Check a shared link with LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/). It also refreshes LinkedIn's cached preview after a change.

## Branching

`develop` receives day-to-day work. Changes reach `main` (production) through reviewed pull requests.
