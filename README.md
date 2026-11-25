<div align="center">

<h1>ThreadForge</h1>

<p><strong>Open-source clothing brand mockup platform built with Next.js 14</strong></p>

<p>
  Generate photorealistic garment mockups, manage your brand kit, build lookbooks, and export print-ready assets — without Photoshop.
</p>

<p>
  <a href="https://github.com/zyadhajaji/threadforge/actions/workflows/ci.yml">
    <img src="https://github.com/zyadhajaji/threadforge/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

<p>
  <a href="#-demo">Demo</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Stack</a> ·
  <a href="#-getting-started">Quick Start</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

---

## What is ThreadForge?

ThreadForge is a **full-stack SaaS boilerplate** for building clothing brand mockup tools. It ships with a Fabric.js canvas editor, multi-brand management, Stripe subscriptions, Cloudinary image storage, and Clerk authentication — all wired together and ready to deploy to Vercel.

**Built for:**
- 🧢 Streetwear and clothing brands that need fast, clean mockups
- 🛍️ Print-on-demand sellers (Printful, Printify, etc.)
- 🏷️ Fashion startups building their first lookbook
- 👩‍💻 Developers who want a production-ready Next.js SaaS starter with Stripe + Prisma

---

## Demo mode (zero config)

ThreadForge boots into a **demo workspace** when no credentials are present — no database,
no Clerk account, no Cloudinary and no Stripe keys required:

```bash
cd apps/web
npm install
npm run dev          # http://localhost:3000
```

That gives you the marketing site, the mockup editor (Fabric.js on locally generated garment
artwork), brand kits, collections, exports and the billing screen, all backed by an in-memory
sample workspace. Edits persist until the dev server restarts.

Demo mode turns on automatically when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing, or
explicitly with `NEXT_PUBLIC_DEMO_MODE=1`. Add real credentials (see below) and the exact same
code paths read from Postgres, Clerk, Cloudinary and Stripe instead.

---

## Features

### Mockup Editor
- Fabric.js canvas with text, image, layer and transform controls
- Garment templates with a mapped printable area (and a dashed on-canvas guide)
- Switch garments without losing your artwork; artwork is serialised as JSON and re-editable
- Single-keyboard-friendly toolbar: text size, bold/italic, layer order, delete

### Brand Kit Management
- Create unlimited brands under one account (Pro/Studio plans)
- Store logos, hex color palettes, and font choices per brand
- One-click brand switching when creating mockups

### Collections & Lookbooks
- Group mockups into seasonal drops or lookbook collections
- Shareable collection pages for buyers and wholesale clients
- Custom cover image per collection

### Export & Asset Delivery
- PNG and WebP export at 2.5× resolution (2000 px) straight from the canvas
- Every export is recorded in the `Export` table with format, size and URL
- Optimised, durable export URLs via Cloudinary CDN

### Subscriptions & Billing
- Free / Pro / Studio tiers via Stripe Checkout + Billing Portal
- Usage meters against each plan's limits
- Stripe webhook handler keeps `Subscription` rows and `User.plan` in sync

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Server components, streaming, file-based routing |
| Language | **TypeScript 5** | End-to-end type safety |
| Styling | **Tailwind CSS + shadcn-style UI** | Utility-first + accessible Radix primitives |
| Canvas | **Fabric.js 6** | Modern promise-based API, tree-shakeable build |
| ORM | **Prisma 5** | Type-safe PostgreSQL queries + migrations |
| Database | **PostgreSQL** | Relational, works with Neon / Supabase / Railway |
| Auth | **Clerk** | Drop-in auth with social login, orgs, webhooks |
| Storage | **Cloudinary** | Image upload, CDN, and on-the-fly transforms |
| Payments | **Stripe** | Checkout, webhooks, subscription management |
| Email | **Resend** | Transactional email with React templates |
| Deployment | **Vercel** | Zero-config Next.js deployment |
| State | **Zustand** | Lightweight client state for the canvas editor |
| Validation | **Zod** | Runtime schema validation for all API inputs |

---

## Project Structure

```
threadforge/
├── CLAUDE.md                    # AI agent context (Claude Code / design tools)
├── .env.example                 # All required env vars with descriptions
├── .github/
│   ├── workflows/ci.yml         # Lint + typecheck + build on every push
│   └── ISSUE_TEMPLATE/
└── apps/
    └── web/                     # Next.js 14 application
        ├── prisma/
        │   ├── schema.prisma    # Full data model
        │   └── seed.ts          # Garment template rows
        ├── scripts/
        │   └── generate-assets.mjs  # builds public/templates + public/mockups SVGs
        ├── public/
        │   ├── templates/           # blank garment artwork (generated)
        │   └── mockups/             # sample designed mockups (generated)
        └── src/
            ├── app/
            │   ├── (auth)/              # Clerk sign-in / sign-up
            │   ├── (dashboard)/         # Authenticated app shell
            │   │   └── dashboard/       # → /dashboard/*
            │   │       ├── mockups/     # Mockup grid
            │   │       ├── brands/      # Brand kit management
            │   │       ├── collections/ # Lookbooks
            │   │       ├── editor/      # Canvas editor (new + [id])
            │   │       └── settings/    # Account, usage + billing
            │   ├── (marketing)/         # Landing page, pricing
            │   └── api/                 # REST endpoints + webhooks
            ├── components/
            │   ├── ui/                  # Button, Dialog, Dropdown, Card, Input…
            │   ├── editor/              # canvas, toolbar, editor shell
            │   ├── mockup/              # MockupCard
            │   ├── brand/               # CreateBrand dialog
            │   ├── collection/          # CreateCollection dialog
            │   ├── template/            # TemplateGallery (filterable)
            │   └── shared/              # UploadZone
            ├── hooks/useEditor.ts       # Zustand editor store
            └── lib/
                ├── env.ts               # demo-mode + capability flags
                ├── auth.ts              # Clerk ⇄ Prisma user resolution
                ├── data.ts              # server data access (demo | Prisma)
                ├── demo-data.ts         # in-memory sample workspace
                ├── db.ts                # Prisma singleton
                ├── editor.ts            # canvas serialisation helpers
                ├── preview.ts           # dataURL → stored preview
                ├── cloudinary.ts        # upload + URL helpers
                ├── stripe.ts            # lazy Stripe client + plan definitions
                ├── validations.ts       # Zod schemas for all inputs
                └── utils.ts             # cn(), slugify(), formatBytes()
```

---

## Data Model

```
User
 ├── Brand[]           → logo, colors, fonts per clothing label
 │    └── Mockup[]    → canvas designs referencing a Template
 ├── Collection[]      → lookbooks grouping multiple mockups
 ├── Export[]          → download history (PNG / WebP / PDF)
 └── Subscription      → Stripe plan (FREE / PRO / STUDIO)

Template              → seeded garment library (tees, hoodies, hats …)
 ├── imageUrl          → Cloudinary URL of blank garment photo
 ├── maskUrl           → compositing mask for design placement
 └── designArea        → JSON bounding box { x, y, width, height }
```

---

## Getting Started

> **Just want to click around?** Skip to the [demo mode](#demo-mode-zero-config) instructions —
> `npm install && npm run dev` is enough.

### Prerequisites

- **Node.js 20+**
- **PostgreSQL** — local, [Neon](https://neon.tech) (free tier), [Supabase](https://supabase.com), or [Railway](https://railway.app)
- Accounts (all have free tiers): [Clerk](https://clerk.com) · [Cloudinary](https://cloudinary.com) · [Stripe](https://stripe.com)

### 1 — Clone

```bash
git clone https://github.com/zyadhajaji/threadforge.git
cd threadforge
```

### 2 — Environment

```bash
cp .env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in all values. Every variable is documented in [`.env.example`](.env.example).

### 3 — Install & run

```bash
cd apps/web
npm install
npx prisma generate       # downloads the query engine and generates the client
npx prisma migrate dev    # applies migrations against DATABASE_URL
npm run db:seed           # seeds the garment template library
npm run dev               # http://localhost:3000
```

### Useful commands

```bash
npm run typecheck         # tsc --noEmit — run before every commit
npm run lint              # ESLint (next lint)
npm run assets            # regenerate public/templates + public/mockups SVGs
npx prisma studio         # GUI database browser at localhost:5555
npx prisma migrate reset  # wipe + re-migrate (dev only)
```

---

## Roadmap

- [x] Prisma schema — User, Brand, Template, Mockup, Collection, Export, Subscription
- [x] Fabric.js canvas editor components
- [x] API routes — mockups (+ `[id]`), brands, collections, templates, export, upload
- [x] Cloudinary + Stripe + Clerk wiring
- [x] Landing page + pricing + dashboard shell + CI pipeline
- [x] Clerk webhook → sync sign-ups to the `User` table
- [x] Editor page (`/dashboard/editor/[id]` + `/new`) wiring canvas, toolbar and store
- [x] Brands & Collections dashboard pages
- [x] Stripe Checkout upgrade flow + billing settings
- [x] Zero-config demo mode with generated garment artwork
- [ ] Dark mode toggle (ThemeProvider)
- [ ] AI-powered design placement suggestions
- [ ] Bulk mockup generation (one design × multiple colorways)
- [ ] Shopify integration — push mockups directly to product listings
- [ ] Printful / Printify integration
- [ ] Shareable lookbook public URLs
- [ ] Headless mockup generation API

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes following the [commit convention](CLAUDE.md#commit-conventions)
4. Open a pull request

---

## License

[MIT](LICENSE) — free to use, fork, and build on.

---

<div align="center">

**Keywords:** clothing mockup generator · t-shirt mockup tool · apparel mockup SaaS · fashion brand mockup · print-on-demand mockup · streetwear mockup · Next.js SaaS boilerplate · Fabric.js canvas editor · brand kit management · garment mockup · lookbook builder · mockup generator open source

</div>
