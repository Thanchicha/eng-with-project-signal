// Convert docs/story/epXX.md (format: docs/story/FORMAT.md) into src/content/epXX.ts.
// Usage: npm run content            (all episodes)
//        node scripts/story-to-ts.mjs ep02
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storyDir = path.join(root, "docs", "story");
const outDir = path.join(root, "src", "content");
const MAIN_CAST = { kuro: "kuro", miyu: "miyu", chief: "chief", rei: "rei", lena: "lena", shion: "shion" };

const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const stripBold = (s) => s.replace(/\*\*/g, "");
const unquote = (s) => {
  const t = s.trim();
  return /^".*"$/.test(t) && !t.slice(1, -1).includes('"') ? t.slice(1, -1) : t;
};
const kv = (line) => {
  const m = line.match(/^\s*-\s+([A-Za-z][\w ]*?):\s?(.*)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
};

/** Split the markdown into { heading, lines } sections at a given heading level. */
function sections(lines, level) {
  const prefix = "#".repeat(level) + " ";
  const out = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      cur = { heading: line.slice(prefix.length).trim(), lines: [] };
      out.push(cur);
    } else if (cur) cur.lines.push(line);
  }
  return out;
}

function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith("|")).map((l) =>
    l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()),
  );
  if (rows.length < 2) return null;
  const [header, sep, ...body] = rows;
  const numeric = sep.map((c, i) => (c.endsWith(":") ? i : -1)).filter((i) => i >= 0);
  return { header, body, numeric };
}

function makeVocabResolver(file, vocab) {
  const ids = new Set(vocab.map((v) => v.id));
  const find = (word) => {
    const w = word.toLowerCase();
    return [w, w.replace(/\s+/g, "-")].find((c) => ids.has(c));
  };
  /** Returns { text, refs } with markers removed and refs pointing at exact substrings. */
  return (raw) => {
    const refs = [];
    const text = raw
      .replace(/\[([^\]]+)\]\(vocab:([\w-]+)\)/g, (_, t, id) => {
        if (!ids.has(id)) fail(file, `unknown vocab id "${id}"`);
        refs.push({ id, text: t });
        return t;
      })
      .replace(/\[([^\]]+)\]/g, (_, t) => {
        const id = find(t);
        if (!id) fail(file, `"[${t}]" does not match any vocabulary id`);
        else refs.push({ id, text: t });
        return t;
      });
    return { text, refs };
  };
}

function parseDialogue(file, lines, resolve) {
  const out = [];
  for (const line of lines) {
    const m = line.match(/^([A-Z][^:"]*):\s*"(.*)"\s*\|\s*"(.*)"\s*$/);
    if (!m) continue;
    const [, speaker, en, th] = m;
    const key = speaker.trim().toLowerCase();
    const { text, refs } = resolve(en);
    const entry = { speakerId: MAIN_CAST[key] ?? (key === "narration" || key === "screen" ? key : key.replace(/\W+/g, "-").replace(/^-+|-+$/g, "")), textEn: text, textTh: th };
    if (!MAIN_CAST[key] && key !== "narration" && key !== "screen") entry.speakerLabel = speaker.trim();
    if (refs.length) entry.vocabularyRefs = refs;
    out.push(entry);
  }
  return out;
}

const FEEDBACK_KEYS = {
  "You communicated": "communicatedTh",
  "A natural option": "naturalOption",
  "Why it works": "whyItWorksTh",
  "Try a pattern": "tryPattern",
};

function parseScene(file, sec, resolve) {
  const [head] = sec.heading.split(" — ").slice(1);
  const scene = { id: "", title: head ?? sec.heading, objective: "", objectiveTh: "", dialogue: [] };
  const interactionAt = sec.lines.findIndex((l) => l.startsWith("### Interaction"));
  const body = interactionAt >= 0 ? sec.lines.slice(0, interactionAt) : sec.lines;
  for (const l of body) {
    const p = kv(l);
    if (p && p[0] === "id") scene.id = p[1];
    if (p && p[0] === "objective") scene.objective = p[1];
    if (p && p[0] === "objectiveTh") scene.objectiveTh = p[1];
  }
  scene.dialogue = parseDialogue(file, body, resolve);
  if (!scene.id) fail(file, `scene "${sec.heading}" has no id`);
  if (!scene.dialogue.length) fail(file, `scene ${scene.id} has no dialogue`);

  if (interactionAt >= 0) {
    const iLines = sec.lines.slice(interactionAt + 1);
    const interaction = { promptEn: "", promptTh: "", choices: [] };
    let choice = null;
    for (const l of iLines) {
      const ch = l.match(/^####\s+Choice\s+(\w)\s+—\s+(.*)$/);
      if (ch) {
        choice = { id: `${scene.id}_${ch[1].toLowerCase()}`, textEn: unquote(ch[2]), feedback: {}, skillTags: [], nextSceneId: "" };
        interaction.choices.push(choice);
        continue;
      }
      const p = kv(l);
      if (!p) continue;
      const [k, v] = p;
      if (!choice) {
        if (k === "promptEn") interaction.promptEn = v;
        if (k === "promptTh") interaction.promptTh = v;
      } else if (k === "skillTags") choice.skillTags = v.split(",").map((s) => s.trim()).filter(Boolean);
      else if (k === "nextScene") choice.nextSceneId = v;
      else if (FEEDBACK_KEYS[k]) choice.feedback[FEEDBACK_KEYS[k]] = FEEDBACK_KEYS[k] === "naturalOption" ? unquote(v) : v;
    }
    for (const c of interaction.choices) {
      for (const f of Object.values(FEEDBACK_KEYS)) if (!c.feedback[f]) fail(file, `${c.id} missing feedback "${f}"`);
      if (!c.nextSceneId) fail(file, `${c.id} missing nextScene`);
    }
    if (interaction.choices.length < 2 || interaction.choices.length > 3) fail(file, `${scene.id} needs 2–3 choices`);
    scene.interaction = interaction;
  }
  return scene;
}

function bullets(lines) {
  return lines.filter((l) => /^\s*-\s+/.test(l)).map((l) => stripBold(l.replace(/^\s*-\s+/, "")).trim());
}

function convert(id) {
  const file = `docs/story/${id}.md`;
  const lines = fs.readFileSync(path.join(storyDir, `${id}.md`), "utf8").split(/\r?\n/);
  const titleLine = lines.find((l) => l.startsWith("# ")) ?? "";
  const secs = sections(lines, 2);
  const get = (name) => secs.find((s) => s.heading === name);
  const need = (name) => get(name) ?? (fail(file, `missing "## ${name}"`), { lines: [] });

  // Meta
  const meta = {};
  const metaLines = need("Meta").lines;
  for (let i = 0; i < metaLines.length; i++) {
    const p = kv(metaLines[i]);
    if (!p || /^\s{2,}/.test(metaLines[i])) continue;
    const [k, v] = p;
    if (v === "|" || v === "") {
      const block = [];
      while (i + 1 < metaLines.length && /^\s{2,}\S/.test(metaLines[i + 1])) block.push(metaLines[++i].trim());
      meta[k] = v === "|" ? block.join("\n") : block.map((b) => b.replace(/^-\s+/, ""));
    } else meta[k] = v;
  }

  // Before Reading
  const br = need("Before Reading").lines;
  const field = (label) => stripBold(br.find((l) => l.startsWith(`**${label}:**`)) ?? "").replace(`${label}:`, "").trim();
  const vt = parseTable(br);
  const vocabulary = vt ? vt.body.map(([vid, en, th, example]) => ({ id: vid, en, th, example })) : [];
  if (vocabulary.length < 8 || vocabulary.length > 12) fail(file, `vocabulary should have 8–12 items (has ${vocabulary.length})`);
  const resolve = makeVocabResolver(file, vocabulary);

  // Scenes
  const scenes = secs.filter((s) => s.heading.startsWith("Scene ")).map((s) => parseScene(file, s, resolve));
  scenes.forEach((s, i) => (s.nextSceneId = scenes[i + 1]?.id ?? "end"));
  const sceneIds = new Set(scenes.map((s) => s.id));
  for (const s of scenes)
    for (const c of s.interaction?.choices ?? [])
      if (c.nextSceneId !== "end" && !sceneIds.has(c.nextSceneId)) fail(file, `${c.id} → unknown scene "${c.nextSceneId}"`);

  // Business lesson
  const bl = need("Business & Data Lesson").lines.filter((l) => l.trim());
  const titled = bl[0] && /^\*\*[^*]+\*\*$/.test(bl[0].trim());
  const businessLesson = {
    title: titled ? stripBold(bl[0]).trim() : "Business & Data Lesson",
    bodyTh: (titled ? bl.slice(1) : bl).map((l) => stripBold(l.replace(/^\s*-\s+/, "• ")).trim()),
  };

  // Sentence patterns
  const sentencePatterns = [];
  for (const l of need("Sentence Patterns").lines) {
    const m = l.match(/^\d+\.\s+\*\*(.+?)\*\*\s+—\s+(.*)$/);
    if (m) sentencePatterns.push({ pattern: m[1], example: m[2].trim(), substitutions: [] });
    const s = l.match(/^\s+แทนคำ:\s*(.*)$/);
    if (s && sentencePatterns.length) sentencePatterns.at(-1).substitutions = s[1].split(/\s+\/\s+/).map((x) => x.trim());
  }
  if (sentencePatterns.length !== 3) fail(file, `expected 3 sentence patterns (has ${sentencePatterns.length})`);

  // Drills
  const drills = [];
  for (const l of need("Drills").lines) {
    const m = l.match(/^\d+\.\s+type:\s*(\w+)/);
    if (m) {
      drills.push({ id: `${id}_d${drills.length + 1}`, type: m[1], promptTh: "", prompt: "", hint: "", acceptedExamples: [] });
      continue;
    }
    const p = kv(l);
    if (!p || !drills.length) continue;
    const d = drills.at(-1);
    if (p[0] === "acceptedExamples") d.acceptedExamples = p[1].split(/"\s*;\s*"/).map(unquote).map((x) => x.replace(/^"|"$/g, ""));
    else if (p[0] in d) d[p[0]] = p[1];
  }
  if (drills.length < 3 || drills.length > 5) fail(file, `expected 3–5 drills (has ${drills.length})`);

  // Speak practice
  const sp = need("Speak Like an Intern").lines;
  const speakPractice = {
    situationTh: (sp.find((l) => l.startsWith("สถานการณ์:")) ?? "").replace("สถานการณ์:", "").trim(),
    lines: parseDialogue(file, sp, (t) => ({ text: t, refs: [] })),
  };

  // Mini case
  const mc = need("Mini Case").lines;
  const mt = parseTable(mc);
  const toCell = (c) => (/^-?\d+(\.\d+)?$/.test(c) ? Number(c) : c);
  const block = (startLabel) => {
    const i = mc.findIndex((l) => l.startsWith(`**${startLabel}`));
    if (i < 0) return [];
    const out = [];
    for (const l of mc.slice(i + 1)) {
      if (l.startsWith("**")) break;
      if (/^\s*-\s+/.test(l)) out.push(unquote(l.replace(/^\s*-\s+/, "")));
    }
    return out;
  };
  const quoteLine = mc.find((l) => /บอกว่า:/.test(l)) ?? "";
  const [qLabel, ...qRest] = quoteLine.split(":");
  const miniCase = {
    columns: mt?.header ?? [],
    rows: mt?.body.map((r) => r.map(toCell)) ?? [],
    numericColumns: mt?.numeric ?? [],
    stakeholderLabelTh: qLabel.trim(),
    stakeholderQuote: unquote(qRest.join(":")),
    questions: block("คำถาม"),
    templates: block("แม่แบบ"),
    sampleAnswer: unquote(stripBold(mc.find((l) => l.startsWith("**คำตอบตัวอย่าง")) ?? "").replace("คำตอบตัวอย่าง:", "")),
  };
  const note = mc.find((l) => l.startsWith(">"));
  if (note) miniCase.noteTh = note.replace(/^>\s*/, "").replace(/^หมายเหตุ:\s*/, "");
  if (!miniCase.rows.length || !miniCase.stakeholderQuote || !miniCase.sampleAnswer) fail(file, "mini case is incomplete");

  // Recap
  const recap = { bulletsTh: [], reviewVocabulary: [], reviewPatterns: [], nextTeaserTh: "" };
  for (const b of need("Recap").lines.filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, ""))) {
    const m = b.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (m && m[1] === "คำศัพท์ทบทวน") recap.reviewVocabulary = m[2].split(",").map((x) => x.trim());
    else if (m && m[1] === "รูปประโยคทบทวน") recap.reviewPatterns = m[2].split(/\s+\/\s+/).map((x) => x.trim());
    else if (m && m[1] === "ตอนต่อไป") recap.nextTeaserTh = m[2].trim();
    else recap.bulletsTh.push(stripBold(b).trim());
  }

  const episode = {
    id: meta.id ?? id,
    number: Number(id.replace(/\D/g, "")),
    title: meta.title ?? titleLine.replace(/^#\s+Episode\s+\d+\s+—\s+/, ""),
    level: meta.level,
    roles: (meta.roles ?? "").split(",").map((r) => r.trim()).filter(Boolean),
    summaryTh: meta.summaryTh ?? "",
    learningGoals: meta.learningGoals ?? [],
    contextTh: field("สถานการณ์"),
    goalTh: field("เป้าหมาย"),
    vocabulary,
    scenes,
    analystNote: bullets(need("Analyst Note").lines),
    businessLesson,
    sentencePatterns,
    drills,
    speakPractice,
    miniCase,
    recap,
  };
  if (!["A2", "B1"].includes(episode.level)) fail(file, `level must be A2 or B1`);

  const ts =
    `// Generated by scripts/story-to-ts.mjs from docs/story/${id}.md — edit the markdown, then run \`npm run content\`.\n` +
    `import type { Episode } from "./types";\n\n` +
    `export const ${id}: Episode = ${JSON.stringify(episode, null, 2)};\n`;
  return { id, ts, scenes: scenes.length, choices: scenes.reduce((n, s) => n + (s.interaction?.choices.length ?? 0), 0) };
}

const wanted = process.argv.slice(2);
const ids = (wanted.length ? wanted : fs.readdirSync(storyDir).filter((f) => /^ep\d+\.md$/.test(f)).map((f) => f.slice(0, -3))).sort();
const results = ids.map(convert);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
for (const r of results) {
  fs.writeFileSync(path.join(outDir, `${r.id}.ts`), r.ts);
  console.log(`✓ ${r.id}: ${r.scenes} scenes, ${r.choices} choices → src/content/${r.id}.ts`);
}

// Registry of every generated episode.
const all = fs.readdirSync(outDir).filter((f) => /^ep\d+\.ts$/.test(f)).map((f) => f.slice(0, -3)).sort();
fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `// Generated by scripts/story-to-ts.mjs — lists every playable episode.\n` +
    `import type { Episode } from "./types";\n` +
    all.map((e) => `import { ${e} } from "./${e}";`).join("\n") +
    `\n\nexport const episodeContent: Record<string, Episode> = { ${all.join(", ")} };\n`,
);
