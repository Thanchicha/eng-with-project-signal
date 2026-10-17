// Brief §10 "ข้อจำกัดเสียงบนเว็บ": detect what this browser can do at runtime — never assume an
// English voice or a recognizer exists.

export interface SpeechCapabilities {
  /** speechSynthesis + SpeechSynthesisUtterance exist. */
  tts: boolean;
  /** At least one English voice is loaded. Can be false at first and turn true after voiceschanged. */
  englishVoice: boolean;
  /** SpeechRecognition or webkitSpeechRecognition exists (may still need network / permission). */
  recognition: boolean;
  /** HTMLAudioElement exists, so recorded audio assets can play. */
  audioElement: boolean;
}

export function hasTts(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!hasTts()) return [];
  try {
    return window.speechSynthesis.getVoices();
  } catch {
    return [];
  }
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang));
}

/** The SpeechRecognition constructor if the browser has one (prefixed in Chrome/Safari). */
export function getRecognitionCtor(): (new () => unknown) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return typeof ctor === "function" ? (ctor as new () => unknown) : undefined;
}

export function getSpeechCapabilities(): SpeechCapabilities {
  return {
    tts: hasTts(),
    englishVoice: getEnglishVoices().length > 0,
    recognition: !!getRecognitionCtor(),
    audioElement: typeof window !== "undefined" && typeof window.Audio === "function",
  };
}

/**
 * Voices load asynchronously in most browsers. Calls `cb` now and again whenever the voice
 * list changes; returns an unsubscribe function.
 */
export function onVoicesChanged(cb: () => void): () => void {
  if (!hasTts()) return () => {};
  const synth = window.speechSynthesis;
  try {
    synth.addEventListener("voiceschanged", cb);
  } catch {
    return () => {};
  }
  return () => {
    try {
      synth.removeEventListener("voiceschanged", cb);
    } catch {
      // Ignore — nothing to unsubscribe from.
    }
  };
}
