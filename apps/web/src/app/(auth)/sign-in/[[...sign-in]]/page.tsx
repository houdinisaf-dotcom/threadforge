import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  // Demo mode has no auth provider — send people straight to the workspace.
  if (isDemoMode) redirect("/dashboard/mockups");

  return <SignIn appearance={{ elements: { rootBox: "mx-auto" } }} />;
}
