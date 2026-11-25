"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.assign("/")}>
          Back home
        </Button>
      </div>
    </div>
  );
}
