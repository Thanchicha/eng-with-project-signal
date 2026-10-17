// Browser speech synthesis is optional (spec 04 Speak Like an Intern): missing voices must never block play.

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speak(text: string) {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    // Ignore — reading aloud is a convenience only.
  }
}

/** Reads lines one after another (for shadowing a whole dialogue). */
export function speakAll(texts: string[]) {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
    for (const t of texts) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  } catch {
    // Ignore — reading aloud is a convenience only.
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
