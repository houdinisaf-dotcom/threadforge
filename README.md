# ThreadForge 🧵

> The mockup platform built for clothing brands — not designers.

ThreadForge lets clothing brands generate professional product mockups, manage their brand kit, organize collections, and export assets — all in one place.

---

## Features

- **Mockup Editor** — Place your designs on 100+ photorealistic clothing templates (tees, hoodies, hats, joggers, etc.) using a Fabric.js canvas
- **Brand Kit** — Store logos, color palettes, typography, and brand guidelines per brand
- **Collections** — Group mockups into lookbooks or seasonal drops
- **Export** — Download PNG, WebP, or PDF at any resolution
- **Multi-brand** — Manage multiple clothing brands under one account
- **Templates Library** — Curated flat-lay and lifestyle templates updated weekly

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Canvas | Fabric.js |
| Database | PostgreSQL via Prisma |
| Auth | Clerk |
| Storage | Cloudinary |
| Payments | Stripe |
| Email | Resend |
| Deployment | Vercel |

## Project Structure

```
threadforge/
├── apps/
│   └── web/                    # Next.js 14 application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── (auth)/     # Sign-in / Sign-up
│       │   │   ├── (dashboard)/# Authenticated app
│       │   │   ├── (marketing)/# Public landing pages
│       │   │   └── api/        # API routes
│       │   ├── components/
│       │   │   ├── editor/     # Fabric.js canvas editor
│       │   │   ├── mockup/     # Mockup display components
│       │   │   ├── brand/      # Brand kit components
│       │   │   ├── template/   # Template gallery
│       │   │   └── shared/     # Navbar, sidebar, upload
│       │   ├── lib/            # DB, auth, Cloudinary, Stripe
│       │   ├── hooks/          # Custom React hooks
│       │   └── types/          # Shared TypeScript types
│       └── prisma/             # Schema + migrations + seed
├── .github/
│   └── workflows/              # CI/CD via GitHub Actions
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Accounts: [Clerk](https://clerk.com), [Cloudinary](https://cloudinary.com), [Stripe](https://stripe.com)

### Local Development

```bash
# 1. Clone
git clone https://github.com/your-org/threadforge.git
cd threadforge/apps/web

# 2. Install
npm install

# 3. Environment
cp ../../.env.example .env.local
# Fill in all values in .env.local

# 4. Database
npx prisma migrate dev
npx prisma db seed

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Roadmap

- [ ] AI-powered design suggestions
- [ ] Bulk mockup generation
- [ ] Shopify integration (push mockups directly to store)
- [ ] Print-on-demand integrations (Printful, Printify)
- [ ] Team collaboration / shared workspaces
- [ ] API for headless mockup generation

## Contributing

Pull requests are welcome. Open an issue first for major changes.

## License

MIT
