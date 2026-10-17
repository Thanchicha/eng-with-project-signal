// Illustrations are optional. Vite lists only the files that exist in src/assets/art, so the game
// never requests a missing image — anything not drawn yet falls back to a placeholder.
// File names follow docs/art/ART_BRIEF.md: characters/<id>_<expression>.webp, bg/<name>.webp.

const characterFiles = import.meta.glob("../../assets/art/characters/*.{webp,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const backgroundFiles = import.meta.glob("../../assets/art/bg/*.{webp,png,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(/\.\w+$/, ""), url]));

const characters = byName(characterFiles);
const backgrounds = byName(backgroundFiles);

/** URL for a character sprite, trying the requested expression first, then "neutral". */
export function spriteUrl(characterId: string, expression = "neutral"): string | undefined {
  return characters[`${characterId}_${expression}`] ?? characters[`${characterId}_neutral`];
}

export function backgroundUrl(name: string | undefined): string | undefined {
  return name ? backgrounds[name] : undefined;
}
