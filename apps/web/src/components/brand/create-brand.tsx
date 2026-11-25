"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ColorDraft {
  name: string;
  hex: string;
}

const DEFAULT_COLORS: ColorDraft[] = [
  { name: "Ink", hex: "#111111" },
  { name: "Bone", hex: "#F4F1EA" },
];

export function CreateBrand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [colors, setColors] = useState<ColorDraft[]>(DEFAULT_COLORS);

  const reset = () => {
    setName("");
    setDescription("");
    setWebsite("");
    setInstagram("");
    setColors(DEFAULT_COLORS);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Brand name must be at least 2 characters");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          website: website.trim() || "",
          instagram: instagram.trim() || undefined,
          colors,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.error === "string" ? result.error : "Could not create brand"
        );
      }

      toast.success(`${result.data.name} added`);
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create brand");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New brand
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New brand</DialogTitle>
            <DialogDescription>
              Brand kits keep colours and fonts together so every mockup stays on-brand.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="brand-name">Name</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Atlas Supply Co."
              maxLength={64}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-description">Description</Label>
            <Textarea
              id="brand-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What the brand is about"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-website">Website</Label>
              <Input
                id="brand-website"
                type="url"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-instagram">Instagram</Label>
              <Input
                id="brand-instagram"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder="handle"
                maxLength={64}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Brand colours</Label>
              {colors.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColors([...colors, { name: "", hex: "#B4532A" }])}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`Colour ${index + 1}`}
                    value={color.hex}
                    onChange={(event) => {
                      const next = [...colors];
                      next[index] = { ...next[index], hex: event.target.value.toUpperCase() };
                      setColors(next);
                    }}
                    className="h-9 w-10 cursor-pointer rounded border bg-background"
                  />
                  <Input
                    value={color.name}
                    onChange={(event) => {
                      const next = [...colors];
                      next[index] = { ...next[index], name: event.target.value };
                      setColors(next);
                    }}
                    placeholder="Colour name"
                    className="h-9"
                    maxLength={32}
                  />
                  <span className="w-20 font-mono text-xs text-muted-foreground">{color.hex}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setColors(colors.filter((_, i) => i !== index))}
                    aria-label="Remove colour"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
