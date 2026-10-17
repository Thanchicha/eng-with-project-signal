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
      <h2 id="choices-prompt" ref={headingRef} tabIndex={-1} className="choices__prompt">
        <span lang="en">{interaction.promptEn}</span>
        <span className="choices__prompt-th">{interaction.promptTh}</span>
      </h2>
      <ul className="choices__list">
        {interaction.choices.map((c) => {
          const viewed = viewedIds.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                className="choice"
                aria-pressed={c.id === selectedId}
                onClick={() => onSelect(c.id)}
              >
                <span lang="en" className="choice__text">
                  “{c.textEn}”
                </span>
                {viewed && c.id !== selectedId && <span className="choice__seen">ดู feedback แล้ว</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});

export default ChoiceList;
