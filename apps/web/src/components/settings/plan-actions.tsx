"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanKey } from "@/lib/stripe";

interface PlanActionsProps {
  currentPlan: PlanKey;
  isDemo: boolean;
}

export function PlanActions({ currentPlan, isDemo }: PlanActionsProps) {
  const [pending, setPending] = useState<string | null>(null);

  const post = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Request failed");
    return result;
  };

  const startCheckout = async (plan: Exclude<PlanKey, "FREE">) => {
    setPending(plan);
    try {
      const result = await post("/api/stripe/checkout", { plan });
      if (result.data?.url) window.location.href = result.data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout");
    } finally {
      setPending(null);
    }
  };

  const openPortal = async () => {
    setPending("portal");
    try {
      const result = await post("/api/stripe/portal", {});
      if (result.data?.url) window.location.href = result.data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open billing portal");
    } finally {
      setPending(null);
    }
  };

  if (isDemo) {
    return (
      <p className="text-xs text-muted-foreground">
        Billing is disabled in the demo workspace. Add Stripe keys and price IDs to try checkout.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(["PRO", "STUDIO"] as const).map((plan) => (
        <Button
          key={plan}
          size="sm"
          variant={currentPlan === plan ? "secondary" : "default"}
          disabled={currentPlan === plan || pending !== null}
          onClick={() => startCheckout(plan)}
        >
          {pending === plan && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {currentPlan === plan ? "Current plan" : `Upgrade to ${plan === "PRO" ? "Pro" : "Studio"}`}
        </Button>
      ))}

      <Button size="sm" variant="outline" onClick={openPortal} disabled={pending !== null}>
        {pending === "portal" ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : (
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
        )}
        Manage billing
      </Button>
    </div>
  );
}
