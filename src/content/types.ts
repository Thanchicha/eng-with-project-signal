// Content schema — spec 08 §11, extended to cover every section of docs/story/FORMAT.md.

export type Level = "A2" | "B1";

export type CharacterId = "kuro" | "miyu" | "chief" | "rei" | "lena" | "shion";

export interface Character {
  id: CharacterId;
  name: string;
  /** What teammates call them in dialogue (e.g. "Chief"). */
  callName: string;
  role: string;
  roleTh: string;
  traitsTh: string;
  /** Placeholder avatar: initials + accent color, no image API. */
  avatar: { initials: string; color: string };
}

/** Story speakers include supporting cast ("Student (Sora)", "Teacher", "Mei") as free text. */
export type SpeakerId = CharacterId | "narration" | "screen" | (string & {});

export interface VocabularyItem {
  id: string;
  en: string;
  th: string;
  example: string;
}

export interface DialogueLine {
  speakerId: SpeakerId;
  /** Display label when the speaker is not a main character, e.g. "Student (Sora)". */
  speakerLabel?: string;
  textEn: string;
  textTh?: string;
  /** `text` is the exact substring of textEn to make tappable (may differ from the vocab form, e.g. "users" → user). */
  vocabularyRefs?: { id: string; text: string }[];
}

/** FORMAT.md four-part feedback (spec 05 §8). */
export interface Feedback {
  communicatedTh: string;
  naturalOption: string;
  whyItWorksTh: string;
  tryPattern: string;
}

export interface Choice {
  id: string;
  textEn: string;
  feedback: Feedback;
  skillTags: string[];
  /** Scene id, or "end" to finish the story part. Every choice moves on — no dead ends. */
  nextSceneId: string;
}

export interface ChoiceInteraction {
  promptEn: string;
  promptTh: string;
  choices: Choice[];
}

export interface Scene {
  id: string;
  title: string;
  objective: string;
  objectiveTh: string;
  dialogue: DialogueLine[];
  interaction?: ChoiceInteraction;
  nextSceneId?: string;
}

export interface SentencePattern {
  pattern: string;
  example: string;
  substitutions: string[];
}

export type DrillType = "substitution" | "reorder" | "fill" | "write";

export interface Drill {
  id: string;
  type: DrillType;
  promptTh: string;
  prompt: string;
  hint: string;
  /** Shown via "Show Example"; checking is lenient and never blocks progress. */
  acceptedExamples: string[];
}

export interface SpeakPractice {
  situationTh: string;
  lines: DialogueLine[];
}

export interface MiniCase {
  columns: string[];
  rows: (string | number)[][];
  /** Column indexes to right-align (numbers). */
  numericColumns?: number[];
  noteTh?: string;
  stakeholderQuote: string;
  stakeholderLabelTh: string;
  questions: string[];
  templates: string[];
  sampleAnswer: string;
}

export interface Recap {
  bulletsTh: string[];
  reviewVocabulary: string[];
  reviewPatterns: string[];
  nextTeaserTh: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  level: Level;
  roles: string[];
  summaryTh: string;
  learningGoals: string[];
  contextTh: string;
  goalTh: string;
  vocabulary: VocabularyItem[];
  scenes: Scene[];
  analystNote: string[];
  businessLesson: { title: string; bodyTh: string[] };
  sentencePatterns: SentencePattern[];
  drills: Drill[];
  speakPractice: SpeakPractice;
  miniCase: MiniCase;
  recap: Recap;
}

/** Card shown on the episode map; `playable` episodes have a full Episode in content. */
export interface EpisodeSummary {
  id: string;
  number: number;
  title: string;
  mysteryTh: string;
  rolesTh: string;
  languageFocusTh: string;
  playable: boolean;
}
