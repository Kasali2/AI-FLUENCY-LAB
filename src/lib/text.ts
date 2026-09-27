/**
 * Small text helpers.
 *
 * Deliberately free of any imports so this module can be exercised directly by
 * the test runner as well as by the Next.js build.
 */

/** Trims text to a maximum length without cutting mid-word where avoidable. */
export function clampText(value: string, max: number): string {
  const text = value.trim();
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${safe.trimEnd()}…`;
}
