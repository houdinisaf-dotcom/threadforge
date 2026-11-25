import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, PLAN_FEATURES, PLAN_ORDER } from "@/lib/stripe";
import { isDemoMode } from "@/lib/env";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for clothing brands — start free, upgrade when you need more.",
};

export default function PricingPage() {
  const cta = isDemoMode ? "/dashboard/mockups" : "/sign-up";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple, honest pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Start free. Upgrade when your brand — not your budget — is ready.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const featured = key === "PRO";

          return (
            <div
              key={key}
              className={cn(
                "flex flex-col rounded-2xl border p-6 shadow-sm",
                featured ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {featured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    Popular
                  </span>
                )}
              </div>

              <p className="mt-4 text-4xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {PLAN_FEATURES[key].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-6" variant={featured ? "default" : "outline"} asChild>
                <Link href={key === "FREE" ? cta : isDemoMode ? cta : `/sign-up?plan=${key}`}>
                  {key === "FREE" ? "Start free" : `Choose ${plan.name}`}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Prices in USD. Cancel any time from your billing portal.
      </p>
    </div>
  );
}
