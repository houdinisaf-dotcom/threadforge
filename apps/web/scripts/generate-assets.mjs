/**
 * Generates the local, dependency-free demo artwork used by the sample data.
 *
 *  - public/templates/*.svg   blank garment "flat lay" illustrations
 *  - public/mockups/*.svg     the same garments with a design applied
 *
 * Everything is plain SVG so the app has zero external image dependencies and
 * works offline (no Cloudinary / no Next.js image optimisation needed).
 *
 *   node scripts/generate-assets.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const CANVAS = 800;

/** Soft studio backdrop + grounding shadow shared by every garment. */
const backdrop = (tone) => `
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="${tone.light}"/>
      <stop offset="100%" stop-color="${tone.dark}"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <linearGradient id="sheen" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.26"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="${CANVAS}" height="${CANVAS}" fill="url(#bg)"/>`;

const groundShadow = (cx, cy, rx, ry, opacity = 0.18) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#292524" opacity="${opacity}" filter="url(#soft)"/>`;

/**
 * Builds one garment. `path` is the silhouette, reused to clip the fabric
 * sheen so the shading never bleeds outside the garment.
 */
const garment = ({ id, path, body, fabric, stitch, shadowParts, details, area }) => {
  const markup = `
    ${shadowParts}
    <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
    <defs>
      <linearGradient id="${id}-fabric" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stop-color="${fabric.light}"/>
        <stop offset="52%" stop-color="${fabric.base}"/>
        <stop offset="100%" stop-color="${fabric.dark}"/>
      </linearGradient>
    </defs>
    <path d="${path}" fill="url(#${id}-fabric)" stroke="${stitch}" stroke-width="2.5"
          stroke-linejoin="round"/>
    <g clip-path="url(#${id}-clip)">
      <rect x="0" y="0" width="${CANVAS}" height="${CANVAS}" fill="url(#sheen)"/>
      ${body ?? ""}
    </g>
    ${details ?? ""}`;
  return { markup, area };
};

/* ─── T-shirt ─────────────────────────────────────────────────────────────── */

const TEE_PATH = `M296 156 L352 144 Q400 188 448 144 L504 156 L662 246 L600 396 L526 346
                  L526 706 Q400 724 274 706 L274 346 L200 396 L138 246 Z`;

const tee = (p) =>
  garment({
    ...p,
    path: TEE_PATH,
    body: `<path d="M274 346 L274 706" stroke="${p.stitch}" stroke-width="1.3" opacity="0.5"/>
           <path d="M526 346 L526 706" stroke="${p.stitch}" stroke-width="1.3" opacity="0.5"/>
           <path d="M200 396 L274 346" stroke="${p.stitch}" stroke-width="1.3" opacity="0.5"/>
           <path d="M600 396 L526 346" stroke="${p.stitch}" stroke-width="1.3" opacity="0.5"/>
           <ellipse cx="392" cy="300" rx="120" ry="180" fill="#ffffff" opacity="0.07"/>`,
    details: `
      <path d="M352 144 Q400 192 448 144 Q400 206 352 144 Z" fill="${p.shade}" opacity="0.8"/>
      <path d="M352 144 Q400 192 448 144" fill="none" stroke="${p.stitch}" stroke-width="4"/>
      <path d="M280 690 Q400 706 520 690" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.75"/>
      <path d="M274 706 Q400 724 526 706" fill="none" stroke="${p.stitch}" stroke-width="3"/>
      <path d="M138 246 L200 396" stroke="${p.stitch}" stroke-width="1.3" opacity="0.6"/>
      <path d="M662 246 L600 396" stroke="${p.stitch}" stroke-width="1.3" opacity="0.6"/>`,
    area: { x: 320, y: 268, width: 160, height: 190 },
  });

/* ─── Hoodie ──────────────────────────────────────────────────────────────── */

const HOODIE_PATH = `M298 206 L358 194 Q400 246 442 194 L502 206 L660 298 L598 448 L532 402
                     L532 722 Q400 742 268 722 L268 402 L202 448 L140 298 Z`;

const hoodie = (p) =>
  garment({
    ...p,
    path: HOODIE_PATH,
    body: `<path d="M268 402 L268 722" stroke="${p.stitch}" stroke-width="1.3" opacity="0.45"/>
           <path d="M532 402 L532 722" stroke="${p.stitch}" stroke-width="1.3" opacity="0.45"/>
           <ellipse cx="380" cy="330" rx="130" ry="200" fill="#ffffff" opacity="0.07"/>`,
    shadowParts: `
      <path d="M286 212 Q266 104 400 96 Q534 104 514 212 Q400 268 286 212 Z"
            fill="${p.shade}" opacity="0.95" stroke="${p.stitch}" stroke-width="2.5"/>`,
    details: `
      <path d="M298 206 Q400 266 502 206" fill="none" stroke="${p.stitch}" stroke-width="3"/>
      <path d="M368 262 Q400 306 432 262" fill="none" stroke="${p.stitch}" stroke-width="4.5"/>
      <path d="M386 300 L381 386" stroke="${p.stitch}" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M414 300 L419 386" stroke="${p.stitch}" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="381" cy="390" r="4.5" fill="${p.stitch}"/>
      <circle cx="419" cy="390" r="4.5" fill="${p.stitch}"/>
      <path d="M322 592 L478 592 Q484 664 400 670 Q316 664 322 592 Z"
            fill="${p.shade}" opacity="0.55" stroke="${p.stitch}" stroke-width="2"/>
      <path d="M268 706 Q400 726 532 706" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.7"/>
      <path d="M268 722 Q400 742 532 722" fill="none" stroke="${p.stitch}" stroke-width="3"/>
      <path d="M598 448 L532 402" stroke="${p.stitch}" stroke-width="1.3" opacity="0.55"/>
      <path d="M202 448 L268 402" stroke="${p.stitch}" stroke-width="1.3" opacity="0.55"/>`,
    area: { x: 318, y: 300, width: 164, height: 178 },
  });

/* ─── Snapback cap ────────────────────────────────────────────────────────── */

const CAP_PATH = `M246 452 C246 336 308 258 400 258 C492 258 554 336 554 452
                  C554 470 482 480 400 480 C318 480 246 470 246 452 Z`;

const cap = (p) =>
  garment({
    ...p,
    path: CAP_PATH,
    body: `<ellipse cx="356" cy="350" rx="94" ry="92" fill="#ffffff" opacity="0.09"/>`,
    shadowParts: groundShadow(400, 606, 190, 22),
    details: `
      <path d="M246 452 C246 336 308 258 400 258 C492 258 554 336 554 452" fill="none"
            stroke="${p.stitch}" stroke-width="2.6"/>
      <path d="M400 258 L400 460" stroke="${p.stitch}" stroke-width="1.5" opacity="0.4"/>
      <path d="M332 268 Q312 372 316 460" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.32"/>
      <path d="M468 268 Q488 372 484 460" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.32"/>
      <path d="M240 444 C300 480 512 478 560 440 C574 470 578 500 562 524
               C512 570 344 574 286 540 C258 522 248 486 256 452 Z"
            fill="${p.fabric.dark}" stroke="${p.stitch}" stroke-width="2.6"/>
      <path d="M240 444 C300 480 512 478 560 440" fill="none" stroke="${p.stitch}" stroke-width="2.4" opacity="0.85"/>
      <circle cx="400" cy="264" r="7" fill="${p.shade}" stroke="${p.stitch}" stroke-width="2"/>
      <circle cx="338" cy="312" r="3.4" fill="${p.shade}" opacity="0.9"/>
      <circle cx="462" cy="312" r="3.4" fill="${p.shade}" opacity="0.9"/>`,
    area: { x: 330, y: 306, width: 140, height: 106 },
  });

/* ─── Joggers ─────────────────────────────────────────────────────────────── */

const JOGGERS_PATH = `M294 206 L506 206 L522 330 L512 690 L424 690 L412 430
                      Q400 414 388 430 L376 690 L288 690 L278 330 Z`;

const joggers = (p) =>
  garment({
    ...p,
    path: JOGGERS_PATH,
    body: `<path d="M278 330 L288 690" stroke="${p.stitch}" stroke-width="1.3" opacity="0.4"/>
           <path d="M522 330 L512 690" stroke="${p.stitch}" stroke-width="1.3" opacity="0.4"/>
           <ellipse cx="360" cy="360" rx="90" ry="150" fill="#ffffff" opacity="0.08"/>`,
    details: `
      <path d="M292 164 L508 164 L510 208 L290 208 Z" fill="${p.shade}" opacity="0.75"
            stroke="${p.stitch}" stroke-width="2"/>
      <path d="M290 208 L510 208" stroke="${p.stitch}" stroke-width="2"/>
      <path d="M356 208 Q400 252 444 208" fill="none" stroke="${p.stitch}" stroke-width="1.8" opacity="0.6"/>
      <path d="M388 430 Q400 414 412 430" fill="none" stroke="${p.stitch}" stroke-width="3"/>
      <path d="M300 236 L316 372" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.45"/>
      <path d="M500 236 L484 372" fill="none" stroke="${p.stitch}" stroke-width="1.5" opacity="0.45"/>
      <path d="M288 672 L366 672 L366 690 L288 690 Z" fill="${p.shade}" opacity="0.8"/>
      <path d="M434 672 L512 672 L512 690 L434 690 Z" fill="${p.shade}" opacity="0.8"/>
      <path d="M288 672 L366 672 M434 672 L512 672" stroke="${p.stitch}" stroke-width="2"/>`,
    area: { x: 322, y: 246, width: 148, height: 132 },
  });

/* ─── Palette ─────────────────────────────────────────────────────────────── */

const GARMENTS = {
  "tee-white": {
    draw: tee,
    fabric: { light: "#ffffff", base: "#f7f6f3", dark: "#e3e0d9" },
    shade: "#d9d6ce",
    stitch: "#cecbc2",
    tone: { light: "#f3f1ec", dark: "#e7e4dc" },
  },
  "tee-black": {
    draw: tee,
    fabric: { light: "#3f3f3c", base: "#282827", dark: "#171716" },
    shade: "#111110",
    stitch: "#57574f",
    tone: { light: "#e9e7e2", dark: "#dcd9d1" },
  },
  "hoodie-white": {
    draw: hoodie,
    fabric: { light: "#ffffff", base: "#f6f4ef", dark: "#e2ded5" },
    shade: "#d8d4cb",
    stitch: "#cbc7bd",
    tone: { light: "#f2f0ea", dark: "#e6e2d9" },
  },
  "cap-black": {
    draw: cap,
    fabric: { light: "#42423e", base: "#2a2a28", dark: "#171716" },
    shade: "#101010",
    stitch: "#5b5b53",
    tone: { light: "#ebe8e2", dark: "#dfdbd3" },
  },
  "joggers-grey": {
    draw: joggers,
    fabric: { light: "#dedcd8", base: "#c8c7c2", dark: "#ada9a2" },
    shade: "#b6b3ad",
    stitch: "#9d9a94",
    tone: { light: "#f1efea", dark: "#e5e2db" },
  },
};

/* ─── Designs ───────────────────────────────────────────────────────────────
 * Drawn inside a 100×100 box, then centred on the garment's printable area so
 * artwork scales with the template.
 */

const DESIGNS = {
  atlas: () => `
    <g>
      <path d="M20 60 L37 30 L49 49 L59 22 L80 60 Z" fill="#b4532a"/>
      <circle cx="67" cy="31" r="4.4" fill="#1c1917"/>
      <text x="50" y="80" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
            font-size="16" letter-spacing="3.2" fill="#1c1917">ATLAS</text>
    </g>`,
  badge: () => `
    <g>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#f4f1ea" stroke-width="2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#f4f1ea" stroke-width="0.8" opacity="0.7"/>
      <path d="M33 56 L43 34 L50 46 L58 30 L68 56 Z" fill="#e6a04b"/>
      <text x="50" y="70" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="6.4" letter-spacing="1.5" fill="#f4f1ea">ATLAS SUPPLY CO.</text>
    </g>`,
  nightshift: (fabricHex) => `
    <g>
      <circle cx="50" cy="40" r="19" fill="#2f4858"/>
      <circle cx="59" cy="32" r="16" fill="${fabricHex}"/>
      <text x="50" y="82" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="10" letter-spacing="2.4" fill="#2f4858">NIGHT SHIFT</text>
    </g>`,
  monogram: () => `
    <g>
      <text x="50" y="62" text-anchor="middle" font-family="Georgia, serif" font-size="40"
            letter-spacing="1" fill="#f4f1ea">NS</text>
      <rect x="26" y="72" width="48" height="1.6" fill="#e6a04b"/>
    </g>`,
  trail: () => `
    <g>
      <path d="M28 52 L41 30 L51 45 L61 26 L72 52" fill="none" stroke="#2f4858"
            stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <text x="50" y="74" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="8" letter-spacing="2.2" fill="#2f4858">TRAIL</text>
    </g>`,
  og: () => `
    <g>
      <text x="50" y="64" text-anchor="middle" font-family="Georgia, serif" font-size="44"
            letter-spacing="-1" fill="#1c1917">OG</text>
      <text x="50" y="80" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="6.2" letter-spacing="2.3" fill="#b4532a">SINCE 2019</text>
    </g>`,
};

/* ─── Mockups ─────────────────────────────────────────────────────────────── */

const MOCKUPS = [
  { slug: "atlas-tee-white", garment: "tee-white", design: "atlas", scale: 1 },
  { slug: "atlas-badge-tee-black", garment: "tee-black", design: "badge", scale: 1.04 },
  { slug: "night-shift-hoodie", garment: "hoodie-white", design: "nightshift", scale: 1 },
  { slug: "night-shift-cap", garment: "cap-black", design: "monogram", scale: 0.92 },
  { slug: "trail-joggers", garment: "joggers-grey", design: "trail", scale: 1 },
  { slug: "og-logo-tee", garment: "tee-white", design: "og", scale: 0.9 },
];

const garmentSvg = (key, design = null) => {
  const g = GARMENTS[key];
  const { markup, area } = g.draw({
    id: key,
    fabric: g.fabric,
    shade: g.shade,
    stitch: g.stitch,
  });

  let overlay = "";
  if (design) {
    const size = Math.min(area.width, area.height) * 0.7 * (design.scale ?? 1);
    const cx = area.x + area.width / 2;
    const cy = area.y + area.height / 2;
    overlay = `<g transform="translate(${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)})
      scale(${(size / 100).toFixed(3)})">${design.markup}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}"
    width="${CANVAS}" height="${CANVAS}" role="img">${backdrop(g.tone)}${markup}${overlay}</svg>`;
};

async function main() {
  await mkdir(join(publicDir, "templates"), { recursive: true });
  await mkdir(join(publicDir, "mockups"), { recursive: true });

  for (const key of Object.keys(GARMENTS)) {
    await writeFile(join(publicDir, "templates", `${key}.svg`), garmentSvg(key), "utf8");
    console.log(`templates/${key}.svg`);
  }

  for (const mockup of MOCKUPS) {
    const design = DESIGNS[mockup.design];
    const markup = design(GARMENTS[mockup.garment].fabric.base);
    const svg = garmentSvg(mockup.garment, { markup, scale: mockup.scale });
    await writeFile(join(publicDir, "mockups", `${mockup.slug}.svg`), svg, "utf8");
    console.log(`mockups/${mockup.slug}.svg`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
