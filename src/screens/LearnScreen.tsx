import { useEffect, useRef } from "react";
import { navigate } from "../app/router";
import { AnalystNotePanel, LessonPanel, PatternsPanel } from "../components/LearnSections";
import MiniCasePanel from "../components/MiniCasePanel";
import PatternExercise from "../components/PatternExercise";
import RecapPanel from "../components/RecapPanel";
import SpeakPanel from "../components/SpeakPanel";
import ShadowPanel from "../components/ShadowPanel";
import { episodeContent } from "../content";
import type { Episode } from "../content/types";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import "./LearnScreen.css";

// Spec 05 §7 episode structure after the story: listen and speak first, writing last and optional.
const ALL_STEPS = [
  { id: "note", en: "Inside the Analyst’s Mind", th: "บันทึกนักวิเคราะห์" },
  { id: "lesson", en: "Business & Data Lesson", th: "บทเรียนธุรกิจและข้อมูล" },
  { id: "patterns", en: "Sentence Patterns", th: "ฟังรูปประโยค" },
  { id: "shadow", en: "Shadow & Substitute", th: "ฟังแล้วพูดตาม" },
  { id: "speak", en: "Speak Like an Intern", th: "ฝึกพูดแบบเด็กฝึกงาน" },
  { id: "case", en: "Mini Case", th: "ฟัง briefing แล้วพูดสรุป" },
  { id: "write", en: "Write by Yourself", th: "ฝึกเขียน (เสริม)" },
] as const;

type Step = (typeof ALL_STEPS)[number];

/** Older reading-first episodes have no Shadow & Substitute items. */
function stepsFor(ep: Episode): Step[] {
  return ALL_STEPS.filter((s) => s.id !== "shadow" || ep.shadowItems.length > 0);
}

interface Props {
  episodeId: string;
  step?: string;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

export default function LearnScreen({ episodeId, step, progress, update }: Props) {
  const ep = episodeContent[episodeId];
  const STEPS = ep ? stepsFor(ep) : [...ALL_STEPS];
  const index = Math.max(0, STEPS.findIndex((s) => s.id === step));
  const current = STEPS[index];
  const setConsent = (value: "granted" | "declined") => update((p) => ({ ...p, settings: { ...p.settings, micConsent: value } }));
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [index, step]);

  // Reaching the recap completes the episode, which unlocks the next one.
  const reachedRecap = step === "recap" && !!ep && isUnlocked(episodeId, progress);
  useEffect(() => {
    if (!reachedRecap) return;
    update((p) =>
      p.completedEpisodes.includes(episodeId) && p.lastSceneId === undefined
        ? p
        : {
            ...p,
            lastEpisodeId: episodeId,
            lastSceneId: undefined,
            completedEpisodes: p.completedEpisodes.includes(episodeId) ? p.completedEpisodes : [...p.completedEpisodes, episodeId],
          },
    );
  }, [reachedRecap, episodeId, update]);

  if (!ep || !isUnlocked(episodeId, progress)) {
    return (
      <section className="learn-missing">
        <h1>ตอนนี้ยังเล่นไม่ได้</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </section>
    );
  }

  const go = (i: number) => {
    // Leaving the speaking practice forward counts the episode's patterns as practiced.
    const practiceStep = ep.shadowItems.length > 0 ? "shadow" : "write";
    if (current.id === practiceStep && i > index) {
      update((p) => ({
        ...p,
        practicedPatterns: [...new Set([...p.practicedPatterns, ...ep.sentencePatterns.map((s) => s.pattern)])],
      }));
    }
    navigate({ name: "learn", episodeId, step: i < STEPS.length ? STEPS[i].id : "recap" });
  };

  if (step === "recap") {
    return (
      <article className="learn">
        <a className="learn__back" href={`#/ep/${ep.id}/learn/case`}>
          กลับไป Mini Case
        </a>
        <h1 ref={heading} tabIndex={-1} className="learn__title">
          <span className="learn__title-th">Episode {ep.number} จบแล้ว</span>
          <span lang="en">{ep.title}</span>
        </h1>
        <RecapPanel
          episode={ep}
          progress={progress}
          onReplay={() => {
            update((p) => ({ ...p, lastEpisodeId: ep.id, lastSceneId: undefined }));
            navigate({ name: "play", episodeId: ep.id });
          }}
        />
      </article>
    );
  }

  return (
    <article className="learn">
      <a className="learn__back" href={`#/ep/${ep.id}/play`}>
        กลับไปเนื้อเรื่อง Episode {ep.number}
      </a>

      <nav aria-label="ขั้นตอนบทเรียน">
        <ol className="learn__steps">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#/ep/${ep.id}/learn/${s.id}`}
                className={`learn__step${i < index ? " learn__step--done" : ""}`}
                aria-current={i === index ? "step" : undefined}
              >
                <span className="learn__step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="learn__step-name">{s.th}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <h1 ref={heading} tabIndex={-1} className="learn__title">
        <span lang="en">{current.en}</span>
        <span className="learn__title-th">{current.th}</span>
      </h1>

      {current.id === "note" && <AnalystNotePanel episode={ep} />}
      {current.id === "lesson" && <LessonPanel episode={ep} />}
      {current.id === "patterns" && <PatternsPanel episode={ep} settings={progress.settings} />}
      {current.id === "shadow" && (
        <ShadowPanel
          items={ep.shadowItems}
          settings={progress.settings}
          triedIds={progress.triedDrills}
          onConsent={setConsent}
          onTried={(id) =>
            update((p) => (p.triedDrills.includes(id) ? p : { ...p, triedDrills: [...p.triedDrills, id] }))
          }
        />
      )}
      {current.id === "speak" && <SpeakPanel practice={ep.speakPractice} settings={progress.settings} onConsent={setConsent} />}
      {current.id === "case" && (
        <MiniCasePanel key={ep.id} miniCase={ep.miniCase} settings={progress.settings} onConsent={setConsent} />
      )}
      {current.id === "write" && (
        <>
          <p className="learn__optional">แบบฝึกเขียนเป็นตัวเสริมหลังพูด ข้ามไปสรุปตอนได้เลยถ้าไม่ต้องการ</p>
          <PatternExercise
            drills={ep.drills}
            triedIds={progress.triedDrills}
            onTried={(id) =>
              update((p) => (p.triedDrills.includes(id) ? p : { ...p, triedDrills: [...p.triedDrills, id] }))
            }
          />
        </>
      )}

      <div className="learn__nav">
        {index > 0 ? (
          <button type="button" className="btn btn--ghost" onClick={() => go(index - 1)}>
            ย้อนกลับ
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn btn--primary" onClick={() => go(index + 1)}>
          {index === STEPS.length - 1 ? "ไปสรุปตอน" : `ถัดไป: ${STEPS[index + 1].th}`}
        </button>
      </div>
    </article>
  );
}
