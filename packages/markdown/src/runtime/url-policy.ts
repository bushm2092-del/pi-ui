import type { UrlTransform } from "streamdown";

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function hasExplicitProtocol(url: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(url);
}

export function isSafeMarkdownUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;
  if (value.startsWith("#") || value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
    return true;
  }
  if (!hasExplicitProtocol(value)) return true;

  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const markdownUrlTransform: UrlTransform = (url) =>
  isSafeMarkdownUrl(url) ? url : null;

export function isExternalMarkdownUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
