import { useEffect, useRef, useState } from "react";
import { navigate } from "../app/router";
import ChoiceList from "../components/ChoiceList";
import DialoguePanel from "../components/DialoguePanel";
import FeedbackCard from "../components/FeedbackCard";
import QuestPanel from "../components/QuestPanel";
import VocabularyPopover from "../components/VocabularyPopover";
import { episodeContent } from "../content";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import "./StoryScreen.css";

interface Props {
  episodeId: string;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

export default function StoryScreen({ episodeId, progress, update }: Props) {
  const ep = episodeContent[episodeId];
  const startIndex = Math.max(
    0,
    ep && progress.lastEpisodeId === episodeId ? ep.scenes.findIndex((s) => s.id === progress.lastSceneId) : 0,
  );
  const [sceneIndex, setSceneIndex] = useState(startIndex);
  const [revealed, setRevealed] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [vocabId, setVocabId] = useState<string | null>(null);

  const sceneHeading = useRef<HTMLHeadingElement>(null);
  const choicesHeading = useRef<HTMLHeadingElement>(null);
  const feedbackHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const scene = ep?.scenes[sceneIndex];
  const allShown = !!scene && revealed >= scene.dialogue.length;
  const selected = scene?.interaction?.choices.find((c) => c.id === selectedId);

  // Remember where the player is, so refresh and "Continue" resume this scene.
  useEffect(() => {
    if (!scene) return;
    update((p) =>
      p.lastEpisodeId === episodeId && p.lastSceneId === scene.id ? p : { ...p, lastEpisodeId: episodeId, lastSceneId: scene.id },
    );
  }, [episodeId, scene, update]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    sceneHeading.current?.focus();
  }, [sceneIndex]);

  useEffect(() => {
    if (allShown && !selectedId) choicesHeading.current?.focus();
  }, [allShown, selectedId]);

  useEffect(() => {
    if (selectedId) feedbackHeading.current?.focus();
  }, [selectedId]);

  if (!ep || !scene || !isUnlocked(episodeId, progress)) {
    return (
      <section className="story-missing">
        <h1>ตอนนี้ยังเล่นไม่ได้</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </section>
    );
  }

  const isLast = sceneIndex === ep.scenes.length - 1;
  const vocabItem = ep.vocabulary.find((v) => v.id === vocabId) ?? null;
  const thaiAll = progress.settings.thaiHints;

  const choose = (id: string) => {
    setSelectedId(id);
    setViewedIds((v) => (v.includes(id) ? v : [...v, id]));
    update((p) => (p.viewedChoices.includes(id) ? p : { ...p, viewedChoices: [...p.viewedChoices, id] }));
  };

  const goNext = () => {
    const next = selected?.nextSceneId ?? scene.nextSceneId ?? "end";
    const idx = ep.scenes.findIndex((s) => s.id === next);
    if (next === "end" || idx < 0) {
      update((p) => ({ ...p, lastSceneId: "learn" }));
      navigate({ name: "learn", episodeId });
      return;
    }
    setSceneIndex(idx);
    setRevealed(1);
    setSelectedId(undefined);
    setViewedIds([]);
    window.scrollTo(0, 0);
  };

  return (
    <article className="story">
      <div className="story__top">
        <a className="story__back" href={`#/ep/${ep.id}`}>
          Episode {ep.number}
        </a>
        <button
          type="button"
          className="story__toggle"
          aria-pressed={thaiAll}
          onClick={() => update((p) => ({ ...p, settings: { ...p.settings, thaiHints: !p.settings.thaiHints } }))}
        >
          คำแปลไทยทุกบรรทัด: {thaiAll ? "เปิด" : "ปิด"}
        </button>
      </div>

      <h1 ref={sceneHeading} tabIndex={-1} className="story__title">
        <span className="story__scene-num">ฉาก {sceneIndex + 1}</span>
        <span lang="en">{scene.title}</span>
      </h1>

      <QuestPanel
        objective={scene.objective}
        objectiveTh={scene.objectiveTh}
        sceneNumber={sceneIndex + 1}
        sceneCount={ep.scenes.length}
      />

      <p className="story__tip">แตะคำที่ขีดเส้นสีเหลืองเพื่อดูความหมาย</p>

      <DialoguePanel
        key={scene.id}
        lines={scene.dialogue.slice(0, revealed)}
        showThaiAll={thaiAll}
        onVocab={setVocabId}
      />

      {!allShown && (
        <div className="story__advance">
          <button type="button" className="btn btn--primary" onClick={() => setRevealed((n) => n + 1)}>
            ต่อไป
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setRevealed(scene.dialogue.length)}>
            แสดงทั้งฉาก
          </button>
          <span className="story__count" aria-live="off">
            {revealed}/{scene.dialogue.length}
          </span>
        </div>
      )}

      {allShown && scene.interaction && (
        <>
          <ChoiceList
            ref={choicesHeading}
            interaction={scene.interaction}
            selectedId={selectedId}
            viewedIds={viewedIds}
            onSelect={choose}
          />
          {selected && (
            <FeedbackCard
              ref={feedbackHeading}
              choice={selected}
              isLastScene={isLast}
              onTryAgain={() => {
                setSelectedId(undefined);
                choicesHeading.current?.focus();
              }}
              onContinue={goNext}
            />
          )}
        </>
      )}

      {allShown && !scene.interaction && (
        <div className="story__advance">
          <button type="button" className="btn btn--primary" onClick={goNext}>
            {isLast ? "จบเรื่อง ไปบทเรียนต่อ" : "ไปฉากต่อไป"}
          </button>
        </div>
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
