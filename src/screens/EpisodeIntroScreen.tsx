import { navigate } from "../app/router";
import Avatar from "../components/Avatar";
import { characters } from "../content/characters";
import { episodeContent } from "../content";
import type { CharacterId } from "../content/types";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import "./EpisodeIntroScreen.css";

interface Props {
  episodeId: string;
  progress: Progress;
  onBegin: (episodeId: string) => void;
}

export default function EpisodeIntroScreen({ episodeId, progress, onBegin }: Props) {
  const ep = episodeContent[episodeId];

  if (!ep || !isUnlocked(episodeId, progress)) {
    return (
      <section className="intro-missing">
        <h1>ตอนนี้ยังเล่นไม่ได้</h1>
        <p>{ep ? `จบ Episode ${ep.number - 1} ก่อน แล้วตอนนี้จะปลดล็อก` : "ไม่พบตอนที่เลือก"}</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </section>
    );
  }

  // Main cast in canonical order (Kuro and Miyu lead every episode), limited to who speaks here.
  const speakers = new Set(ep.scenes.flatMap((s) => s.dialogue.map((d) => d.speakerId)));
  const cast = (Object.keys(characters) as CharacterId[]).filter((id) => speakers.has(id));
  const resuming =
    progress.lastEpisodeId === ep.id && !!progress.lastSceneId && progress.lastSceneId !== "learn" && !progress.completedEpisodes.includes(ep.id);

  return (
    <article className="intro" aria-labelledby="intro-title">
      <a className="intro__back" href="#/">
        กลับแผนที่คดี
      </a>

      <header className="intro__head">
        <p className="intro__num">
          Episode {ep.number} <span className="intro__level">ระดับ {ep.level}</span>
        </p>
        <h1 id="intro-title" lang="en">
          {ep.title}
        </h1>
        {ep.summaryTh.split("\n").map((line) => (
          <p key={line} className="intro__summary">
            {line}
          </p>
        ))}
      </header>

      <div className="intro__paper">
        <section aria-labelledby="before-title">
          <h2 id="before-title">ก่อนอ่าน</h2>
          <p>
            <strong>สถานการณ์:</strong> {ep.contextTh}
          </p>
          <p>
            <strong>เป้าหมาย:</strong> {ep.goalTh}
          </p>
        </section>

        <section aria-labelledby="goals-title">
          <h2 id="goals-title">สิ่งที่จะได้ฝึก</h2>
          <ul className="intro__goals">
            {ep.learningGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <p className="intro__roles">
            บทบาทในตอนนี้:{" "}
            {ep.roles.map((r) => (
              <span key={r} className="chip">
                {r}
              </span>
            ))}
          </p>
        </section>

        <section aria-labelledby="cast-title">
          <h2 id="cast-title">ตัวละครในตอนนี้</h2>
          <ul className="intro__cast">
            {cast.map((id) => (
              <li key={id}>
                <Avatar characterId={id} />
                <span>
                  <span className="intro__cast-name">{characters[id].callName}</span>
                  <span className="intro__cast-role">{characters[id].roleTh}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="vocab-title">
          <h2 id="vocab-title">คำศัพท์สำคัญ</h2>
          <p className="intro__hint">กดที่คำเพื่อดูประโยคตัวอย่าง</p>
          <ul className="intro__vocab">
            {ep.vocabulary.map((v) => (
              <li key={v.id}>
                <details>
                  <summary>
                    <span lang="en" className="intro__vocab-en">
                      {v.en}
                    </span>
                    <span className="intro__vocab-th">{v.th}</span>
                  </summary>
                  <p lang="en" className="intro__vocab-example">
                    {v.example}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="intro__cta">
        <button type="button" className="btn btn--primary intro__begin" onClick={() => onBegin(ep.id)}>
          {resuming ? "เล่นต่อจากฉากล่าสุด" : "เริ่มตอนนี้"}
        </button>
      </div>
    </article>
  );
}
