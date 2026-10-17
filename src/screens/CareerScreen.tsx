import { navigate } from "../app/router";
import CharacterSprite from "../components/CharacterSprite";
import { careers } from "../content/careers";
import { characters } from "../content/characters";
import type { CareerId } from "../content/types";
import type { Progress } from "../features/progress/progressStorage";
import "./CareerScreen.css";

interface Props {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

/**
 * "Choose your path" (mockup screen 1). The story is the same for every role; the choice only
 * changes which episodes and work phrases the home screen highlights. It can be changed any time.
 */
export default function CareerScreen({ progress, update }: Props) {
  const choose = (id: CareerId | undefined) => {
    update((p) => ({ ...p, career: id ?? p.career, careerPrompted: true }));
    navigate({ name: "home" });
  };

  return (
    <article className="career">
      <header className="career__head">
        <h1 className="career__title" lang="en">
          Choose Your Path
        </h1>
        <p className="career__sub" lang="en">
          Find your path. Build your skills. Speak your future.
        </p>
        <p className="career__lead">
          เลือกบทบาทที่อยากฝึก เนื้อเรื่องเหมือนเดิมทุกบทบาท แต่หน้าแรกจะแนะนำตอนและวลีที่ใช้ในงานนั้น เปลี่ยนได้ตลอด
        </p>
      </header>

      <ul className="career__grid">
        {careers.map((c) => {
          const current = progress.career === c.id;
          return (
            <li key={c.id} className={`career__card${current ? " career__card--current" : ""}`}>
              <div className="career__art">
                <CharacterSprite speakerId={c.lead} size="card" />
              </div>
              <div className="career__body">
                <h2 className="career__name" lang="en">
                  {c.nameEn}
                </h2>
                <p className="career__name-th">{c.nameTh}</p>
                <p className="career__tag" lang="en">
                  {c.taglineEn}
                </p>
                <p className="career__tag-th">{c.taglineTh}</p>
                <p className="career__with">ฝึกกับ {characters[c.lead].callName}</p>
                <button
                  type="button"
                  className="btn btn--primary career__start"
                  aria-label={`${current ? "บทบาทปัจจุบัน" : "เลือก"} ${c.nameEn} (${c.nameTh})`}
                  onClick={() => choose(c.id)}
                >
                  {current ? "บทบาทของคุณ" : "เริ่มภารกิจ"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="career__skip">
        <button type="button" className="career__skip-btn" onClick={() => choose(undefined)}>
          {progress.career ? "กลับหน้าแรก" : "ข้ามไปก่อน เลือกทีหลังได้"}
        </button>
      </p>
    </article>
  );
}
