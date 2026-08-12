export function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}
