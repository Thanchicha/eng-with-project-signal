import { useEffect, useRef, useState } from "react";
import { navigate } from "../app/router";
import VNStage from "../components/VNStage";
import ChoiceList from "../components/ChoiceList";
import FeedbackCard from "../components/FeedbackCard";
import ListeningCheck from "../components/ListeningCheck";
import QuestPanel from "../components/QuestPanel";
import SpeakResponse from "../components/SpeakResponse";
import VocabularyPopover from "../components/VocabularyPopover";
import { episodeContent } from "../content";
import { careerById } from "../content/careers";
import type { Episode, Scene } from "../content/types";
import { addOnce, countReplay, isUnlocked, type Progress } from "../features/progress/progressStorage";
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
  const [vocabId, setVocabId] = useState<string | null>(null);
  const sceneHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const scene = ep?.scenes[sceneIndex];

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

  const goTo = (nextId: string) => {
    const idx = ep.scenes.findIndex((s) => s.id === nextId);
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
          onClick={() => update((p) => ({ ...p, settings: { ...p.settings, thaiHints: !p.settings.thaiHints } }))}
        >
          คำแปลไทยทุกบรรทัด: {settings.thaiHints ? "เปิด" : "ปิด"}
        </button>
      </div>

      <h1 ref={sceneHeading} tabIndex={-1} className="story__title">
        <span className="story__scene-num">
          {careerById(progress.career)?.nameEn ?? "Team 2-A"} <span aria-hidden="true">|</span> Episode {ep.number}, ฉาก {sceneIndex + 1} จาก {ep.scenes.length}
        </span>
        <span lang="en">{scene.title}</span>
      </h1>

      <QuestPanel
        objective={scene.objective}
        objectiveTh={scene.objectiveTh}
        sceneNumber={sceneIndex + 1}
        sceneCount={ep.scenes.length}
      />

      <SceneFlow
        key={scene.id}
        episode={ep}
        scene={scene}
        isLast={sceneIndex === ep.scenes.length - 1}
        progress={progress}
        update={update}
        onVocab={setVocabId}
        onNext={goTo}
      />

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
  isLast: boolean;
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
function SceneFlow({ episode, scene, isLast, progress, update, onVocab, onNext }: FlowProps) {
  const { settings } = progress;
  const check = scene.listeningCheck;
  const speak = scene.speakingPrompt;
  const interaction = scene.interaction;
  // v2 episodes speak first and offer choices as optional support; v1 episodes still need a choice.
  const choicesOptional = episode.format === 2 && !!speak;

  const [heard, setHeard] = useState(false);
  const [checked, setChecked] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [showChoices, setShowChoices] = useState(!choicesOptional);
  const [selectedId, setSelectedId] = useState<string>();
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  const checkRef = useRef<HTMLHeadingElement>(null);
  const speakRef = useRef<HTMLHeadingElement>(null);
  const choicesRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);

  const listenDone = heard && (!check || checked);
  const speakVisible = listenDone && !!speak;
  const afterSpeak = listenDone && (!speak || spoken);
  const choicesVisible = afterSpeak && !!interaction && showChoices;
  const selected = interaction?.choices.find((c) => c.id === selectedId);
  const canContinue = afterSpeak && (choicesOptional || !interaction || !!selected);

  useEffect(() => {
    if (heard && check) checkRef.current?.focus();
  }, [heard, check]);
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

  const next = () => onNext(selected?.nextSceneId ?? scene.nextSceneId ?? "end");
  const nextLabel = isLast ? "จบเรื่อง ไปบทเรียนต่อ" : "ไปฉากต่อไป";

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
        onRateChange={(rate) => update((p) => ({ ...p, settings: { ...p.settings, audioRate: rate } }))}
        revealTranscript={settings.alwaysShowTranscript || (check ? checked : heard)}
        textOnly={settings.textOnly}
        showThaiAll={settings.thaiHints}
        onVocab={onVocab}
        onHeard={() => setHeard(true)}
        onReplay={() => update((p) => countReplay(p, episode.id))}
      />

      {heard && check && <ListeningCheck
          ref={checkRef}
          check={check}
          onAnswered={() => {
            setChecked(true);
            update((p) => addOnce(p, "triedChecks", check.id));
          }}
        />}

      {speakVisible && (
        <SpeakResponse
          ref={speakRef}
          prompt={speak}
          settings={settings}
          onConsent={(value) => update((p) => ({ ...p, settings: { ...p.settings, micConsent: value } }))}
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
          {showChoices ? "ซ่อนทางเลือกอื่น" : "ดูผลของการพูดแบบอื่น (ไม่บังคับ)"}
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
              isLastScene={isLast}
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
