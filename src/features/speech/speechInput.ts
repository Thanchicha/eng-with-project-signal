import { getRecognitionCtor } from "./speechCapabilities";

// Brief §10/§13: optional mic answers. Only start after the player has granted micConsent and
// seen the privacy notice (some browsers send audio to a server to recognise it). Nothing is
// stored: no audio, no transcripts — text goes to the callbacks and nowhere else.

export type SpeechInputState = "idle" | "listening" | "error";

export type SpeechInputErrorCode =
  | "not-allowed" // mic permission denied (also "service-not-allowed")
  | "no-speech" // nothing heard / no mic (also "audio-capture")
  | "network" // recognizer service unreachable
  | "unsupported" // no SpeechRecognition in this browser, or it failed to start
  | "aborted"; // rare: recognizer aborted for another reason

export interface SpeechInputCallbacks {
  onInterim?(text: string): void;
  /** Final transcript of what the player said (joined if several results). */
  onFinal?(text: string): void;
  onState?(state: SpeechInputState): void;
  onError?(code: SpeechInputErrorCode): void;
}

export interface SpeechInput {
  /** Start listening. Returns false (and reports "unsupported") if recognition isn't available. */
  start(cb: SpeechInputCallbacks): boolean;
  /** Stop and deliver whatever was heard as a final result. */
  stop(): void;
  /** Stop and discard — no final callback. */
  cancel(): void;
  getState(): SpeechInputState;
}

// Minimal shape of the Web Speech recognizer — not in every TS DOM lib.
interface Recognizer {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function mapError(error: string): SpeechInputErrorCode {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "not-allowed";
    case "no-speech":
    case "audio-capture":
      return "no-speech";
    case "network":
      return "network";
    case "language-not-supported":
      return "unsupported";
    default:
      return "aborted";
  }
}

export function createSpeechInput(): SpeechInput {
  let rec: Recognizer | null = null;
  let state: SpeechInputState = "idle";
  let cbs: SpeechInputCallbacks = {};
  let finalText = "";
  let delivered = false;
  let cancelled = false;

  const setState = (s: SpeechInputState) => {
    state = s;
    cbs.onState?.(s);
  };

  const teardown = () => {
    if (!rec) return;
    rec.onresult = rec.onerror = rec.onend = null;
    rec = null;
  };

  function start(cb: SpeechInputCallbacks): boolean {
    cancel();
    cbs = cb;
    finalText = "";
    delivered = false;
    cancelled = false;
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setState("error");
      cbs.onError?.("unsupported");
      return false;
    }
    try {
      const r = new Ctor() as Recognizer;
      r.lang = "en-US";
      r.interimResults = true;
      r.continuous = false;
      r.maxAlternatives = 1;
      r.onresult = (ev) => {
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i];
          const t = res[0]?.transcript ?? "";
          if (res.isFinal) finalText = `${finalText} ${t}`.trim();
          else interim += t;
        }
        if (interim) cbs.onInterim?.(`${finalText} ${interim}`.trim());
      };
      r.onerror = (ev) => {
        if (cancelled || ev.error === "aborted") return;
        const code = mapError(ev.error);
        teardown();
        setState("error");
        cbs.onError?.(code);
      };
      r.onend = () => {
        teardown();
        if (cancelled) return;
        if (!delivered && finalText) {
          delivered = true;
          cbs.onFinal?.(finalText);
        }
        if (!delivered) {
          // Ended without hearing anything.
          setState("error");
          cbs.onError?.("no-speech");
          return;
        }
        setState("idle");
      };
      rec = r;
      r.start();
      setState("listening");
      return true;
    } catch {
      teardown();
      setState("error");
      cbs.onError?.("unsupported");
      return false;
    }
  }

  function stop() {
    if (!rec) return;
    try {
      rec.stop(); // onend delivers the final text
    } catch {
      teardown();
      setState("idle");
    }
  }

  function cancel() {
    if (!rec) {
      if (state !== "idle") setState("idle");
      return;
    }
    cancelled = true;
    const r = rec;
    teardown();
    try {
      r.abort();
    } catch {
      // Ignore.
    }
    finalText = "";
    setState("idle");
  }

  return { start, stop, cancel, getState: () => state };
}
