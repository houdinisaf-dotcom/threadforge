import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getBrands, getUsage } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { PLANS, PLAN_FEATURES, PLAN_ORDER, type PlanKey } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanActions } from "@/components/settings/plan-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = !Number.isFinite(limit);
  const percent = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used} / {unlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent > 85 ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${unlimited ? 8 : Math.max(percent, used > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const [user, usage, brands] = await Promise.all([getCurrentUser(), getUsage(), getBrands()]);
  const currentPlan = (user?.plan ?? "FREE") as PlanKey;
  const plan = PLANS[currentPlan];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Account, plan and usage.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in details for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mode</span>
              <Badge variant={isDemoMode ? "warning" : "success"}>
                {isDemoMode ? "Demo" : "Connected"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Usage</span>
              <Badge variant="outline">{plan.name} plan</Badge>
            </CardTitle>
            <CardDescription>Resets on the first of each month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Meter label="Mockups" used={usage.mockups} limit={plan.mockupsPerMonth} />
            <Meter label="Exports" used={usage.exports} limit={plan.exportsPerMonth} />
            <Meter label="Brand kits" used={brands.length} limit={plan.brandsLimit} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Upgrade for more mockups, exports and brand kits. Cancel any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const option = PLANS[key];
              const active = key === currentPlan;

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-xl border p-4",
                    active ? "border-primary bg-primary/5" : "bg-background"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{option.name}</h3>
                    {active && <Badge variant="success">Current</Badge>}
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    ${option.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {PLAN_FEATURES[key].map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-xs">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <PlanActions currentPlan={currentPlan} isDemo={isDemoMode} />
        </CardContent>
      </Card>
    </div>
  );
}
