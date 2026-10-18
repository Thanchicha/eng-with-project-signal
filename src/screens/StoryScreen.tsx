import { useEffect, useRef, useState } from "react";
import { navigate } from "../app/router";
import VNStage from "../components/VNStage";
import ChapterClear from "../components/ChapterClear";
import ChoiceList from "../components/ChoiceList";
import FeedbackCard from "../components/FeedbackCard";
import ListeningCheck from "../components/ListeningCheck";
import QuestPanel from "../components/QuestPanel";
import RoleTurns from "../components/RoleTurns";
import SpeakResponse from "../components/SpeakResponse";
import VocabularyPopover from "../components/VocabularyPopover";
import { episodeContent } from "../content";
import { careerById } from "../content/careers";
import { characters } from "../content/characters";
import type { Chapter, CharacterId, Episode, Scene } from "../content/types";
import {
  chapterOfScene,
  isChapterUnlocked,
} from "../features/progress/chapters";
import {
  addOnce,
  countReplay,
  isUnlocked,
  type Progress,
} from "../features/progress/progressStorage";
import "./StoryScreen.css";

interface Props {
  episodeId: string;
  /** Start at this chapter (from the episode page); otherwise resume the last scene. */
  chapterId?: string;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

export default function StoryScreen({
  episodeId,
  chapterId,
  progress,
  update,
}: Props) {
  const ep = episodeContent[episodeId];
  const startChapter = ep?.chapters?.find((c) => c.id === chapterId);
  const startIndex = Math.max(
    0,
    ep && startChapter && isChapterUnlocked(ep, startChapter, progress)
      ? ep.scenes.findIndex(
          (s) =>
            // Resume inside this chapter after a refresh; otherwise start at its first scene.
            s.id ===
            (progress.lastEpisodeId === episodeId &&
            progress.lastSceneId &&
            startChapter.sceneIds.includes(progress.lastSceneId)
              ? progress.lastSceneId
              : startChapter.sceneIds[0]),
        )
      : ep && progress.lastEpisodeId === episodeId
        ? ep.scenes.findIndex((s) => s.id === progress.lastSceneId)
        : 0,
  );
  const [sceneIndex, setSceneIndex] = useState(startIndex);
  /** Set when the player reaches the end of a chapter: the Chapter clear card replaces the scene. */
  const [cleared, setCleared] = useState<{
    chapter: Chapter;
    nextId: string;
  }>();
  const clearHeading = useRef<HTMLHeadingElement>(null);
  const [vocabId, setVocabId] = useState<string | null>(null);
  const sceneHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const scene = ep?.scenes[sceneIndex];

  // Remember where the player is, so refresh and "Continue" resume this scene.
  useEffect(() => {
    if (!scene) return;
    update((p) =>
      p.lastEpisodeId === episodeId && p.lastSceneId === scene.id
        ? p
        : { ...p, lastEpisodeId: episodeId, lastSceneId: scene.id },
    );
  }, [episodeId, scene, update]);

  useEffect(() => {
    if (cleared) clearHeading.current?.focus();
  }, [cleared]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    sceneHeading.current?.focus();
  }, [sceneIndex]);

  if (!ep || !scene || !isUnlocked(episodeId, progress)) {
    return (
      <section className="story-missing">
        <h1>ตอนนี้ยังเล่นไม่ได้</h1>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate({ name: "home" })}
        >
          กลับแผนที่คดี
        </button>
      </section>
    );
  }

  const chapter = chapterOfScene(ep, scene.id);
  const chapters = ep.chapters ?? [];

  const goTo = (nextId: string, fromClear = false) => {
    const idx = ep.scenes.findIndex((s) => s.id === nextId);
    // Leaving a chapter (or the story) shows the Chapter clear card first.
    if (
      chapter &&
      !fromClear &&
      chapterOfScene(ep, nextId)?.id !== chapter.id
    ) {
      update((p) => ({
        ...addOnce(p, "completedChapters", chapter.id),
        lastEpisodeId: episodeId,
        lastSceneId: idx < 0 ? "learn" : nextId,
      }));
      setCleared({ chapter, nextId });
      window.scrollTo(0, 0);
      return;
    }
    setCleared(undefined);
    if (nextId === "end" || idx < 0) {
      update((p) => ({ ...p, lastSceneId: "learn" }));
      navigate({ name: "learn", episodeId });
      return;
    }
    setSceneIndex(idx);
    window.scrollTo(0, 0);
  };

  const vocabItem = ep.vocabulary.find((v) => v.id === vocabId) ?? null;
  const { settings } = progress;

  return (
    <article className="story">
      <div className="story__top">
        <a className="story__back" href={`#/ep/${ep.id}`}>
          Episode {ep.number}
        </a>
        <button
          type="button"
          className="story__toggle"
          aria-pressed={settings.thaiHints}
          onClick={() =>
            update((p) => ({
              ...p,
              settings: { ...p.settings, thaiHints: !p.settings.thaiHints },
            }))
          }
        >
          คำแปลไทยทุกบรรทัด: {settings.thaiHints ? "เปิด" : "ปิด"}
        </button>
      </div>

      <h1 ref={sceneHeading} tabIndex={-1} className="story__title">
        <span className="story__scene-num">
          {careerById(progress.career)?.nameEn ?? "Team 2-A"}{" "}
          <span aria-hidden="true">|</span> Episode {ep.number}
          {cleared
            ? `, บทที่ ${cleared.chapter.number} จาก ${chapters.length}`
            : chapter
              ? `, บทที่ ${chapter.number} จาก ${chapters.length}, ฉาก ${chapter.sceneIds.indexOf(scene.id) + 1} จาก ${chapter.sceneIds.length}`
              : `, ฉาก ${sceneIndex + 1} จาก ${ep.scenes.length}`}
        </span>
        {chapter && !cleared && (
          <span className="story__chapter" lang="en">
            Chapter {chapter.number}: {chapter.title} · คุณรับบท {characters[chapter.leadId].callName}
          </span>
        )}
        <span lang="en">{cleared ? cleared.chapter.title : scene.title}</span>
      </h1>

      {cleared ? (
        <ChapterClear
          ref={clearHeading}
          chapter={cleared.chapter}
          chapterCount={chapters.length}
          next={chapterOfScene(ep, cleared.nextId)}
          settings={settings}
          onConsent={(value) =>
            update((p) => ({
              ...p,
              settings: { ...p.settings, micConsent: value },
            }))
          }
          onSpoken={() =>
            update((p) =>
              addOnce(p, "spokenIds", `${cleared.chapter.id}_phrase`),
            )
          }
          onNext={() => {
            const next = chapterOfScene(ep, cleared.nextId);
            // A new chapter gets its own URL, so refresh and back keep the player in it.
            if (next && chapterId !== undefined)
              navigate({ name: "play", episodeId, chapterId: next.id });
            else goTo(cleared.nextId, true);
          }}
          onPause={() => navigate({ name: "intro", episodeId })}
        />
      ) : (
        <>
          <QuestPanel
            objective={scene.objective}
            objectiveTh={scene.objectiveTh}
            sceneNumber={
              chapter ? chapter.sceneIds.indexOf(scene.id) + 1 : sceneIndex + 1
            }
            sceneCount={chapter ? chapter.sceneIds.length : ep.scenes.length}
          />

          <SceneFlow
            key={scene.id}
            episode={ep}
            scene={scene}
            leadId={chapter?.leadId}
            nextLabel={
              sceneIndex === ep.scenes.length - 1
                ? chapter
                  ? `จบบทที่ ${chapter.number}`
                  : "จบเรื่อง ไปบทเรียนต่อ"
                : chapter && chapter.sceneIds.at(-1) === scene.id
                  ? `จบบทที่ ${chapter.number}`
                  : "ไปฉากต่อไป"
            }
            progress={progress}
            update={update}
            onVocab={setVocabId}
            onNext={(id) => goTo(id)}
          />
        </>
      )}

      <VocabularyPopover
        item={vocabItem}
        saved={!!vocabId && progress.savedVocabulary.includes(vocabId)}
        onToggleSave={(id) =>
          update((p) => ({
            ...p,
            savedVocabulary: p.savedVocabulary.includes(id)
              ? p.savedVocabulary.filter((v) => v !== id)
              : [...p.savedVocabulary, id],
          }))
        }
        onClose={() => setVocabId(null)}
      />
    </article>
  );
}

interface FlowProps {
  episode: Episode;
  scene: Scene;
  /** Character the player plays in this chapter (undefined for episodes without chapters). */
  leadId?: CharacterId;
  /** Label of the button that leaves the scene. */
  nextLabel: string;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  onVocab: (id: string) => void;
  onNext: (sceneId: string) => void;
}

/**
 * One scene, in the order of spec 05 §7: listen → listening check → transcript opens →
 * speak to continue → (optional) see other choices → next scene. Keyed by scene id, so
 * every scene starts fresh.
 */
function SceneFlow({
  episode,
  scene,
  leadId,
  nextLabel,
  progress,
  update,
  onVocab,
  onNext,
}: FlowProps) {
  const { settings } = progress;
  const check = scene.listeningCheck;
  const speak = scene.speakingPrompt;
  const interaction = scene.interaction;
  // v2 episodes speak first and offer choices as optional support; v1 episodes still need a choice.
  const choicesOptional = episode.format === 2 && !!speak;

  const [heard, setHeard] = useState(false);
  const [checked, setChecked] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [roleDone, setRoleDone] = useState(false);
  const [showChoices, setShowChoices] = useState(!choicesOptional);
  const [selectedId, setSelectedId] = useState<string>();
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  const checkRef = useRef<HTMLHeadingElement>(null);
  const speakRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);

  const listenDone = heard && (!check || checked);
  // After the first listen and check, the player takes the lead's seat and says that character's lines.
  const hasRole =
    !!leadId && scene.dialogue.some((l) => l.speakerId === leadId);
  const roleVisible = listenDone && hasRole && !roleDone;
  const afterRole = listenDone && (!hasRole || roleDone);
  const speakVisible = afterRole && !!speak;
  const afterSpeak = afterRole && (!speak || spoken);
  const choicesVisible = afterSpeak && !!interaction && showChoices;
  const selected = interaction?.choices.find((c) => c.id === selectedId);
  const canContinue =
    afterSpeak && (choicesOptional || !interaction || !!selected);

  useEffect(() => {
    if (heard && check) checkRef.current?.focus();
  }, [heard, check]);
  useEffect(() => {
    if (roleVisible) roleRef.current?.scrollIntoView({ block: "start" });
  }, [roleVisible]);
  useEffect(() => {
    if (speakVisible) speakRef.current?.focus();
  }, [speakVisible]);
  useEffect(() => {
    if (choicesVisible && !selectedId) choicesRef.current?.focus();
  }, [choicesVisible, selectedId]);
  useEffect(() => {
    if (selectedId) feedbackRef.current?.focus();
  }, [selectedId]);

  const choose = (id: string) => {
    setSelectedId(id);
    setViewedIds((v) => (v.includes(id) ? v : [...v, id]));
    update((p) => addOnce(p, "viewedChoices", id));
  };

  const next = () =>
    onNext(selected?.nextSceneId ?? scene.nextSceneId ?? "end");

  return (
    <div className="scene-flow">
      {scene.listenForTh && (
        <p className="scene-flow__listen-for">
          <strong>ฟังเพื่อ:</strong> {scene.listenForTh}
        </p>
      )}

      <VNStage
        lines={scene.dialogue}
        background={scene.background}
        vocabulary={episode.vocabulary}
        rate={settings.audioRate}
        onRateChange={(rate) =>
          update((p) => ({
            ...p,
            settings: { ...p.settings, audioRate: rate },
          }))
        }
        revealTranscript={
          settings.alwaysShowTranscript || (check ? checked : heard)
        }
        textOnly={settings.textOnly}
        showThaiAll={settings.thaiHints}
        onVocab={onVocab}
        onHeard={() => setHeard(true)}
        onReplay={() => update((p) => countReplay(p, episode.id))}
      />

      {heard && check && (
        <ListeningCheck
          ref={checkRef}
          check={check}
          onAnswered={() => {
            setChecked(true);
            update((p) => addOnce(p, "triedChecks", check.id));
          }}
        />
      )}

      {roleVisible && leadId && (
        <div ref={roleRef}>
          <RoleTurns
            lines={scene.dialogue}
            leadId={leadId}
            settings={settings}
            onConsent={(value) =>
              update((p) => ({
                ...p,
                settings: { ...p.settings, micConsent: value },
              }))
            }
            onDone={() => {
              update((p) => addOnce(p, "spokenIds", `${scene.id}_role`));
              setRoleDone(true);
            }}
          />
        </div>
      )}

      {speakVisible && (
        <SpeakResponse
          ref={speakRef}
          prompt={speak}
          settings={settings}
          onConsent={(value) =>
            update((p) => ({
              ...p,
              settings: { ...p.settings, micConsent: value },
            }))
          }
          onAttempt={() => update((p) => addOnce(p, "spokenIds", speak.id))}
          onDone={() => setSpoken(true)}
        />
      )}

      {afterSpeak && interaction && choicesOptional && (
        <button
          type="button"
          className="scene-flow__more"
          aria-expanded={showChoices}
          onClick={() => setShowChoices((v) => !v)}
        >
          {showChoices
            ? "ซ่อนทางเลือกอื่น"
            : "ดูผลของการพูดแบบอื่น (ไม่บังคับ)"}
        </button>
      )}

      {choicesVisible && (
        <>
          <ChoiceList
            ref={choicesRef}
            interaction={interaction}
            selectedId={selectedId}
            viewedIds={viewedIds}
            onSelect={choose}
          />
          {selected && (
            <FeedbackCard
              ref={feedbackRef}
              choice={selected}
              continueLabel={nextLabel}
              reactor={
                speak?.askedBy ??
                [...scene.dialogue]
                  .reverse()
                  .find(
                    (l) =>
                      l.speakerId !== "narration" && l.speakerId !== "screen",
                  )
              }
              onTryAgain={() => {
                setSelectedId(undefined);
                choicesRef.current?.focus();
              }}
              onContinue={next}
            />
          )}
        </>
      )}

      {canContinue && !selected && (
        <div className="scene-flow__next">
          <button type="button" className="btn btn--primary" onClick={next}>
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
