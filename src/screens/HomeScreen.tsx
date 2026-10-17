import { navigate, routeToHash } from "../app/router";
import CharacterSprite from "../components/CharacterSprite";
import type { EpisodeStatus } from "../components/EpisodeCard";
import SceneBackdrop from "../components/SceneBackdrop";
import { episodeContent } from "../content";
import { careerById } from "../content/careers";
import { characters } from "../content/characters";
import { episodeSummaries } from "../content/episodes";
import { nextEpisode, statusOf } from "../features/progress/episodeStatus";
import { reachedEpisodeIds, type Progress } from "../features/progress/progressStorage";
import { skillCounts } from "../features/progress/skills";
import { xpSummary } from "../features/progress/xp";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import "./HomeScreen.css";

interface Props {
  progress: Progress;
}

const STATUS_TH: Record<EpisodeStatus, string> = {
  done: "✓ จบแล้ว",
  open: "▶ เล่นได้",
  waiting: "🔒 ล็อก",
  soon: "🔒 เร็ว ๆ นี้",
};

/** Home dashboard (mockup screen 5): greeting, mission map, career path, vocabulary and practice. */
export default function HomeScreen({ progress }: Props) {
  const next = nextEpisode(progress);
  const xp = xpSummary(progress);
  const career = careerById(progress.career);
  const started = xp.total > 0;
  const canPlay = canSpeak() && !progress.settings.textOnly;

  const reached = reachedEpisodeIds(progress)
    .map((id) => episodeContent[id])
    .filter(Boolean);
  const wordsHeard = new Set(reached.flatMap((ep) => ep.vocabulary.map((v) => v.id))).size;

  // Practice counts across playable episodes — what the player did, never a grade.
  const choiceSkills = Object.values(episodeContent).map((ep) => skillCounts(ep, progress.viewedChoices));
  const sum = (id: string) => choiceSkills.reduce((n, list) => n + (list.find((s) => s.id === id)?.count ?? 0), 0);
  const replays = Object.values(progress.replays).reduce((n, r) => n + r, 0);
  const skills = [
    { id: "listen", label: "การฟัง", count: progress.triedChecks.length + replays, icon: "M4 13a8 8 0 0116 0v5h-3v-5M4 13v5h3v-5" },
    { id: "speak", label: "การพูด", count: progress.spokenIds.length, icon: "M12 4a3 3 0 013 3v5a3 3 0 01-6 0V7a3 3 0 013-3zM6 11a6 6 0 0012 0M12 17v3" },
    { id: "communication", label: "สื่อสารชัดเจน", count: sum("communication"), icon: "M4 5h16v10H9l-5 4z" },
    { id: "evidence", label: "คิดจากหลักฐาน", count: sum("evidence"), icon: "M10 4a6 6 0 104.2 10.2L20 20M10 7v6M7 10h6" },
    { id: "teamwork", label: "ทำงานเป็นทีม", count: sum("teamwork"), icon: "M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-3 2.5-5 5-5s5 2 5 5M11 19c0-3 2.5-5 5-5s5 2 5 5" },
  ];

  return (
    <div className="home">
      <section className="home__hero" aria-labelledby="hero-title">
        <p className="hero__series" lang="en">
          Angels of Deceit
        </p>
        <h1 id="hero-title" className="hero__title" lang="en">
          Project SIGNAL
        </h1>
        <SignalWave />
        <h2 className="home__greeting">{started ? "ทำได้ดีมาก!" : "ยินดีต้อนรับสู่ทีม 2-A"}</h2>
        <p className="hero__pitch">
          {started
            ? "การสื่อสารของคุณกำลังพาทีมเข้าใกล้ความจริงทีละนิด ฟังต่อ แล้วพูดต่อได้เลย"
            : "ฟัง Kuro, Miyu และเพื่อน ๆ จับใจความ แล้วพูดเพื่อถาม อธิบาย และตัดสินใจด้วยภาษาอังกฤษที่ใช้ทำงานได้จริง"}
        </p>
        <p className="home__quote" lang="en">
          “Small conversations lead to big discoveries.”
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "intro", episodeId: next.episode.id })}>
            {next.label}
          </button>
          <span className="hero__next" lang="en">
            {next.episode.title}
          </span>
        </div>
        <p className="hero__level">
          ฟังก่อน แล้วพูด: บทสนทนาระดับ <strong>A2–B1</strong> ฟังซ้ำและลดความเร็วได้ เปิดบทพูดหรือคำแปลได้ทุกเมื่อ ไม่มีการให้คะแนนสำเนียง
        </p>
      </section>

      <section className="home__map" aria-labelledby="mission-title">
        <div className="map__head">
          <h2 id="mission-title">แผนที่ภารกิจ</h2>
          <a className="home__more" href="#/missions">
            ดูทุกตอน
          </a>
        </div>
        <div className="mission-strip" role="region" aria-label="รายการตอน เลื่อนดูได้" tabIndex={0}>
          <ol>
            {episodeSummaries.map((ep) => {
              const status = statusOf(ep, progress);
              const reachable = status === "done" || status === "open";
              const forYou = !!career && ep.focusRoles.includes(career.id);
              const inner = (
                <>
                  <SceneBackdrop background={episodeContent[ep.id]?.scenes[0]?.background} className="mission__thumb" />
                  <span className="mission__ep">Episode {ep.number}</span>
                  <span className="mission__title" lang="en">
                    {ep.title}
                  </span>
                  <span className={`mission__status mission__status--${status}`}>
                    {ep.id === next.episode.id && next.inProgress ? "▶ กำลังเล่น" : STATUS_TH[status]}
                  </span>
                  {forYou && <span className="mission__for-you">ตรงกับบทบาทคุณ</span>}
                </>
              );
              return (
                <li key={ep.id} className={`mission${ep.id === next.episode.id ? " mission--current" : ""}${reachable ? "" : " mission--locked"}`}>
                  {reachable ? (
                    <a href={routeToHash({ name: "intro", episodeId: ep.id })} className="mission__link">
                      {inner}
                    </a>
                  ) : (
                    <div className="mission__link">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="home__cards" aria-label="สรุปการฝึก">
        <article className="dash-card dash-card--career">
          <h2 className="dash-card__h">เส้นทางอาชีพ</h2>
          {career ? (
            <div className="dash-career">
              <CharacterSprite speakerId={career.lead} size="portrait" />
              <div>
                <p className="dash-career__name" lang="en">
                  {career.nameEn}
                </p>
                <p className="dash-card__muted">{career.nameTh}</p>
                <p className="dash-card__muted">ฝึกกับ {characters[career.lead].callName}</p>
              </div>
            </div>
          ) : (
            <p className="dash-card__muted">ยังไม่ได้เลือกบทบาท เลือกเพื่อให้หน้าแรกแนะนำตอนและวลีที่ตรงกับงาน</p>
          )}
          <p className="dash-level">
            Level {xp.level} <span className="dash-card__muted">{xp.intoLevel} / {xp.perLevel} XP</span>
          </p>
          <div className="dash-xpbar" role="progressbar" aria-label="XP ในเลเวลนี้" aria-valuemin={0} aria-valuemax={xp.perLevel} aria-valuenow={xp.intoLevel}>
            <span style={{ width: `${(xp.intoLevel / xp.perLevel) * 100}%` }} />
          </div>
          <a className="home__more" href="#/career">
            {career ? "เปลี่ยนบทบาท" : "เลือกบทบาท"}
          </a>
        </article>

        <article className="dash-card">
          <h2 className="dash-card__h">คำศัพท์ที่ได้ยิน</h2>
          <p className="dash-big">
            {wordsHeard} <span className="dash-card__muted">คำ</span>
          </p>
          <p className="dash-card__muted">บันทึกไว้ทบทวน {progress.savedVocabulary.length} คำ</p>
          <a className="home__more" href="#/notebook">
            เปิดสมุดคำศัพท์
          </a>
        </article>

        <article className="dash-card dash-card--skills">
          <h2 className="dash-card__h">ทักษะที่ได้ฝึก</h2>
          <ul className="dash-skills">
            {skills.map((s) => (
              <li key={s.id}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.icon} />
                </svg>
                <span className="dash-skills__label">{s.label}</span>
                <span className="dash-card__muted">ฝึก {s.count} ครั้ง</span>
              </li>
            ))}
          </ul>
          <p className="dash-card__muted">นับจากสิ่งที่คุณลองทำ ไม่ใช่คะแนนความเก่ง</p>
        </article>

        {career && (
          <article className="dash-card dash-card--phrases">
            <h2 className="dash-card__h">วลีสำหรับ {career.nameEn}</h2>
            <ul className="dash-phrases" lang="en">
              {career.keyPhrases.map((ph) => (
                <li key={ph}>
                  <span>{ph}</span>
                  {canPlay && (
                    <button
                      type="button"
                      className="dash-listen"
                      aria-label={`ฟังวลี ${ph}`}
                      onClick={() =>
                        audioPlayer.playLines([{ speakerId: career.lead, textEn: ph.replace(/_+/g, "something") }], {
                          rate: progress.settings.audioRate,
                        })
                      }
                    >
                      ฟัง
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </div>
  );
}

/** The one bold moment: a signal that settles into a flat line, drawn once on load. */
function SignalWave() {
  return (
    <svg className="hero__wave" viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 20 H40 L52 6 L64 34 L76 10 L88 30 L100 16 L112 24 L124 19 L136 21 H320"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
