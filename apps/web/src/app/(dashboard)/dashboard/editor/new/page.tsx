import type { Metadata } from "next";
import { getTemplates } from "@/lib/data";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = { title: "New mockup" };

export default async function NewMockupPage() {
  const templates = await getTemplates();

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-16 text-center">
        <p className="text-lg font-medium">No templates available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Seed the template library with <code className="font-mono">npm run db:seed</code>.
        </p>
      </div>
    );
  }

  return <EditorShell templates={templates} />;
}
