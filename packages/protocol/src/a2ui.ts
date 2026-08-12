import type { JsonValue } from "./json.js";

export interface A2uiToolDetails {
  kind: "a2ui.surface";
  protocolVersion: "v0.9";
  surfaceId: string;
  messages: JsonValue[];
}

export function isA2uiToolDetails(value: unknown): value is A2uiToolDetails {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    (value as A2uiToolDetails).kind === "a2ui.surface" &&
    (value as A2uiToolDetails).protocolVersion === "v0.9" &&
    typeof (value as A2uiToolDetails).surfaceId === "string" &&
    Array.isArray((value as A2uiToolDetails).messages);
}
