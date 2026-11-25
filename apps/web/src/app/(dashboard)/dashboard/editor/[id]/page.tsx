import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMockup, getTemplates } from "@/lib/data";
import { EditorShell, type EditorMockup } from "@/components/editor/editor-shell";

export const metadata: Metadata = { title: "Edit mockup" };

export default async function EditorPage({ params }: { params: { id: string } }) {
  const [templates, mockup] = await Promise.all([getTemplates(), getMockup(params.id)]);

  if (!mockup) notFound();

  if (templates.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-16 text-center">
        <p className="text-lg font-medium">No templates available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Seed the template library with <code className="font-mono">npm run db:seed</code>.
        </p>
        <Link href="/dashboard/mockups" className="mt-4 inline-block text-sm underline">
          Back to mockups
        </Link>
      </div>
    );
  }

  const editorMockup: EditorMockup = {
    id: mockup.id,
    name: mockup.name,
    status: mockup.status,
    templateId: mockup.templateId,
    canvasJson: (mockup.canvasJson ?? null) as Record<string, unknown> | null,
    previewUrl: mockup.previewUrl,
  };

  return <EditorShell templates={templates} mockup={editorMockup} />;
}
