# ThreadForge — Claude Context

This file is the single source of truth for any Claude agent (Claude Code, Claude design tools, or AI assistants) working on this repo. Read it fully before writing or editing anything.

---

## What this project is

**ThreadForge** is a niche SaaS platform for clothing brands. It lets them:
- Place designs on photorealistic garment templates using a canvas editor
- Manage their brand kit (logos, colors, fonts) per brand
- Organize mockups into collections / seasonal drops
- Export print-ready or digital assets (PNG, WebP, PDF)
- Subscribe to Pro or Studio plans via Stripe

Target users: small-to-mid clothing brands, streetwear labels, print-on-demand sellers.

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Canvas editor | Fabric.js | 6 |
| ORM | Prisma | 5 |
| Database | PostgreSQL | any |
| Auth | Clerk | 5 |
| Storage + CDN | Cloudinary | 2 |
| Payments | Stripe | latest |
| Email | Resend | 3 |
| State (client) | Zustand | 4 |
| Validation | Zod | 3 |
| Deployment | Vercel | — |

---

## Directory structure

```
threadforge/
├── CLAUDE.md                        ← you are here
├── .env.example                     ← all required env vars with descriptions
├── .github/
│   ├── workflows/ci.yml             ← lint + typecheck + build on push/PR
│   └── ISSUE_TEMPLATE/
└── apps/
    └── web/                         ← the Next.js application (primary workspace)
        ├── prisma/
        │   ├── schema.prisma        ← canonical data model, edit this first
        │   └── seed.ts              ← seeds template rows (clothing garments)
        ├── scripts/
        │   └── generate-assets.mjs  ← writes the SVG garment + mockup artwork
        ├── public/
        │   ├── templates/           ← blank garment SVGs (generated, committed)
        │   └── mockups/             ← sample designed mockups (generated, committed)
        └── src/
            ├── app/
            │   ├── (auth)/          ← Clerk sign-in / sign-up pages
            │   ├── (dashboard)/     ← authenticated app shell
            │   │   ├── layout.tsx   ← sidebar nav, UserButton
            │   │   └── dashboard/   ← URL segment, so pages are /dashboard/*
            │   │       ├── mockups/     ← main grid of user's mockups
            │   │       ├── brands/      ← brand kit management
            │   │       ├── collections/ ← lookbooks / drops
            │   │       ├── editor/      ← Fabric.js editor (/new and /[id])
            │   │       └── settings/    ← account, usage, billing
            │   ├── (marketing)/     ← public landing page, pricing, about
            │   └── api/
            │       ├── mockups/     ← GET list, POST create
            │       ├── brands/      ← GET list, POST create
            │       ├── templates/   ← GET list (no auth required)
            │       ├── collections/ ← GET list, POST create
            │       ├── mockups/[id]/ ← GET / PATCH / DELETE
            │       ├── export/      ← canvas snapshot → Cloudinary → Export row
            │       ├── upload/      ← POST base64 → Cloudinary
            │       ├── stripe/{checkout,portal}/
            │       └── webhooks/{stripe,clerk}/
            ├── components/
            │   ├── ui/              ← shadcn/ui primitives only (Button, Dialog, etc.)
            │   ├── editor/          ← Fabric.js canvas, toolbar, color picker, layers panel
            │   ├── mockup/          ← MockupCard, MockupGrid, MockupViewer
            │   ├── brand/           ← BrandCard, BrandKit, ColorPalette
            │   ├── template/        ← TemplateGallery (filterable), TemplateCard
            │   └── shared/          ← UploadZone, Navbar, Sidebar
            ├── lib/
            │   ├── env.ts           ← demo-mode + capability flags (isDemoMode, hasStripe…)
            │   ├── auth.ts          ← Clerk ⇄ Prisma user resolution (getCurrentUser)
            │   ├── data.ts          ← server data access — demo store or Prisma
            │   ├── demo-data.ts     ← in-memory sample workspace for demo mode
            │   ├── editor.ts        ← canvas serialisation + download helpers
            │   ├── preview.ts       ← dataURL → stored preview URL
            │   ├── db.ts            ← singleton Prisma client
            │   ├── cloudinary.ts    ← upload, delete, URL helpers
            │   ├── stripe.ts        ← Stripe client + PLANS constant
            │   ├── validations.ts   ← all Zod schemas (source of truth for shapes)
            │   └── utils.ts         ← cn(), slugify(), formatBytes(), absoluteUrl()
            ├── hooks/useEditor.ts   ← Zustand editor store (name, status, dirty flags)
            └── types/
                └── index.ts         ← re-exports Prisma types + composite types
```

---

## Data model (Prisma)

Read `apps/web/prisma/schema.prisma` for the full schema. Key relationships:

```
User (Clerk identity)
  ├── Brand[]           — one user → many brands (streetwear labels, etc.)
  │     └── Mockup[]   — one brand → many mockups
  ├── Mockup[]          — mockups can also exist without a brand
  │     ├── Template    — every mockup references one garment template
  │     ├── Export[]    — download history (PNG/WebP/PDF)
  │     └── CollectionMockup[] — join table (many-to-many with Collection)
  ├── Collection[]      — lookbooks / seasonal drops
  └── Subscription      — Stripe subscription (one-to-one)

Template                — seeded rows, not user-created
  ├── category: TemplateCategory enum (TSHIRT, HOODIE, HAT, …)
  ├── imageUrl          — Cloudinary URL of the blank garment photo
  ├── maskUrl           — PNG mask for compositing the design layer
  └── designArea        — JSON { x, y, width, height, rotation } in canvas coords
```

When adding a new model or field: edit `schema.prisma` → run `npx prisma migrate dev --name <slug>` → update `src/types/index.ts` if a composite type is needed.

---

## Demo mode vs connected mode

`src/lib/env.ts` exposes `isDemoMode`, which is `true` when
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing or `NEXT_PUBLIC_DEMO_MODE=1`.

- **Connected mode** — Clerk auth, Prisma/Postgres, Cloudinary uploads, Stripe billing.
- **Demo mode** — no credentials needed. `lib/demo-data.ts` holds an in-memory workspace
  (templates, brands, collections, mockups, exports) that survives hot reloads via
  `globalThis`; `lib/data.ts` reads from it instead of Prisma.

Rules when adding a feature:

1. Never import `./db` or `@clerk/nextjs/server` at module scope in shared code — import them
   dynamically inside the connected-mode branch, otherwise demo mode (and builds without a
   generated Prisma client) break.
2. Pages call helpers from `lib/data.ts`; API routes call `getCurrentUser()` first.
3. Anything that persists must handle both modes (see `/api/mockups/[id]`).

## Auth pattern

```ts
import { getCurrentUser } from "@/lib/auth";

const user = await getCurrentUser();       // demo user, or Clerk → Prisma user
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

`getCurrentUser()` resolves the Clerk id, finds the `User` row, and creates it from the Clerk
profile if the webhook has not fired yet. The `User.clerkId` column is the bridge between Clerk
and the database — never use Clerk's `userId` as a relation key; resolve to `User.id` (cuid).

`/api/webhooks/clerk` keeps the table in sync for `user.created`, `user.updated` and
`user.deleted`.

---

## API conventions

- All API routes live under `src/app/api/`
- Routes return `{ success: true, data: T }` or `{ success: false, error: string | ZodFlatten }`
- Validate request bodies with Zod schemas from `src/lib/validations.ts` — never validate inline
- Always authenticate first, then validate, then query
- Use `NextResponse.json()` with explicit status codes (201 for creates, 422 for validation errors, 401 for auth)

---

## Canvas editor

The mockup editor lives in `src/components/editor/` and `src/app/(dashboard)/editor/`.

- **Library:** Fabric.js 6 — `FabricImage`, `FabricText`, promise-based `loadFromJSON` and
  `FabricImage.fromURL(url, { crossOrigin })`
- **Canvas state** is serialised with `serializeCanvas()` (`src/lib/editor.ts`) into
  `Mockup.canvasJson`. It deliberately drops the garment image and the print-area guide so
  restoring never duplicates them.
- **Restore** via `canvas.loadFromJSON(json)` before the garment image is added
- The garment image is always bottom-most (`sendObjectToBack`); the dashed guide sits above it
- `Template.designArea` drives the guide and where new text/images are centred
- Export: `canvas.toDataURL({ format, multiplier: 2.5 })` → POST `/api/export`
  (Cloudinary upload + `Export` row in connected mode; direct download in demo mode)

When adding editor features, keep side effects (upload, DB save) outside the canvas components — pass callbacks down from the page.

---

## Cloudinary conventions

- Upload preset: `threadforge_uploads` (configure in Cloudinary dashboard — unsigned)
- Folder structure: `threadforge/designs/`, `threadforge/logos/`, `threadforge/templates/`
- Always use `getMockupUrl(publicId, width)` from `src/lib/cloudinary.ts` to build URLs — never construct them manually
- Template images are stored in Cloudinary but seeded with hardcoded URLs in `prisma/seed.ts`

---

## Stripe / billing

Plans are defined in `src/lib/stripe.ts` → `PLANS` constant. Three tiers:

| Plan | Price | Mockups/mo | Brands | Exports/mo |
|---|---|---|---|---|
| FREE | $0 | 10 | 1 | 5 |
| PRO | $19 | 200 | 5 | 100 |
| STUDIO | $49 | unlimited | unlimited | unlimited |

Stripe webhooks are handled at `/api/webhooks/stripe`. The `Subscription` table is the source of truth for plan status — not Clerk metadata. Check `user.subscription.status === "ACTIVE"` for gating.

---

## Styling rules

- **shadcn/ui primitives** (`src/components/ui/`) are the base — never re-implement Button, Dialog, Select, etc.
- **Tailwind only** — no CSS modules, no inline styles, no styled-components
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Color system uses CSS variables (defined in `globals.css`) — always use semantic tokens (`bg-background`, `text-muted-foreground`) not raw colors
- Dark mode is class-based (`dark:` variants) — the `<html>` class is controlled by a future ThemeProvider
- Spacing scale: use Tailwind defaults — no magic numbers
- Border radius: use `rounded-lg` / `rounded-xl` for cards, `rounded-md` for inputs, `rounded-full` for pills/badges

---

## Design system (for Claude design tools)

### Brand identity

ThreadForge targets clothing brands — the aesthetic should feel **minimal, editorial, and tactile**. Think: clean white space, strong typography, subtle shadows, not flashy gradients.

### Color palette

```
Background:     #FFFFFF / hsl(0 0% 100%)
Foreground:     #0A0A0F / hsl(240 10% 3.9%)
Primary:        #0A0A0F (dark mode: #FAFAFA)
Muted:          #F4F4F5 / hsl(240 4.8% 95.9%)
Muted fg:       #71717A / hsl(240 3.8% 46.1%)
Border:         #E4E4E7 / hsl(240 5.9% 90%)
Destructive:    #EF4444 / hsl(0 84.2% 60.2%)
Accent (amber): #F59E0B — used only for PRO badge, premium indicators
```

Dark mode mirrors the above — backgrounds go deep charcoal, not pure black.

### Typography

- **Font:** Geist Sans (variable) for UI, Geist Mono for code/IDs
- **Scale:** text-xs (10–12px) for metadata/badges, text-sm (14px) for body, text-base (16px) for labels, text-2xl–text-4xl for headings
- **Weight:** font-medium for labels, font-semibold for headings, font-bold for hero/display
- **Tracking:** `tracking-tight` on large headings only

### Component patterns

```
Cards:          rounded-xl border bg-card shadow-sm hover:shadow-md
Buttons:        Default = black fill. Ghost = transparent. Outline = border only.
Badges:         rounded-full px-2 py-0.5 text-xs font-medium
Inputs:         border bg-background rounded-md px-3 py-2 text-sm
Empty states:   border-2 border-dashed rounded-xl flex-col items-center py-20
Upload zones:   border-2 border-dashed, border-primary on drag-active
```

### Layout

- Sidebar width: `w-56` (224px), fixed, not collapsible yet
- Main content: `max-w-7xl mx-auto p-6`
- Grid for mockup cards: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Grid gap: `gap-4`
- Section spacing: `space-y-6`

### Icon library

Lucide React — always use `h-4 w-4` for inline icons, `h-5 w-5` for nav, `h-8 w-8` for feature icons. Never mix icon libraries.

---

## Environment variables

All vars are documented in `.env.example` at the repo root. For a new clone:

```bash
cp .env.example apps/web/.env.local
# Fill in: DATABASE_URL, Clerk keys, Cloudinary keys, Stripe keys, Resend key
```

Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in `NEXT_PUBLIC_` vars.

---

## Running locally

```bash
cd apps/web
npm install
npm run dev                  # demo mode, no credentials needed
```

With credentials in `apps/web/.env.local`:

```bash
npx prisma generate          # downloads engines — needs network access
npx prisma migrate dev       # applies migrations against DATABASE_URL
npm run db:seed              # seeds template rows
npm run dev
```

Other useful commands:

```bash
npm run typecheck            # tsc --noEmit (run before committing)
npm run lint                 # next lint
npm run assets               # regenerate the SVG garment artwork
npx prisma studio            # GUI database browser at localhost:5555
npx prisma migrate reset     # wipe + re-apply all migrations (dev only)
```

---

## What is NOT built yet (next priorities)

The core app is wired end to end. Remaining gaps:

1. **Dark mode** — `tailwind.config.ts` is class-based and `.dark` tokens exist in
   `globals.css`, but there is no ThemeProvider or toggle.
2. **PDF / ZIP export** — the enum supports it; only PNG and WebP are rendered client-side.
3. **Plan enforcement** — `PLANS` limits are shown as usage meters but not enforced in the
   API (no guard rejecting over-limit creates).
4. **Transactional email** — `resend` is a dependency but nothing sends mail yet.
5. **Public collection pages** — `Collection.isPublic` exists; no share route renders it.
6. **Delete / rename for brands and collections** — create + list work; no PATCH/DELETE routes.
7. **Tests** — no unit or e2e suite; CI runs lint, typecheck and build only.
8. **Prisma migrations** — the schema exists but `prisma/migrations` is empty, so deploys need
   `prisma db push` until the first `migrate dev` is committed.

---

## Commit conventions

Format: `type(scope): description`

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
Scope: `editor`, `brands`, `mockups`, `auth`, `billing`, `db`, `api`, `ui`

Examples:
```
feat(editor): add text color picker to toolbar
fix(billing): handle past_due subscription status in gating check
chore(db): add index on Mockup.userId
```

Never reference issue numbers in the subject line — put them in the body.
Never add AI tool attribution in commit messages.
