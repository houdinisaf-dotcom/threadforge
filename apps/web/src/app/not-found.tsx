import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold tracking-tight">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The link may be broken, or the mockup might have been deleted.
      </p>
      <div className="mt-2 flex gap-2">
        <Button asChild>
          <Link href="/dashboard/mockups">Go to mockups</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
