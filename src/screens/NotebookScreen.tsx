import { useState } from "react";
import { episodeContent } from "../content";
import type { Episode } from "../content/types";
import { reachedEpisodeIds, type Progress } from "../features/progress/progressStorage";
import { canSpeak, speak } from "../features/speech/speak";
import "../components/LearnSections.css";
import "./NotebookScreen.css";

interface Props {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

type Filter = "all" | "saved";

/** Scene numbers whose dialogue uses this word — the notebook stresses words heard in the story. */
function heardIn(ep: Episode, vocabId: string): number[] {
  return ep.scenes.flatMap((s, i) => (s.dialogue.some((d) => d.vocabularyRefs?.some((r) => r.id === vocabId)) ? [i + 1] : []));
}

/** Vocabulary Notebook (spec 05 §7): words met so far, with the ones saved for review. */
export default function NotebookScreen({ progress, update }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const episodes = reachedEpisodeIds(progress)
    .map((id) => episodeContent[id])
    .filter(Boolean);
  // Key words recur across episodes on purpose (spec 05 §8), so count each word once.
  const total = new Set(episodes.flatMap((ep) => ep.vocabulary.map((v) => v.id))).size;
  const saved = new Set(progress.savedVocabulary);

  const toggle = (id: string) =>
    update((p) => ({
      ...p,
      savedVocabulary: p.savedVocabulary.includes(id) ? p.savedVocabulary.filter((v) => v !== id) : [...p.savedVocabulary, id],
    }));

  return (
    <article className="notebook">
      <h1>สมุดคำศัพท์</h1>
      <p className="notebook__lead">
        คำที่พบในตอนที่เปิดเล่นแล้ว {total} คำ บันทึกไว้ทบทวน {saved.size} คำ แตะคำที่ขีดเส้นในเนื้อเรื่องเพื่อบันทึกเพิ่ม
      </p>

      <div className="notebook__filter" role="group" aria-label="ตัวกรองคำศัพท์">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          ทุกคำ
        </button>
        <button type="button" aria-pressed={filter === "saved"} onClick={() => setFilter("saved")}>
          บันทึกไว้ทบทวน ({saved.size})
        </button>
      </div>

      {filter === "saved" && saved.size === 0 && (
        <p className="paper notebook__empty">
          ยังไม่มีคำที่บันทึกไว้ ระหว่างอ่านเรื่อง แตะคำที่ขีดเส้นสีเหลือง แล้วกด "บันทึกลงสมุดคำศัพท์"
        </p>
      )}

      {episodes.map((ep) => {
        const words = ep.vocabulary.filter((v) => filter === "all" || saved.has(v.id));
        if (!words.length) return null;
        return (
          <section key={ep.id} className="notebook__group" aria-labelledby={`nb-${ep.id}`}>
            <h2 id={`nb-${ep.id}`} className="notebook__ep">
              Episode {ep.number}: <span lang="en">{ep.title}</span>
            </h2>
            <ul className="notebook__list">
              {words.map((v) => (
                <li key={v.id} className="paper notebook__item">
                  <div className="notebook__word">
                    <span lang="en" className="notebook__en">
                      {v.en}
                    </span>
                    <span className="notebook__th">{v.th}</span>
                  </div>
                  <p lang="en" className="notebook__example">
                    {v.example}
                  </p>
                  {heardIn(ep, v.id).length > 0 && (
                    <p className="notebook__heard">ได้ยินในฉาก {heardIn(ep, v.id).join(", ")}</p>
                  )}
                  <div className="notebook__actions">
                    {canSpeak() && (
                      <button type="button" className="listen" onClick={() => speak(`${v.en}. ${v.example}`)}>
                        ฟัง
                      </button>
                    )}
                    <button
                      type="button"
                      className="listen"
                      aria-pressed={saved.has(v.id)}
                      aria-label={`${saved.has(v.id) ? "เอาออกจาก" : "บันทึก"} ${v.en} ${saved.has(v.id) ? "รายการทบทวน" : "ไว้ทบทวน"}`}
                      onClick={() => toggle(v.id)}
                    >
                      {saved.has(v.id) ? "★ บันทึกแล้ว" : "☆ บันทึก"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
