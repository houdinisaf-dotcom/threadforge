import type { Metadata } from "next";
import { Palette, Globe, Instagram } from "lucide-react";
import { getBrands } from "@/lib/data";
import { CreateBrand } from "@/components/brand/create-brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BrandColor, BrandFont } from "@/types";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Brand kits keep colours, fonts and links in one place.
          </p>
        </div>
        <CreateBrand />
      </div>

      {brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-24 text-center">
          <Palette className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No brands yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first brand to reuse its palette across every mockup.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => {
            const colors = (brand.colors ?? []) as unknown as BrandColor[];
            const fonts = (brand.fonts ?? []) as unknown as BrandFont[];

            return (
              <Card key={brand.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{brand.name}</CardTitle>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {brand.slug}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {brand._count.mockups} mockup{brand._count.mockups === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brand.description && (
                    <p className="text-sm text-muted-foreground">{brand.description}</p>
                  )}

                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {colors.map((color) => (
                        <span
                          key={`${color.hex}-${color.name}`}
                          title={`${color.name} ${color.hex}`}
                          className="h-6 w-6 rounded-full border shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  )}

                  {fonts.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Fonts: {fonts.map((font) => font.name).join(", ")}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Globe className="h-3.5 w-3.5" /> Website
                      </a>
                    )}
                    {brand.instagram && (
                      <a
                        href={`https://instagram.com/${brand.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Instagram className="h-3.5 w-3.5" /> @{brand.instagram.replace(/^@/, "")}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
