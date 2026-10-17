import { useCallback, useEffect, useState } from "react";
import { episodeSummaries } from "../../content/episodes";

// Spec 08 §12 — everything stays in this browser; no names, emails, audio or real school data.
const KEY = "project-signal:progress:v1";

export interface Progress {
  lastEpisodeId?: string;
  lastSceneId?: string;
  completedEpisodes: string[];
  savedVocabulary: string[];
  triedDrills: string[];
  practicedPatterns: string[];
  /** Choice ids whose feedback the player opened — the recap derives skills from their tags. */
  viewedChoices: string[];
  settings: Settings;
}

export interface Settings {
  thaiHints: boolean;
  textSize: "normal" | "large";
  /** Show the English transcript before/while listening instead of after the listening check. */
  alwaysShowTranscript: boolean;
  /** Playback speed for character voices. */
  audioRate: 1 | 0.75;
  /** No audio at all — read every line (no-sound situations or missing voices). */
  textOnly: boolean;
  /** Mic answers need explicit consent after the privacy notice; "unset" = not asked yet. */
  micConsent: "unset" | "granted" | "declined";
}

export const defaultSettings: Settings = {
  // thaiHints = show the Thai translation under every line. Off by default: spec 05 §8 says
  // translations help but should be opened by the player, not shown for everything automatically.
  thaiHints: false,
  textSize: "normal",
  alwaysShowTranscript: false,
  audioRate: 1,
  textOnly: false,
  micConsent: "unset",
};

export const defaultProgress: Progress = {
  completedEpisodes: [],
  savedVocabulary: [],
  triedDrills: [],
  practicedPatterns: [],
  viewedChoices: [],
  settings: defaultSettings,
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...defaultProgress, ...parsed, settings: sanitizeSettings(parsed.settings) };
  } catch {
    return defaultProgress;
  }
}

/** Merge stored settings over defaults, dropping values an older or edited save can't use. */
function sanitizeSettings(raw: Partial<Settings> | undefined): Settings {
  const s = { ...defaultSettings, ...raw };
  if (s.audioRate !== 1 && s.audioRate !== 0.75) s.audioRate = defaultSettings.audioRate;
  if (!["unset", "granted", "declined"].includes(s.micConsent)) s.micConsent = defaultSettings.micConsent;
  return s;
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage blocked (private mode, quota) — the game still works for this visit.
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  useEffect(() => saveProgress(progress), [progress]);
  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  return { progress, update };
}

/** Playable episodes unlock in order: EP1 is open, each next one opens when the previous is completed. */
export function isUnlocked(episodeId: string, progress: Progress): boolean {
  const ep = episodeSummaries.find((e) => e.id === episodeId);
  if (!ep?.playable) return false;
  if (ep.number === 1) return true;
  const prev = episodeSummaries.find((e) => e.number === ep.number - 1);
  return !!prev && progress.completedEpisodes.includes(prev.id);
}

export function resetProgress(): Progress {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored or storage blocked — the in-memory reset still applies.
  }
  return defaultProgress;
}

/** Episode ids the player has reached (unlocked), in order — used to decide which vocabulary they have met. */
export function reachedEpisodeIds(progress: Progress): string[] {
  return episodeSummaries.filter((e) => isUnlocked(e.id, progress)).map((e) => e.id);
}
