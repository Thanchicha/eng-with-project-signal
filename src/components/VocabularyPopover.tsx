import { useEffect, useRef } from "react";
import type { VocabularyItem } from "../content/types";
import { canSpeak, speak } from "../features/speech/speak";
import "./VocabularyPopover.css";

interface Props {
  item: VocabularyItem | null;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
}

/** Word card in a native <dialog>: focus trap, Escape to close and focus return come from the browser. */
export default function VocabularyPopover({ item, saved, onToggleSave, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  return (
    <dialog
      ref={ref}
      className="vocab-pop"
      aria-labelledby="vocab-pop-word"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on backdrop
      }}
    >
      {item && (
        <div className="vocab-pop__inner">
          <p id="vocab-pop-word" className="vocab-pop__word" lang="en">
            {item.en}
          </p>
          <p className="vocab-pop__th">{item.th}</p>
          <p className="vocab-pop__example" lang="en">
            {item.example}
          </p>
          <div className="vocab-pop__actions">
            {canSpeak() && (
              <button type="button" className="btn btn--soft" onClick={() => speak(`${item.en}. ${item.example}`)}>
                ฟังเสียง
              </button>
            )}
            <button type="button" className="btn btn--soft" aria-pressed={saved} onClick={() => onToggleSave(item.id)}>
              {saved ? "บันทึกในสมุดแล้ว" : "บันทึกลงสมุดคำศัพท์"}
            </button>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
