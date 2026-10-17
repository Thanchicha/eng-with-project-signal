import { getEnglishVoices, getVoices, hasTts, onVoicesChanged } from "./speechCapabilities";

// Brief §10/§13: AudioPlayer is an interface so prototype TTS can later be swapped for recorded
// audio assets. Playback only ever starts from a player action (never autoplay), and a missing
// voice must never throw — onError fires and the UI falls back to the transcript.

export interface PlayableLine {
  speakerId: string;
  textEn: string;
  audio?: { assetUrl?: string; rate?: number };
}

export type AudioRate = 1 | 0.75;

export type AudioErrorCode =
  /** No speechSynthesis and no asset for this line — show text instead. */
  | "tts-unavailable"
  /** The synthesizer reported an error mid-line. */
  | "tts-failed"
  /** The audio file could not load/play and TTS was not available to cover it. */
  | "asset-failed";

export interface AudioPlayError {
  code: AudioErrorCode;
  lineIndex: number;
  detail?: string;
}

export interface PlayOptions {
  rate: AudioRate | number;
  /** Fires when line `index` starts — use it to highlight/reveal the current line. */
  onLine?(index: number): void;
  /** Fires once after the last line finishes (not after stop()). */
  onEnd?(): void;
  /** Fires once and playback stops; the UI should fall back to text. */
  onError?(e: AudioPlayError): void;
}

export interface AudioPlayer {
  playLines(lines: PlayableLine[], opts: PlayOptions): void;
  stop(): void;
  isPlaying(): boolean;
}

/** Distinct sound per speaker: which English voice (by preference order) and pitch. */
const SPEAKER_PROFILES: Record<string, { voiceSlot: number; pitch: number }> = {
  narrator: { voiceSlot: 0, pitch: 1 },
  kuro: { voiceSlot: 1, pitch: 0.85 },
  miyu: { voiceSlot: 2, pitch: 1.2 },
  airi: { voiceSlot: 3, pitch: 1.05 },
};

function profileFor(speakerId: string) {
  const known = SPEAKER_PROFILES[speakerId.toLowerCase()];
  if (known) return known;
  let h = 0;
  for (const ch of speakerId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { voiceSlot: 4 + (h % 4), pitch: [0.95, 1.1, 0.9, 1.15][h % 4] };
}

/** English voices, en-US first, then local (offline) voices first. */
function rankedEnglishVoices(): SpeechSynthesisVoice[] {
  return [...getEnglishVoices()].sort((a, b) => {
    const us = Number(/^en[-_]US/i.test(b.lang)) - Number(/^en[-_]US/i.test(a.lang));
    if (us) return us;
    return Number(b.localService) - Number(a.localService);
  });
}

function voiceFor(speakerId: string): SpeechSynthesisVoice | undefined {
  const voices = rankedEnglishVoices();
  if (!voices.length) return undefined;
  return voices[profileFor(speakerId).voiceSlot % voices.length];
}

/** Voices load async; wait briefly for the first voiceschanged, then go ahead regardless. */
let waitedForVoices = false;
function whenVoicesReady(cb: () => void) {
  if (waitedForVoices || getVoices().length) return cb();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    waitedForVoices = true;
    unsubscribe();
    cb();
  };
  const unsubscribe = onVoicesChanged(finish);
  setTimeout(finish, 1000);
}

export function createTtsAudioPlayer(): AudioPlayer {
  let session = 0;
  let playing = false;
  let currentAudio: HTMLAudioElement | null = null;

  function stop() {
    session++;
    playing = false;
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      try {
        currentAudio.pause();
      } catch {
        // Ignore.
      }
      currentAudio = null;
    }
    if (hasTts()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore.
      }
    }
  }

  function playLines(lines: PlayableLine[], opts: PlayOptions) {
    stop();
    const id = session;
    const alive = () => id === session;
    playing = true;

    const fail = (e: AudioPlayError) => {
      if (!alive()) return;
      stop();
      opts.onError?.(e);
    };

    const next = (i: number) => {
      if (!alive()) return;
      if (i >= lines.length) {
        playing = false;
        opts.onEnd?.();
        return;
      }
      const line = lines[i];
      const rate = opts.rate * (line.audio?.rate ?? 1);
      opts.onLine?.(i);
      if (line.audio?.assetUrl && typeof window !== "undefined" && typeof window.Audio === "function") {
        playAsset(line, i, rate);
      } else {
        playTts(line, i, rate);
      }
    };

    const playTts = (line: PlayableLine, i: number, rate: number) => {
      if (!hasTts()) return fail({ code: "tts-unavailable", lineIndex: i });
      whenVoicesReady(() => {
        if (!alive()) return;
        try {
          const u = new SpeechSynthesisUtterance(line.textEn);
          const voice = voiceFor(line.speakerId);
          if (voice) u.voice = voice;
          u.lang = voice?.lang ?? "en-US";
          u.rate = rate;
          u.pitch = profileFor(line.speakerId).pitch;
          u.onend = () => alive() && next(i + 1);
          u.onerror = (ev) => {
            // "interrupted"/"canceled" come from our own stop() — not a real failure.
            if (ev.error === "interrupted" || ev.error === "canceled") return;
            fail({ code: "tts-failed", lineIndex: i, detail: ev.error });
          };
          window.speechSynthesis.speak(u);
        } catch (err) {
          fail({ code: "tts-failed", lineIndex: i, detail: String(err) });
        }
      });
    };

    const playAsset = (line: PlayableLine, i: number, rate: number) => {
      const fallback = (detail: string) => {
        if (!alive()) return;
        currentAudio = null;
        // A broken file shouldn't kill the scene: read the line with TTS if we can.
        if (hasTts()) playTts(line, i, rate);
        else fail({ code: "asset-failed", lineIndex: i, detail });
      };
      try {
        const audio = new Audio(line.audio!.assetUrl);
        currentAudio = audio;
        audio.playbackRate = rate;
        audio.onended = () => {
          if (!alive()) return;
          currentAudio = null;
          next(i + 1);
        };
        audio.onerror = () => fallback("load-error");
        audio.play().catch((err) => fallback(String(err)));
      } catch (err) {
        fallback(String(err));
      }
    };

    next(0);
  }

  return { playLines, stop, isPlaying: () => playing };
}

/** Shared player for the app — one scene plays at a time. */
export const audioPlayer: AudioPlayer = createTtsAudioPlayer();
