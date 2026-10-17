import { navigate } from "../app/router";
import { episodeSummaries } from "../content/episodes";
import type { Episode } from "../content/types";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import { skillCounts } from "../features/progress/skills";
import "./LearnSections.css";
import "./RecapPanel.css";

interface Props {
  episode: Episode;
  progress: Progress;
  onReplay: () => void;
}

/** Episode Complete (spec 06 G): what the team found, what was practiced, where to go next. */
export default function RecapPanel({ episode, progress, onReplay }: Props) {
  const choices = episode.scenes.flatMap((s) => s.interaction?.choices ?? []);
  const explored = choices.filter((c) => progress.viewedChoices.includes(c.id)).length;
  const skills = skillCounts(episode, progress.viewedChoices);
  const next = episodeSummaries.find((e) => e.number === episode.number + 1);
  const nextOpen = next && isUnlocked(next.id, progress);

  return (
    <div className="recap">
      <section className="paper" aria-labelledby="recap-story">
        <h2 id="recap-story" className="recap__h">ทีมค้นพบอะไร</h2>
        <ul className="note-list">
          {episode.recap.bulletsTh.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="paper" aria-labelledby="recap-language">
        <h2 id="recap-language" className="recap__h">ภาษาที่ได้ฝึก</h2>
        <p className="recap__label">คำศัพท์ทบทวน</p>
        <ul className="pattern__subs" lang="en">
          {episode.recap.reviewVocabulary.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="recap__label">รูปประโยค</p>
        <ul className="recap__patterns" lang="en">
          {episode.recap.reviewPatterns.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="paper" aria-labelledby="recap-skills">
        <h2 id="recap-skills" className="recap__h">ทักษะที่ได้ใช้</h2>
        <p className="paper__lead">
          คุณเปิดดู feedback {explored} จาก {choices.length} ตัวเลือก ยิ่งลองหลายทางยิ่งเห็นผลของการสื่อสารแต่ละแบบ
        </p>
        <ul className="recap__skills">
          {skills.map((s) => (
            <li key={s.id}>
              <span className="recap__skill-name">
                {s.nameTh} <span lang="en">({s.nameEn})</span>
              </span>
              <span className="recap__skill-desc">{s.descTh}</span>
              <span className="recap__skill-count">
                {s.count > 0 ? `ได้ฝึก ${s.count} ครั้งในตอนนี้` : "ยังไม่ได้ลองในตอนนี้ ลองเล่นฉากซ้ำแล้วเลือกทางอื่นดู"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {episode.recap.nextTeaserTh && (
        <section className="recap__teaser" aria-labelledby="recap-next">
          <h2 id="recap-next" className="recap__h">ภารกิจถัดไป</h2>
          <p>{episode.recap.nextTeaserTh}</p>
        </section>
      )}

      <div className="recap__actions">
        {next && nextOpen ? (
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "intro", episodeId: next.id })}>
            เริ่ม Episode {next.number}
          </button>
        ) : (
          next && <p className="recap__soon">Episode {next.number} จะเปิดให้เล่นเร็ว ๆ นี้</p>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: "notebook" })}>
          ทบทวนคำศัพท์
        </button>
        <button type="button" className="btn btn--ghost" onClick={onReplay}>
          เล่นเนื้อเรื่องซ้ำ
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </div>
    </div>
  );
}
