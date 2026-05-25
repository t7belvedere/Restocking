/**
 * One-shot: convert messages.ts (nested TS object with functions) → per-locale JSON files.
 * Run with: npx tsx scripts/convert-i18n.ts
 */

import { messages } from "../lib/i18n/messages";
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.resolve(__dirname, "..", "messages");

// Simple interpolation: n → {n}, brand → {brand}, etc.
// Conditional functions (greeting, emptyTitle) are split into two keys.
function convertValue(value: unknown): string | Record<string, string> | null {
  if (typeof value === "string") return value;
  if (typeof value !== "function") return null;

  const src = value.toString();
  const params = src.match(/\(([^)]*)\)/)?.[1] ?? "";

  if (src.includes("?")) {
    // Conditional: split into WithX / Fallback
    // Extract the two branches from `x ? \`A ${p}\` : "B"`
    const thenMatch = src.match(/\?\s*(`[^`]+`|"[^"]+")/);
    const elseMatch = src.match(/:\s*(`[^`]+`|"[^"]+")/);
    const thenStr = thenMatch?.[1]?.slice(1, -1) ?? "";
    const elseStr = elseMatch?.[1]?.slice(1, -1) ?? "";
    // Convert template literals to ICU
    const paramsUsed = (thenStr.match(/\$\{(\w+)\}/g) ?? []).map(
      (m: string) => m.slice(2, -1)
    );
    const thenIcu = thenStr.replace(/\$\{(\w+)\}/g, "{$1}");
    return {
      withParam: thenIcu,
      fallback: elseStr,
    };
  }

  // Simple interpolation: `...${param}...` → "... {param}..."
  return src
    .match(/`([^`]*)`/)?.[1]
    ?.replace(/\$\{(\w+)\}/g, "{$1}") ?? null;
}

function walk(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(walk);

  const converted = convertValue(obj);
  if (typeof converted === "string") return converted;
  if (typeof converted === "object" && converted !== null) return converted;

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = walk(val);
    }
    return result;
  }

  return obj;
}

// Main
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const locale of ["fr", "en"] as const) {
  const data = messages[locale];
  const converted = walk(data);
  const outPath = path.join(OUT_DIR, `${locale}.json`);
  fs.writeFileSync(outPath, JSON.stringify(converted, null, 2), "utf-8");
  console.log(`Wrote ${outPath}`);
}

console.log("Done.");
