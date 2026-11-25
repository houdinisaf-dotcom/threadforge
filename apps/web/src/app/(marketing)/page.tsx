import Link from "next/link";
import { ArrowRight, Download, Layers, Package, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplates } from "@/lib/data";
import { isDemoMode } from "@/lib/env";

const features = [
  {
    icon: Layers,
    title: "Ready-made templates",
    desc: "Tees, hoodies, caps and joggers — flat-lay garments with print areas already mapped.",
  },
  {
    icon: Palette,
    title: "Brand kits",
    desc: "Store palettes, fonts and links per brand so every mockup stays on-brand.",
  },
  {
    icon: Package,
    title: "Collections",
    desc: "Group mockups into drops or lookbooks and share them with buyers.",
  },
  {
    icon: Download,
    title: "Print-ready exports",
    desc: "Export PNG or WebP at 2.5× resolution straight from the editor.",
  },
];

export default async function LandingPage() {
  const templates = await getTemplates();
  const primaryHref = isDemoMode ? "/dashboard/mockups" : "/sign-up";

  return (
    <div>
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <p className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Built for clothing brands
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Mockups that make your brand look <span className="text-primary">incredible</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Place your designs on garment templates, keep your brand kit in one place, organise
          collections and export in seconds — no Photoshop needed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href={primaryHref}>
              {isDemoMode ? "Explore the demo" : "Start for free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        {isDemoMode && (
          <p className="text-xs text-muted-foreground">
            Running in demo mode — no account or database required.
          </p>
        )}
      </section>

      <section id="templates" className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">The template library</h2>
              <p className="text-sm text-muted-foreground">
                {templates.length} garments ready to design on.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/editor/new">Open the editor</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {templates.map((template) => (
              <div
                key={template.id}
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.thumbUrl}
                  alt={template.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <p className="truncate px-2 py-2 text-center text-xs">{template.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Everything your brand needs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
                <Icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-3xl font-bold">Your next drop starts here</h2>
          <p className="text-primary-foreground/80">
            Design, organise and export your whole lookbook in an afternoon.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={primaryHref}>Get started free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
