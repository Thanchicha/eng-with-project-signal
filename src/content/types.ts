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
  /** Optional recorded audio; without it the AudioPlayer reads textEn with TTS. */
  audio?: { assetUrl?: string; voiceHint?: string; rate?: number };
}

/** Gist/detail question asked in Thai after the first listen (spec 08 §11). */
export interface ListeningCheck {
  id: string;
  promptTh: string;
  type: "gist" | "detail";
  choices: { id: string; labelTh: string }[];
  answerId: string;
  feedbackTh: string;
}

export type SpeakingGoal = "ask" | "clarify" | "summarize" | "report" | "suggest";

/** Feedback for a spoken/typed answer (spec 05 §8): shown after the attempt, never a score. */
export interface SpeakingFeedback {
  communicatedTh: string;
  naturalOption: string;
  improvementTh: string;
}

export interface SpeakingPrompt {
  id: string;
  situationTh: string;
  promptEn: string;
  /** The character who asks the player; their line is played before the player answers. */
  askedBy?: DialogueLine;
  goal: SpeakingGoal;
  phraseFrames: string[];
  /** Examples to compare with — not the only accepted answers. */
  modelResponses: string[];
  acceptedIntentsTh: string[];
  feedback: SpeakingFeedback;
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
  /** What to listen for in this scene (Thai, shown before playing). */
  listenForTh?: string;
  dialogue: DialogueLine[];
  listeningCheck?: ListeningCheck;
  speakingPrompt?: SpeakingPrompt;
  /** Optional choice support shown after speaking. */
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

/** Listen to a model phrase, then say it / swap words (spec 05 §7 "Shadow & Substitute"). */
export interface ShadowItem {
  id: string;
  mode: "shadow" | "substitute";
  promptTh: string;
  modelPhrase: string;
  frame?: string;
  substitutions: string[];
  hint: string;
  examples: string[];
}

/** Roleplay: character lines are played; on intern turns the player speaks first, then sees the model. */
export type RoleplayTurn =
  | { kind: "line"; line: DialogueLine }
  | { kind: "intern"; promptTh: string; model: string };

export interface SpeakPractice {
  situationTh: string;
  turns: RoleplayTurn[];
  /** Every line in order (intern turns use the model text) — for plain transcript views. */
  lines: DialogueLine[];
}

export interface MiniCase {
  columns: string[];
  rows: (string | number)[][];
  /** Column indexes to right-align (numbers). */
  numericColumns?: number[];
  noteTh?: string;
  /** Spoken briefing played before the player answers (EP1 v2 content). */
  briefing?: DialogueLine;
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
  voiceMissionTh?: string;
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
  /** Content format: 2 = listening/speaking-first (FORMAT.md v2), 1 = older reading-first scripts. */
  format: 1 | 2;
  listeningMissionTh?: string;
  speakingMissionTh?: string;
  contextTh: string;
  goalTh: string;
  /** 2–3 words shown before the first listen (full vocabulary opens after). */
  hintWords: string[];
  vocabulary: VocabularyItem[];
  scenes: Scene[];
  analystNote: string[];
  businessLesson: { title: string; bodyTh: string[] };
  sentencePatterns: SentencePattern[];
  shadowItems: ShadowItem[];
  /** Optional writing practice ("Write by Yourself"); older scripts call this Drills. */
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
  /** Spec 03 §6 "Listening / Speaking Mission" table. */
  listeningMissionTh: string;
  speakingMissionTh: string;
  playable: boolean;
}
