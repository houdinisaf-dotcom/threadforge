import Link from "next/link";
import { Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Layers className="h-5 w-5" />
        ThreadForge
      </Link>
      {children}
    </div>
  );
}
