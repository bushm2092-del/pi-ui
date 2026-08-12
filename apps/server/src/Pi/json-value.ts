import type { JsonValue } from "@pi/shared";
export function toJsonValue(value: unknown): JsonValue {
  return normalize(value, new WeakSet<object>());
}
function normalize(value: unknown, seen: WeakSet<object>): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (typeof value === "bigint") return value.toString();
  if (value === undefined || typeof value === "function" || typeof value === "symbol") return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return { name: value.name, message: value.message, ...(value.stack ? { stack: value.stack } : {}) };
  if (value instanceof Uint8Array) return { type: "bytes", base64: Buffer.from(value).toString("base64") };
  if (Array.isArray(value)) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    const result = value.map((entry) => normalize(entry, seen));
    seen.delete(value);
    return result;
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    const result: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined && typeof entry !== "function" && typeof entry !== "symbol") result[key] = normalize(entry, seen);
    }
    seen.delete(value);
    return result;
  }
  return String(value);
}
