// Lenient, rule-based checking for drills (no AI in MVP). It never says "wrong":
// it tells the player what already works and what to try next.

export type CheckResult =
  | { kind: "match" } // same meaning as a model answer
  | { kind: "pattern" } // uses the sentence frame — compare with the examples
  | { kind: "missing-frame"; frame: string } // the frame isn't there yet
  | { kind: "too-short" }
  | { kind: "order" }; // reorder drill: every word used, but not in the model order

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”"]/g, "")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The sentence frame is the last quoted part of the prompt, e.g. `"Before we ___, we should ___."`. */
export function frameOf(prompt: string): string | null {
  const quoted = [...prompt.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const last = quoted.at(-1);
  return last && last.includes("___") ? last : null;
}

export function checkAnswer(answer: string, prompt: string, accepted: string[]): CheckResult {
  const a = normalize(answer);
  if (a.split(" ").filter(Boolean).length < 3) return { kind: "too-short" };
  if (accepted.some((ex) => normalize(ex) === a)) return { kind: "match" };

  const frame = frameOf(prompt);
  if (!frame) return { kind: "pattern" };
  const fixed = frame
    .split("___")
    .map((p) => normalize(p))
    .filter((p) => p.length > 1);
  let cursor = 0;
  for (const part of fixed) {
    const at = a.indexOf(part, cursor);
    if (at < 0) return { kind: "missing-frame", frame };
    cursor = at + part.length;
  }
  return { kind: "pattern" };
}
