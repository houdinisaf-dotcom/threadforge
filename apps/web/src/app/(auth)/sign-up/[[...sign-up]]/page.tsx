import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  if (isDemoMode) redirect("/dashboard/mockups");

  return <SignUp appearance={{ elements: { rootBox: "mx-auto" } }} />;
}
