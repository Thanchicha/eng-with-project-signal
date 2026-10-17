import "./QuestPanel.css";

interface Props {
  objective: string;
  objectiveTh: string;
  sceneNumber: number;
  sceneCount: number;
}

export default function QuestPanel({ objective, objectiveTh, sceneNumber, sceneCount }: Props) {
  return (
    <aside className="quest" aria-label="ภารกิจของฉากนี้">
      <div className="quest__row">
        <span className="quest__label">ภารกิจ</span>
        <span className="quest__count">
          ฉาก {sceneNumber} จาก {sceneCount}
        </span>
      </div>
      <p className="quest__objective" lang="en">
        {objective}
      </p>
      <p className="quest__th">{objectiveTh}</p>
      <div
        className="quest__bar"
        role="progressbar"
        aria-label="ความคืบหน้าของตอน"
        aria-valuemin={1}
        aria-valuemax={sceneCount}
        aria-valuenow={sceneNumber}
      >
        <span style={{ width: `${(sceneNumber / sceneCount) * 100}%` }} />
      </div>
    </aside>
  );
}
