// Legacy helpers kept for existing screens — they now go through the shared AudioPlayer.
// Browser speech is optional: missing voices must never block play.
import { audioPlayer } from "./audioPlayer";
import { hasTts } from "./speechCapabilities";

export const canSpeak = hasTts;

export function speak(text: string) {
  speakAll([text]);
}

/** Reads lines one after another (for shadowing a whole dialogue). */
export function speakAll(texts: string[]) {
  if (!canSpeak()) return;
  audioPlayer.playLines(
    texts.map((textEn) => ({ speakerId: "narrator", textEn })),
    { rate: 0.9 },
  );
}

export function stopSpeaking() {
  audioPlayer.stop();
}
