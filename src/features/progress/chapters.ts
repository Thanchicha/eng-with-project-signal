import type { Chapter, Episode } from "../../content/types";
import type { Progress } from "./progressStorage";

/** The chapter a scene belongs to (undefined for episodes without chapters). */
export function chapterOfScene(ep: Episode, sceneId: string): Chapter | undefined {
  return ep.chapters?.find((c) => c.sceneIds.includes(sceneId));
}

/** Chapters unlock in order; a finished episode opens all of them for replay. */
export function isChapterUnlocked(ep: Episode, chapter: Chapter, progress: Progress): boolean {
  if (chapter.number === 1 || progress.completedEpisodes.includes(ep.id)) return true;
  const prev = ep.chapters?.find((c) => c.number === chapter.number - 1);
  return !!prev && progress.completedChapters.includes(prev.id);
}

export type ChapterStatus = "done" | "current" | "open" | "locked";

export function chapterStatus(ep: Episode, chapter: Chapter, progress: Progress): ChapterStatus {
  if (progress.completedChapters.includes(chapter.id)) return "done";
  if (!isChapterUnlocked(ep, chapter, progress)) return "locked";
  const here = progress.lastEpisodeId === ep.id && progress.lastSceneId && chapter.sceneIds.includes(progress.lastSceneId);
  return here ? "current" : "open";
}
