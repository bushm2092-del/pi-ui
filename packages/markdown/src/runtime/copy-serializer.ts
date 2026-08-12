export function serializeCodeFence(code: string, language = ""): string {
  const longestFence = Math.max(0, ...Array.from(code.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(Math.max(3, longestFence + 1));
  const normalized = code.endsWith("\n") ? code : `${code}\n`;
  return `${fence}${language}\n${normalized}${fence}`;
}

export async function writeClipboardText(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is not available");
  }
  await navigator.clipboard.writeText(text);
}
