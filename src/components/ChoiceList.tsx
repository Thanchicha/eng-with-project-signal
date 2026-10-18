import { forwardRef } from "react";
import type { ChoiceInteraction } from "../content/types";
import "./ChoiceList.css";

interface Props {
  interaction: ChoiceInteraction;
  selectedId?: string;
  viewedIds: string[];
  onSelect: (choiceId: string) => void;
}

/** Choices are sentences the player might really say — not a grammar test. Every choice moves the story on. */
const ChoiceList = forwardRef<HTMLHeadingElement, Props>(function ChoiceList(
  { interaction, selectedId, viewedIds, onSelect },
  headingRef,
) {
  return (
    <section className="choices" aria-labelledby="choices-prompt">
      <p className="choices__eyebrow">
        <span lang="en">Your words shape the story</span> <span>คำพูดของคุณส่งผลต่อเรื่อง</span>
      </p>
      <h2 id="choices-prompt" ref={headingRef} tabIndex={-1} className="choices__prompt">
        <span lang="en">{interaction.promptEn}</span>
        <span className="choices__prompt-th">{interaction.promptTh}</span>
      </h2>
      <ul className="choices__list">
        {interaction.choices.map((c, i) => {
          const viewed = viewedIds.includes(c.id);
          const picked = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                className="choice"
                aria-pressed={picked}
                onClick={() => onSelect(c.id)}
              >
                <span className="choice__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="choice__main">
                  <span lang="en" className="choice__text">
                    “{c.textEn}”
                  </span>
                  {viewed && !picked && <span className="choice__seen">ดู feedback แล้ว</span>}
                </span>
                <span className={`choice__mark${picked ? " choice__mark--on" : ""}`} aria-hidden="true">
                  {picked ? "✓" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});

export default ChoiceList;
