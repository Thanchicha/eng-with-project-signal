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

/** Builds a DialogueLine from a speaker label and English/Thai text. */
function makeLine(speaker, en, th, resolve) {
  const key = speaker.trim().toLowerCase();
  const { text, refs } = resolve(en);
  const plain = key === "narration" || key === "screen";
  const entry = { speakerId: MAIN_CAST[key] ?? (plain ? key : key.replace(/\W+/g, "-").replace(/^-+|-+$/g, "")), textEn: text };
  if (th) entry.textTh = th;
  if (!MAIN_CAST[key] && !plain) entry.speakerLabel = speaker.trim();
  if (refs.length) entry.vocabularyRefs = refs;
  return entry;
}

/** `Speaker: "EN" | "TH"` (Thai optional). */
function parseLine(line, resolve) {
  const m = line.match(/^([A-Z][^:"]*):\s*"(.*?)"\s*(?:\|\s*"(.*)")?\s*$/);
  return m ? makeLine(m[1], m[2], m[3], resolve) : null;
}

function parseDialogue(file, lines, resolve) {
  return lines.map((l) => parseLine(l, resolve)).filter(Boolean);
}

/** Splits `"a" ; "b"` lists. */
const quotedList = (v) => v.split(/\s*;\s*/).map((x) => unquote(x)).filter(Boolean);

const FEEDBACK_KEYS = {
  "You communicated": "communicatedTh",
  "A natural option": "naturalOption",
  "Why it works": "whyItWorksTh",
  "Try a pattern": "tryPattern",
};

const SPEAK_FEEDBACK_KEYS = {
  "You communicated": "communicatedTh",
  "A natural option": "naturalOption",
  "One small improvement": "improvementTh",
};

function parseListeningCheck(file, sceneId, lines) {
  const check = { id: `${sceneId}_listen`, promptTh: "", type: "gist", choices: [], answerId: "", feedbackTh: "" };
  for (const l of lines) {
    const choice = l.match(/^\s{2,}-\s+(\w+):\s*(.*)$/);
    if (choice) {
      check.choices.push({ id: choice[1], labelTh: choice[2].trim() });
      continue;
    }
    const p = kv(l);
    if (!p) continue;
    const [k, v] = p;
    if (k === "promptTh") check.promptTh = v;
    if (k === "type") check.type = v;
    if (k === "answer") check.answerId = v;
    if (k === "feedbackTh") check.feedbackTh = v;
  }
  if (!check.promptTh || !check.feedbackTh) fail(file, `${check.id} needs promptTh and feedbackTh`);
  if (!["gist", "detail"].includes(check.type)) fail(file, `${check.id} type must be gist or detail`);
  if (check.choices.length < 2 || check.choices.length > 4) fail(file, `${check.id} needs 2–4 choices`);
  if (!check.choices.some((c) => c.id === check.answerId)) fail(file, `${check.id} answer "${check.answerId}" is not a choice`);
  return check;
}

function parseSpeakingPrompt(file, sceneId, lines, resolve) {
  const sp = {
    id: `${sceneId}_speak`,
    situationTh: "",
    promptEn: "",
    goal: "ask",
    phraseFrames: [],
    modelResponses: [],
    acceptedIntentsTh: [],
    feedback: {},
  };
  let askedBy = "";
  let askLine = "";
  for (const l of lines) {
    const p = kv(l);
    if (!p) continue;
    const [k, v] = p;
    if (k === "situationTh") sp.situationTh = v;
    else if (k === "promptEn") sp.promptEn = v;
    else if (k === "goal") sp.goal = v;
    else if (k === "askedBy") askedBy = v;
    else if (k === "askLine") askLine = v;
    else if (k === "phraseFrames") sp.phraseFrames = quotedList(v);
    else if (k === "modelResponses") sp.modelResponses = quotedList(v);
    else if (k === "acceptedIntents") sp.acceptedIntentsTh = v.split(/\s*;\s*/).filter(Boolean);
    else if (SPEAK_FEEDBACK_KEYS[k]) sp.feedback[SPEAK_FEEDBACK_KEYS[k]] = SPEAK_FEEDBACK_KEYS[k] === "naturalOption" ? unquote(v) : v;
  }
  if (askedBy && askLine) {
    const m = askLine.match(/^"(.*?)"\s*(?:\|\s*"(.*)")?$/);
    if (m) sp.askedBy = makeLine(askedBy, m[1], m[2], resolve);
    else fail(file, `${sp.id} askLine must be "EN" or "EN" | "TH"`);
  }
  if (!["ask", "clarify", "summarize", "report", "suggest"].includes(sp.goal)) fail(file, `${sp.id} has unknown goal "${sp.goal}"`);
  if (!sp.situationTh || !sp.promptEn) fail(file, `${sp.id} needs situationTh and promptEn`);
  if (!sp.phraseFrames.length || !sp.modelResponses.length) fail(file, `${sp.id} needs phraseFrames and modelResponses`);
  for (const f of Object.values(SPEAK_FEEDBACK_KEYS)) if (!sp.feedback[f]) fail(file, `${sp.id} missing feedback "${f}"`);
  return sp;
}

function parseScene(file, sec, resolve) {
  const [head] = sec.heading.split(" — ").slice(1);
  const scene = { id: "", title: head ?? sec.heading, objective: "", objectiveTh: "", dialogue: [] };
  // Scene body, then ### subsections (Listening Check, Speak to Continue, Interaction).
  const subs = sections(sec.lines, 3);
  const firstSub = sec.lines.findIndex((l) => l.startsWith("### "));
  const body = firstSub >= 0 ? sec.lines.slice(0, firstSub) : sec.lines;
  for (const l of body) {
    const p = kv(l);
    if (p && p[0] === "id") scene.id = p[1];
    if (p && p[0] === "objective") scene.objective = p[1];
    if (p && p[0] === "objectiveTh") scene.objectiveTh = p[1];
    if (p && p[0] === "listenFor") scene.listenForTh = p[1];
    if (p && p[0] === "background") {
      if (!/^bg_[a-z0-9_]+$/.test(p[1])) fail(file, `${scene.id || sec.heading} background must look like bg_place_time`);
      scene.background = p[1];
    }
  }
  scene.dialogue = parseDialogue(file, body, resolve);
  if (!scene.id) fail(file, `scene "${sec.heading}" has no id`);
  if (!scene.dialogue.length) fail(file, `scene ${scene.id} has no dialogue`);

  const listen = subs.find((s) => s.heading === "Listening Check");
  if (listen) scene.listeningCheck = parseListeningCheck(file, scene.id, listen.lines);
  const speak = subs.find((s) => s.heading === "Speak to Continue");
  if (speak) scene.speakingPrompt = parseSpeakingPrompt(file, scene.id, speak.lines, resolve);

  const interactionSec = subs.find((s) => s.heading === "Interaction");
  if (interactionSec) {
    const iLines = interactionSec.lines;
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

  // v2 scripts (FORMAT.md) open with "Before Listening"; older reading-first scripts with "Before Reading".
  const format = get("Before Listening") ? 2 : 1;
  const br = need(format === 2 ? "Before Listening" : "Before Reading").lines;
  const field = (label) => stripBold(br.find((l) => l.startsWith(`**${label}:**`)) ?? "").replace(`${label}:`, "").trim();
  const hintWords = field("คำใบ้ก่อนฟัง").split(",").map((w) => w.trim()).filter(Boolean);
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

  // Shadow & Substitute (v2): listen to a model phrase, then speak.
  const shadowItems = [];
  for (const l of get("Shadow & Substitute")?.lines ?? []) {
    const m = l.match(/^\d+\.\s+mode:\s*(\w+)/);
    if (m) {
      shadowItems.push({ id: `${id}_sh${shadowItems.length + 1}`, mode: m[1], promptTh: "", modelPhrase: "", substitutions: [], hint: "", examples: [] });
      continue;
    }
    const p = kv(l);
    if (!p || !shadowItems.length) continue;
    const it = shadowItems.at(-1);
    const [k, v] = p;
    if (k === "modelPhrase" || k === "frame") it[k] = unquote(v);
    else if (k === "substitutions") it.substitutions = v.split(/\s+\/\s+/).map((x) => x.trim());
    else if (k === "examples") it.examples = quotedList(v);
    else if (k === "promptTh" || k === "hint") it[k] = v;
  }
  for (const it of shadowItems) {
    if (!["shadow", "substitute"].includes(it.mode)) fail(file, `${it.id} mode must be shadow or substitute`);
    if (!it.modelPhrase || !it.promptTh) fail(file, `${it.id} needs modelPhrase and promptTh`);
  }

  // Write by Yourself (v2, optional practice) — older scripts call it Drills.
  const drills = [];
  for (const l of (get("Write by Yourself") ?? need("Drills")).lines) {
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
  if (format === 1 && (drills.length < 3 || drills.length > 5)) fail(file, `expected 3–5 drills (has ${drills.length})`);

  // Speak practice: character lines are played; "Intern: <Thai prompt> => "model"" is the player's turn.
  // Older scripts write the intern's lines as plain dialogue — those become turns with a generic prompt.
  const sp = need("Speak Like an Intern").lines;
  const plain = (t) => ({ text: t, refs: [] });
  const turns = [];
  for (const l of sp) {
    const intern = l.match(/^Intern:\s*(.+?)\s*=>\s*"(.*)"\s*$/);
    if (intern) {
      turns.push({ kind: "intern", promptTh: intern[1], model: intern[2] });
      continue;
    }
    const line = parseLine(l, plain);
    if (!line) continue;
    if (line.speakerId === "intern") turns.push({ kind: "intern", promptTh: "พูดประโยคของเด็กฝึกงานด้วยตัวเอง", model: line.textEn });
    else turns.push({ kind: "line", line });
  }
  const speakPractice = {
    situationTh: (sp.find((l) => l.startsWith("สถานการณ์:")) ?? "").replace("สถานการณ์:", "").trim(),
    turns,
    lines: turns.map((t) => (t.kind === "line" ? t.line : { speakerId: "intern", speakerLabel: "Intern", textEn: t.model })),
  };
  if (!turns.some((t) => t.kind === "intern")) fail(file, "Speak Like an Intern needs at least one Intern turn");

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
  // v2: `Briefing (Speaker): "EN" | "TH"` is played aloud; v1: `<ใคร>บอกว่า: "EN"` is shown as text.
  const briefingRaw = mc.map((l) => l.match(/^Briefing\s*\(([^)]+)\):\s*(".*)$/)).find(Boolean);
  const briefing = briefingRaw ? parseLine(`${briefingRaw[1]}: ${briefingRaw[2]}`, resolve) : undefined;
  if (briefingRaw && !briefing) fail(file, 'Mini Case briefing must be Briefing (Speaker): "EN" | "TH"');
  const quoteLine = mc.find((l) => /บอกว่า:/.test(l)) ?? "";
  const [qLabel, ...qRest] = quoteLine.split(":");
  const miniCase = {
    columns: mt?.header ?? [],
    rows: mt?.body.map((r) => r.map(toCell)) ?? [],
    numericColumns: mt?.numeric ?? [],
    ...(briefing ? { briefing } : {}),
    stakeholderLabelTh: briefing ? `${briefing.speakerLabel ?? briefingRaw[1]} พูดว่า` : qLabel.trim(),
    stakeholderQuote: briefing ? briefing.textEn : unquote(qRest.join(":")),
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
    else if (m && m[1] === "ภารกิจเสียง") recap.voiceMissionTh = m[2].trim();
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
    format,
    ...(meta.listeningMission ? { listeningMissionTh: meta.listeningMission } : {}),
    ...(meta.speakingMission ? { speakingMissionTh: meta.speakingMission } : {}),
    contextTh: field("สถานการณ์"),
    goalTh: field(format === 2 ? "เป้าหมายการฟัง" : "เป้าหมาย"),
    hintWords,
    vocabulary,
    scenes,
    analystNote: bullets(need("Analyst Note").lines),
    businessLesson,
    sentencePatterns,
    shadowItems,
    drills,
    speakPractice,
    miniCase,
    recap,
  };
  if (!["A2", "B1"].includes(episode.level)) fail(file, `level must be A2 or B1`);

  // Listening/speaking-first requirements (brief Final §10, §14) apply to v2 scripts.
  if (format === 2) {
    const speaking = scenes.filter((s) => s.speakingPrompt).length;
    for (const s of scenes) if (!s.listeningCheck) fail(file, `${s.id} needs a "### Listening Check"`);
    if (speaking < 3) fail(file, `needs "### Speak to Continue" in at least 3 scenes (has ${speaking})`);
    if (hintWords.length < 2 || hintWords.length > 3) fail(file, `คำใบ้ก่อนฟัง needs 2–3 words (has ${hintWords.length})`);
    if (!episode.goalTh) fail(file, "Before Listening needs **เป้าหมายการฟัง:**");
    if (shadowItems.length < 3 || shadowItems.length > 5) fail(file, `Shadow & Substitute needs 3–5 items (has ${shadowItems.length})`);
    if (!briefing) fail(file, "Mini Case needs a Briefing line");
    if (!episode.listeningMissionTh || !episode.speakingMissionTh) fail(file, "Meta needs listeningMission and speakingMission");
  }

  const ts =
    `// Generated by scripts/story-to-ts.mjs from docs/story/${id}.md — edit the markdown, then run \`npm run content\`.\n` +
    `import type { Episode } from "./types";\n\n` +
    `export const ${id}: Episode = ${JSON.stringify(episode, null, 2)};\n`;
  return {
    id,
    ts,
    format,
    scenes: scenes.length,
    choices: scenes.reduce((n, s) => n + (s.interaction?.choices.length ?? 0), 0),
    checks: scenes.filter((s) => s.listeningCheck).length,
    speaking: scenes.filter((s) => s.speakingPrompt).length,
  };
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
  console.log(
    `✓ ${r.id} (format v${r.format}): ${r.scenes} scenes, ${r.checks} listening checks, ${r.speaking} speaking prompts, ${r.choices} choices → src/content/${r.id}.ts`,
  );
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
