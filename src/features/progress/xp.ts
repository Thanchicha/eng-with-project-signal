import type { Progress } from "./progressStorage";

// XP rewards doing things — listening, answering, speaking, finishing — never being "right".
// It is derived from progress already stored, so nothing new is saved and a wrong answer never
// costs anything (brief Final §7: indicators reflect practice, not ability).
export const XP_RULES = {
  listeningCheck: 10,
  speakingAttempt: 15,
  choiceViewed: 5,
  writingTried: 5,
  wordSaved: 3,
  replay: 2,
  replayCapPerEpisode: 10, // at most 10 replays (20 XP) count per episode
  episodeCompleted: 50,
} as const;

export const XP_PER_LEVEL = 200;

export interface XpSummary {
  total: number;
  level: number;
  intoLevel: number;
  perLevel: number;
}

export function xpTotal(p: Progress): number {
  const replays = Object.values(p.replays).reduce((n, r) => n + Math.min(r, XP_RULES.replayCapPerEpisode), 0);
  return (
    p.triedChecks.length * XP_RULES.listeningCheck +
    p.spokenIds.length * XP_RULES.speakingAttempt +
    p.viewedChoices.length * XP_RULES.choiceViewed +
    p.triedDrills.length * XP_RULES.writingTried +
    p.savedVocabulary.length * XP_RULES.wordSaved +
    replays * XP_RULES.replay +
    p.completedEpisodes.length * XP_RULES.episodeCompleted
  );
}

export function xpSummary(p: Progress): XpSummary {
  const total = xpTotal(p);
  return { total, level: Math.floor(total / XP_PER_LEVEL) + 1, intoLevel: total % XP_PER_LEVEL, perLevel: XP_PER_LEVEL };
}

/** XP earned inside one episode (for the recap); ids are prefixed with the episode id. */
export function episodeXp(p: Progress, episodeId: string): number {
  const mine = (ids: string[]) => ids.filter((id) => id.startsWith(`${episodeId}_`)).length;
  return (
    mine(p.triedChecks) * XP_RULES.listeningCheck +
    mine(p.spokenIds) * XP_RULES.speakingAttempt +
    mine(p.viewedChoices) * XP_RULES.choiceViewed +
    mine(p.triedDrills) * XP_RULES.writingTried +
    Math.min(p.replays[episodeId] ?? 0, XP_RULES.replayCapPerEpisode) * XP_RULES.replay +
    (p.completedEpisodes.includes(episodeId) ? XP_RULES.episodeCompleted : 0)
  );
}
