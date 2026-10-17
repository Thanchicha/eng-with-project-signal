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
  settings: { thaiHints: boolean; textSize: "normal" | "large" };
}

export const defaultProgress: Progress = {
  completedEpisodes: [],
  savedVocabulary: [],
  triedDrills: [],
  practicedPatterns: [],
  viewedChoices: [],
  // thaiHints = show the Thai translation under every line. Off by default: spec 05 §8 says
  // translations help but should be opened by the player, not shown for everything automatically.
  settings: { thaiHints: false, textSize: "normal" },
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...defaultProgress, ...parsed, settings: { ...defaultProgress.settings, ...parsed.settings } };
  } catch {
    return defaultProgress;
  }
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
