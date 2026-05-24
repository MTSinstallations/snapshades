#!/usr/bin/env node
/**
 * SnapShades image optimizer
 *
 * Walks public/images/**\/*.{jpg,jpeg,png}, emits WebP derivatives at @1x (1600w)
 * and @2x (3200w). Idempotent: skips files whose .webp is newer than the source.
 *
 * Run: `npm run images:optimize`
 */

import { readdir, stat, mkdir } from "node:fs/promises";
import { join, parse, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_IMAGES = join(__dirname, "..", "public", "images");

const WIDTHS: Array<{ label: string; width: number }> = [
  { label: "@1x", width: 1600 },
  { label: "@2x", width: 3200 },
];

const QUALITY = 80;

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile() && /\.(jpe?g|png)$/i.test(entry.name)) {
      // Skip already-generated derivatives
      if (/@[12]x\.(jpe?g|png)$/i.test(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

async function isUpToDate(source: string, dest: string): Promise<boolean> {
  try {
    const [srcStat, destStat] = await Promise.all([stat(source), stat(dest)]);
    return destStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
}

async function optimizeOne(source: string): Promise<{ source: string; wrote: string[]; skipped: string[] }> {
  const { dir, name } = parse(source);
  const wrote: string[] = [];
  const skipped: string[] = [];
  const image = sharp(source);
  const meta = await image.metadata();
  const srcWidth = meta.width ?? 0;

  for (const { label, width } of WIDTHS) {
    // Don't upscale beyond the source
    const target = Math.min(width, srcWidth || width);
    const dest = join(dir, `${name}${label}.webp`);
    if (await isUpToDate(source, dest)) {
      skipped.push(dest);
      continue;
    }
    await mkdir(dirname(dest), { recursive: true });
    await sharp(source).resize({ width: target, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(dest);
    wrote.push(dest);
  }

  return { source, wrote, skipped };
}

async function main() {
  console.log(`\n🖼  SnapShades image optimizer`);
  console.log(`    scanning: ${PUBLIC_IMAGES}\n`);

  const sources = await walk(PUBLIC_IMAGES);
  if (sources.length === 0) {
    console.log(`    no source images found. Drop JPG/PNG files into public/images/ and re-run.\n`);
    return;
  }

  let totalWrote = 0;
  let totalSkipped = 0;
  for (const source of sources) {
    try {
      const result = await optimizeOne(source);
      const rel = relative(PUBLIC_IMAGES, result.source);
      if (result.wrote.length > 0) {
        console.log(`    ✓ ${rel}  (→ ${result.wrote.length} webp)`);
      } else if (result.skipped.length > 0) {
        console.log(`    – ${rel}  (up to date)`);
      }
      totalWrote += result.wrote.length;
      totalSkipped += result.skipped.length;
    } catch (err) {
      const rel = relative(PUBLIC_IMAGES, source);
      console.error(`    ✗ ${rel}  (${(err as Error).message})`);
    }
  }

  console.log(`\n    ${totalWrote} written, ${totalSkipped} skipped (${sources.length} sources)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
