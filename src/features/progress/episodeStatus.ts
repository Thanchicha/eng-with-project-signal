import type { EpisodeStatus } from "../../components/EpisodeCard";
import { episodeSummaries } from "../../content/episodes";
import type { EpisodeSummary } from "../../content/types";
import { isUnlocked, type Progress } from "./progressStorage";

export function statusOf(ep: EpisodeSummary, progress: Progress): EpisodeStatus {
  if (progress.completedEpisodes.includes(ep.id)) return "done";
  if (isUnlocked(ep.id, progress)) return "open";
  return ep.playable ? "waiting" : "soon";
}

/** The episode the main "continue" button should open, and its label. */
export function nextEpisode(progress: Progress): { episode: EpisodeSummary; label: string; inProgress: boolean } {
  const playable = episodeSummaries.filter((e) => e.playable);
  const last = progress.lastEpisodeId;
  const inProgress = last && !progress.completedEpisodes.includes(last) ? episodeSummaries.find((e) => e.id === last) : undefined;
  const nextOpen = playable.find((e) => !progress.completedEpisodes.includes(e.id) && isUnlocked(e.id, progress));
  const episode = inProgress ?? nextOpen ?? playable[0];
  const label = inProgress ? `เล่นต่อ Episode ${episode.number}` : nextOpen ? `เริ่ม Episode ${episode.number}` : "เล่นซ้ำ Episode 1";
  return { episode, label, inProgress: !!inProgress };
}
