import { characters } from "../content/characters";
import type { CharacterId } from "../content/types";
import { spriteUrl } from "../features/art/artAssets";
import "./CharacterSprite.css";

interface Props {
  /** Main cast id, or a guest speaker id such as "taku" / "mr-ono". */
  speakerId: string;
  /** Display name for guests (main cast use their call name). */
  label?: string;
  expression?: string;
  size?: "stage" | "card" | "portrait";
  /** Listener in a two-character shot. */
  dim?: boolean;
}

const GUEST_COLOR = "#6b5a85";

function isCast(id: string): id is CharacterId {
  return id in characters;
}

/**
 * A character illustration, or — until art exists — a silhouette in the character's colour with
 * their initial. Decorative: the speaker's name is always given as text next to it.
 */
export default function CharacterSprite({ speakerId, label, expression, size = "stage", dim }: Props) {
  const cast = isCast(speakerId) ? characters[speakerId] : undefined;
  const name = cast?.callName ?? label?.match(/\(([^)]+)\)/)?.[1] ?? label ?? speakerId;
  const color = cast?.avatar.color ?? GUEST_COLOR;
  const url = spriteUrl(speakerId, expression);

  return (
    <div className={`sprite sprite--${size}${dim ? " sprite--dim" : ""}`} aria-hidden="true">
      {url ? (
        <img src={url} alt="" className="sprite__img" />
      ) : (
        <svg className="sprite__placeholder" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id={`spr-${speakerId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.95" />
              <stop offset="1" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="88" r="46" fill={`url(#spr-${speakerId})`} />
          <path d="M28 300 C30 205 62 160 100 160 C138 160 170 205 172 300 Z" fill={`url(#spr-${speakerId})`} />
          <text x="100" y="240" textAnchor="middle" className="sprite__initial">
            {name.charAt(0).toUpperCase()}
          </text>
        </svg>
      )}
    </div>
  );
}
