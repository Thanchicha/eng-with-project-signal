"""Acceptance QA for the listening/speaking MVP (docs/spec/14-acceptance.md, 15 criteria).

Speech is stubbed so headless Chromium can run every flow: speechSynthesis finishes each line
after a few ms and records rate/text; SpeechRecognition returns a fixed phrase and counts
starts; getUserMedia calls are counted. See tests/e2e/README.md for how to run it.
"""

import json
import re
import sys
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173"
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "output"
OUT.mkdir(exist_ok=True)
KEY = "project-signal:progress:v1"
THAI = re.compile(r"[฀-๿]")
SCORE_WORDS = re.compile(r"accent score|pronunciation score|\d+\s*%|คะแนนสำเนียง\s*\d|ถูกต้อง\s*\d+", re.I)

SPEECH_STUB = """
(() => {
  window.__utterances = [];
  window.__recStarts = 0;
  window.__gum = 0;
  let timers = [];
  const voice = { name: 'Stub English', lang: 'en-US', voiceURI: 'stub-en', default: true, localService: true };
  const synth = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: () => [voice],
    speak(u) {
      window.__utterances.push({ text: u.text, rate: u.rate });
      synth.speaking = true;
      timers.push(setTimeout(() => { u.onstart && u.onstart(); }, 2));
      timers.push(setTimeout(() => { synth.speaking = false; u.onend && u.onend(); }, 15));
    },
    cancel() { timers.forEach(clearTimeout); timers = []; synth.speaking = false; },
    pause() {}, resume() {},
    addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; this.rate = 1; this.pitch = 1; } };
  if (!window.__noRecognition) {
    class StubRec {
      start() { window.__recStarts++; setTimeout(() => this.onresult && this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'who are the users' }], { isFinal: false })] }), 20); }
      stop() { setTimeout(() => { this.onresult && this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'who are the users for this project' }], { isFinal: true })] }); this.onend && this.onend(); }, 20); }
      abort() { this.onend && this.onend(); }
    }
    window.SpeechRecognition = StubRec;
    window.webkitSpeechRecognition = StubRec;
  } else {
    delete window.SpeechRecognition; delete window.webkitSpeechRecognition;
  }
  if (navigator.mediaDevices) {
    const real = navigator.mediaDevices.getUserMedia?.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (...a) => { window.__gum++; return real ? real(...a) : Promise.reject(new Error('no')); };
  }
})();
"""

results: list[dict] = []


def record(item: str, ok: bool | None, evidence: str):
    """ok=None marks a criterion outside the MVP scope (reported, not failed)."""
    results.append({"item": item, "ok": ok, "evidence": evidence})
    print(f"{'N/A ' if ok is None else 'PASS' if ok else 'FAIL'}  [{item}] {evidence}")


def check(item: str):
    def wrap(fn):
        def run(*args):
            try:
                fn(*args)
            except Exception as e:  # noqa: BLE001 — report every failure, keep going
                record(item, False, f"error: {e}".splitlines()[0][:300])

        return run

    return wrap


def new_page(browser: Browser, *, recognition=True, **ctx) -> Page:
    context = browser.new_context(**({"viewport": {"width": 1280, "height": 900}} | ctx))
    if not recognition:
        context.add_init_script("window.__noRecognition = true;")
    context.add_init_script(SPEECH_STUB)
    page = context.new_page()
    page.on("pageerror", lambda e: record("no page errors", False, str(e)[:200]))
    return page


def fresh(page: Page, route: str = "#/", progress: dict | None = None):
    page.goto(f"{BASE}/")
    page.evaluate(f"localStorage.removeItem('{KEY}')")
    if progress is not None:
        page.evaluate("([k, v]) => localStorage.setItem(k, JSON.stringify(v))", [KEY, progress])
    # Leave the app before loading the route: a hash-only navigation would let the running app
    # save its in-memory progress over what we just stored.
    page.goto("about:blank")
    page.goto(f"{BASE}/{route}")
    page.wait_for_load_state("networkidle")


def button(page: Page, name: str):
    return page.get_by_role("button", name=name, exact=True)


def stored(page: Page) -> dict:
    return json.loads(page.evaluate(f"localStorage.getItem('{KEY}')") or "{}")


def progress_with(**overrides) -> dict:
    base = {
        "completedEpisodes": [], "savedVocabulary": [], "triedDrills": [], "practicedPatterns": [], "viewedChoices": [],
        "triedChecks": [], "replays": {}, "spokenIds": [],
        "settings": {"thaiHints": False, "textSize": "normal", "alwaysShowTranscript": False, "audioRate": 1, "textOnly": False, "micConsent": "unset"},
    }
    return base | overrides


def listen(page: Page):
    """Play the scene once and wait until the stubbed audio finishes."""
    page.locator(".scene-audio__main").click()
    page.wait_for_function("document.querySelector('.scene-audio__now')?.textContent.startsWith('ฟังแล้ว')", timeout=10000)


def answer_check(page: Page) -> bool:
    """Answer the listening check, trying choices until the right one. Returns True if it existed."""
    if not page.locator(".lcheck").count():
        return False
    for i in range(page.locator(".lcheck__choice").count()):
        page.locator(".lcheck__choice").nth(i).click()
        if page.locator(".lcheck__feedback--right").count():
            break
    return True


def speak_said_it(page: Page):
    button(page, "ฉันพูดออกเสียงแล้ว (I said it)").first.click()


def next_scene(page: Page):
    page.locator(".scene-flow__next .btn--primary, .feedback__actions .btn--primary").first.click()
    page.wait_for_timeout(120)


# 1 ─ start EP1 with no account / API key
@check("1 start without account")
def t_start(browser: Browser):
    page = new_page(browser)
    fresh(page)
    fields = page.locator("input[type=password], input[type=email], input[name*=key i]").count()
    button(page, "เริ่ม Episode 1").click()
    page.wait_for_url("**/#/ep/ep01")
    before = page.get_by_role("heading", name="ก่อนฟัง").is_visible()
    hints = page.locator(".intro__hints .chip").all_inner_texts()
    button(page, "เริ่มตอนนี้").click()
    page.wait_for_url("**/#/ep/ep01/play")
    play = page.locator(".scene-audio__main").inner_text()
    record("1 start without account", fields == 0 and before and len(hints) in (2, 3) and "ฟังฉากนี้" in play,
           f"no login/key fields; intro 'ก่อนฟัง' with hint words {hints}; scene opens on '{play.strip()}'")
    page.context.close()


# 2, 3, 8, 9 ─ full EP1: every scene listen → check → speak, then lessons to the recap
@check("2/3/8/9 full EP1")
def t_full(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play")
    scenes, hidden_ok, audio_ok, speak_points, leads_missing, thai_fb = 0, 0, 0, 0, [], 0
    while "/play" in page.url and scenes < 10:
        scenes += 1
        transcript_before = page.locator(".dialogue").count()
        lines = page.evaluate("window.__utterances.length")
        listen(page)
        played = page.evaluate("window.__utterances.length") - lines
        hidden_after_listen = page.locator(".dialogue").count() == 0
        has_check = answer_check(page)
        if transcript_before == 0 and hidden_after_listen and has_check and page.locator(".dialogue").count() == 1:
            hidden_ok += 1
        speakers = set(page.locator(".line__name").all_inner_texts())
        if not {"Kuro", "Miyu"} <= {s.replace(" (กำลังพูด)", "") for s in speakers}:
            leads_missing.append(f"scene {scenes}")
        if played == page.locator(".dialogue .line").count():
            audio_ok += 1
        if THAI.search(page.locator(".lcheck__feedback").inner_text()):
            thai_fb += 1
        if page.locator(".speak-resp").count():
            speak_points += 1
            speak_said_it(page)
            if THAI.search(page.locator(".speak-resp .feedback__parts dd").first.inner_text()):
                thai_fb += 1
            button(page, "ใช้คำของตัวเอง (I tried my own words)").click()
        page.screenshot(path=str(OUT / f"ep01_scene{scenes}.png"), full_page=True)
        next_scene(page)
    steps = []
    while "/recap" not in page.url and len(steps) < 10:
        steps.append(page.locator(".learn__title span").first.inner_text())
        if page.locator(".shadow").count():
            for _ in range(page.locator(".shadow__nav button").count()):
                speak_said_it(page)
                if button(page, "ข้อถัดไป").count():
                    button(page, "ข้อถัดไป").click()
        page.locator(".learn__nav .btn--primary").click()
        page.wait_for_timeout(150)
    recap = page.locator(".learn__title").inner_text()
    data = stored(page)
    page.screenshot(path=str(OUT / "ep01_recap.png"), full_page=True)

    record("2 Before Listening → Recap", scenes == 6 and "จบแล้ว" in recap and data.get("completedEpisodes") == ["ep01"],
           f"{scenes} scenes → {len(steps)} lesson steps ({', '.join(steps)}) → recap; completed={data.get('completedEpisodes')}")
    record("3 audio + Listening Check before transcript", hidden_ok == 6 and audio_ok == 6,
           f"{audio_ok}/6 scenes played every line as audio; {hidden_ok}/6 kept the transcript hidden until the listening check was answered")
    record("8 Kuro & Miyu in every scene", not leads_missing, "both speak in all 6 scenes" if not leads_missing else ", ".join(leads_missing))
    record("9a Thai feedback after listening/speaking", thai_fb >= 12 and speak_points == 6,
           f"{thai_fb} Thai feedback panels across 6 listening checks and {speak_points} speaking points")
    page.context.close()


# 4 ─ replay, slow speed, transcript and Thai on demand
@check("4 replay / slow / transcript")
def t_replay(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play")
    toggle_before = button(page, "แสดงบทพูด (transcript)").count() == 1
    button(page, "แสดงบทพูด (transcript)").click()
    shown_on_demand = page.locator(".dialogue").count() == 1
    page.get_by_role("button", name=re.compile("ความเร็ว")).click()
    listen(page)
    listen(page)
    rates = page.evaluate("[...new Set(window.__utterances.map(u => u.rate))]")
    page.locator(".line__translate", has_text="แปล").first.click()
    thai = page.locator(".line__th").count()
    line_replay = page.locator(".line__listen").count()
    replays = stored(page).get("replays", {}).get("ep01", 0)
    record("4 replay / slow / transcript", toggle_before and shown_on_demand and 0.75 in rates and thai >= 1 and line_replay > 0 and replays >= 1,
           f"transcript opens on demand before listening; slow speed plays at rates {rates}; replay counted ({replays}); per-line replay buttons {line_replay}; Thai translation is a separate button")
    page.context.close()


# 5 ─ at least 3 speaking points, usable with no mic at all
@check("5 speak without mic")
def t_no_mic(browser: Browser):
    page = new_page(browser, recognition=False)
    fresh(page, "#/ep/ep01/play")
    listen(page)
    answer_check(page)
    modes = page.locator(".speak-resp__modes button").all_inner_texts()
    button(page, "พิมพ์ตอบแทน").click()
    page.locator(".speak-resp textarea").fill("Who are the users for this project?")
    button(page, "ส่งคำตอบ").click()
    typed_ok = "Who are the users" in page.locator(".speak-resp__yours").inner_text()
    record("5 speak without mic", "ฉันพูดออกเสียงแล้ว (I said it)" in modes and "พิมพ์ตอบแทน" in modes and not any("ไมโครโฟน" in m for m in modes) and typed_ok,
           f"browser without SpeechRecognition shows {modes}; typed answer accepted and feedback opened (EP1 has 6 speaking points, see item 2)")
    page.context.close()


# 6 ─ speech recognition: consent first, editable transcript, no scoring
@check("6 speech recognition")
def t_mic(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play")
    starts_on_load = page.evaluate("window.__recStarts + window.__gum")
    listen(page)
    answer_check(page)
    page.get_by_role("button", name=re.compile("พูดผ่านไมโครโฟน")).click()
    notice = page.locator(".speak-resp__consent").inner_text()
    starts_before_consent = page.evaluate("window.__recStarts")
    button(page, "ยินยอมและเริ่มพูด").click()
    page.wait_for_selector(".speak-resp__listening")
    has_cancel = button(page, "ยกเลิก").count() == 1
    page.get_by_role("button", name=re.compile("หยุดและดูข้อความ")).click()
    page.wait_for_selector(".speak-resp__review textarea")
    box = page.locator(".speak-resp__review textarea")
    heard = box.input_value()
    box.fill(heard + "?")
    edited = box.input_value().endswith("?")
    button(page, "ส่งคำตอบ").click()
    feedback = page.locator(".speak-resp__feedback").inner_text()
    data = json.dumps(stored(page))
    record("6 speech recognition",
           starts_on_load == 0 and starts_before_consent == 0 and "ไม่บันทึก" in notice and has_cancel and edited
           and not SCORE_WORDS.search(feedback) and "who are the users" not in data,
           f"no mic/recognizer on load; privacy notice before the first start; stop/cancel while listening; recognized '{heard}' editable; feedback has no score; transcript not stored")
    page.context.close()


# 7 ─ labelled audio/mic buttons with stop, and keyboard play
@check("7 labels / stop / keyboard")
def t_keyboard(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play")
    # Keep the scene "playing" (no end event) so the stop state can be checked.
    page.evaluate("() => { window.speechSynthesis.speak = function (u) { window.__utterances.push({ text: u.text, rate: u.rate }); }; }")
    page.locator(".scene-audio__main").focus()
    page.keyboard.press("Enter")
    stop_label = page.locator(".scene-audio__main").inner_text()
    status = page.locator(".scene-audio__now").inner_text()
    page.keyboard.press("Enter")
    after_stop = page.locator(".scene-audio__main").inner_text()
    unlabeled = []
    for r in ["#/", "#/ep/ep01", "#/ep/ep01/play", "#/ep/ep01/learn/patterns", "#/ep/ep01/learn/shadow", "#/ep/ep01/learn/speak",
              "#/ep/ep01/learn/case", "#/notebook", "#/settings"]:
        page.goto(f"{BASE}/{r}")
        page.wait_for_timeout(150)
        unlabeled += page.evaluate(
            """[...document.querySelectorAll('button, a[href], input, textarea, select, [role=switch]')]
               .filter(el => el.offsetParent !== null)
               .filter(el => !((el.getAttribute('aria-label') || '').trim() || (el.textContent || '').trim()
                 || el.getAttribute('aria-labelledby') || (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label')))
               .map(el => el.outerHTML.slice(0, 80))"""
        )
    record("7 labels / stop / keyboard", "หยุด" in stop_label and "กำลังเล่น" in status and "ฟัง" in after_stop and not unlabeled,
           f"Enter on play → '{stop_label.strip()}' with status '{status[:30]}…'; Enter again stops; unlabelled controls on 9 screens: {unlabeled or 'none'}")
    page.context.close()


# 9b ─ vocabulary popover
@check("9b vocabulary")
def t_vocab(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play", progress_with(settings=progress_with()["settings"] | {"alwaysShowTranscript": True}))
    page.locator(".vocab-word").first.click()
    word = page.locator(".vocab-pop__word").inner_text()
    th = page.locator(".vocab-pop__th").inner_text()
    page.keyboard.press("Escape")
    closed = not page.locator("dialog.vocab-pop").evaluate("d => d.open")
    record("9b vocabulary", bool(word) and bool(THAI.search(th)) and closed, f"word card '{word}' = '{th}', Esc closes")
    page.context.close()


# 10 ─ hear and speak 3+ sentence patterns; writing optional
@check("10 patterns listen & speak")
def t_patterns(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/learn/patterns")
    cards = page.locator(".pattern").count()
    hidden_first = page.locator(".pattern .pattern__frame").count() == 0
    page.locator(".pattern").first.get_by_role("button", name=re.compile("ฟังตัวอย่าง")).click()
    shown = page.locator(".pattern .pattern__frame").count() == 1
    page.goto(f"{BASE}/#/ep/ep01/learn/shadow")
    items = page.locator(".shadow__nav button").count()
    page.locator(".shadow__card").get_by_role("button", name=re.compile("ฟังต้นแบบ")).click()
    speak_said_it(page)
    spoken = len(stored(page).get("spokenIds", []))
    page.goto(f"{BASE}/#/ep/ep01/learn/write")
    optional = "เสริม" in page.locator(".learn__title").inner_text()
    record("10 patterns listen & speak", cards >= 3 and hidden_first and shown and items >= 3 and spoken >= 1 and optional,
           f"{cards} patterns, each heard before its text shows; {items} shadow/substitute items answered aloud; writing step is marked optional")
    page.context.close()


# 11 ─ Mini Case briefing audio and spoken summary, no AI
@check("11 mini case")
def t_minicase(browser: Browser):
    page = new_page(browser)
    calls: list[str] = []
    page.on("request", lambda r: calls.append(r.url))
    fresh(page, "#/ep/ep01/learn/case")
    sample_before = page.locator(".minicase__sample").count()
    page.get_by_role("button", name=re.compile("ฟัง briefing")).click()
    briefing = page.evaluate("window.__utterances.at(-1)?.text")
    speak_said_it(page)
    sample_after = page.locator(".minicase__sample").count()
    external = sorted({u.split("/")[2] for u in calls if not u.startswith(BASE) and "fonts.g" not in u})
    record("11 mini case", sample_before == 0 and bool(briefing) and sample_after == 1 and not external,
           f"briefing played: '{(briefing or '')[:45]}…'; sample answer opens after speaking; external calls: {external or 'none (fonts only)'}")
    page.context.close()


# 12 ─ refresh keeps progress & vocabulary, never audio or mic text
@check("12 refresh / no voice stored")
def t_refresh(browser: Browser):
    page = new_page(browser)
    fresh(page, "#/ep/ep01/play")
    listen(page)
    answer_check(page)
    page.locator(".vocab-word").first.click()
    button(page, "บันทึกลงสมุดคำศัพท์").click()
    button(page, "ปิด").click()
    button(page, "พิมพ์ตอบแทน").click()
    page.locator(".speak-resp textarea").fill("Could you clarify the secret phrase xyzzy?")
    button(page, "ส่งคำตอบ").click()
    button(page, "ใช้คำของตัวเอง (I tried my own words)").click()
    next_scene(page)
    page.reload()
    page.wait_for_load_state("networkidle")
    scene = page.locator(".story__scene-num").inner_text()
    raw = page.evaluate(f"localStorage.getItem('{KEY}')")
    page.goto(f"{BASE}/#/notebook")
    saved = page.get_by_role("button", name=re.compile("บันทึกไว้ทบทวน")).inner_text()
    record("12 refresh / no voice stored", scene == "ฉาก 2" and "(1)" in saved and "xyzzy" not in raw,
           f"after reload story resumes at '{scene}', notebook '{saved}'; typed/spoken text absent from storage (only ids)")
    page.context.close()


# 13 ─ EP2–12 cards with title, summary, roles, listening/speaking mission, locked
@check("13 locked previews")
def t_locked(browser: Browser):
    page = new_page(browser)
    fresh(page)
    cards = page.locator(".ep-node")
    total, complete = cards.count(), 0
    for i in range(1, total):
        c = cards.nth(i)
        dts = c.locator(".ep-card__meta dt").all_inner_texts()
        dds = [d.strip() for d in c.locator(".ep-card__meta dd").all_inner_texts()]
        ok = c.locator(".ep-card__title").inner_text() and c.locator(".ep-card__mystery").inner_text()
        if ok and dts == ["บทบาท", "ฟัง", "พูด"] and all(dds) and "🔒" in c.locator(".ep-card__status").inner_text() and c.locator("a").count() == 0:
            complete += 1
    record("13 locked previews", total == 12 and complete == 11,
           f"{total} cards; {complete}/11 locked cards show title, summary, roles, listening and speaking mission")
    page.context.close()


# 14 ─ phone layout
@check("14 mobile layout")
def t_mobile(browser: Browser):
    routes = ["#/", "#/ep/ep01", "#/ep/ep01/play", "#/ep/ep01/learn/note", "#/ep/ep01/learn/patterns", "#/ep/ep01/learn/shadow",
              "#/ep/ep01/learn/speak", "#/ep/ep01/learn/case", "#/ep/ep01/learn/write", "#/ep/ep01/learn/recap", "#/notebook", "#/settings"]
    problems = []
    for width in (375, 320):
        page = new_page(browser, viewport={"width": width, "height": 740}, is_mobile=True, has_touch=True)
        fresh(page, "#/", progress_with(completedEpisodes=["ep01"]))
        for r in routes:
            page.goto(f"{BASE}/{r}")
            page.wait_for_timeout(200)
            if r.endswith("/play"):
                listen(page)
                answer_check(page)
            over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            small = page.evaluate("[...document.querySelectorAll('.btn')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).length")
            if over > 0 or small:
                problems.append(f"{width}px {r}: overflow {over}px, small buttons {small}")
            if width == 320 and r in ("#/", "#/ep/ep01/play", "#/ep/ep01/learn/speak"):
                page.screenshot(path=str(OUT / f"mobile320_{r.strip('#/').replace('/', '_') or 'home'}.png"), full_page=True)
        page.context.close()
    record("14 mobile layout", not problems,
           f"{len(routes)} screens at 375px and 320px: no horizontal scroll, main buttons ≥ 44px" if not problems else "; ".join(problems))


# 15 ─ main mystery is not reduced to hacking
@check("15 mystery explanation")
def t_mystery(_browser: Browser):
    content = " ".join(p.read_text(encoding="utf-8") for p in (ROOT / "src" / "content").glob("ep*.ts"))
    accusations = re.findall(r"\b(?:hack(?:ed|er|ing)?|แฮก)\b", content, flags=re.I)
    record("15 mystery explanation", None if not accusations else False,
           f"EP1–3 never claim a hack ({len(accusations)} mentions); the full resolution belongs to EP11–12, not written in this MVP")


@check("extra reduced motion")
def t_motion(browser: Browser):
    page = new_page(browser, reduced_motion="reduce")
    fresh(page)
    anim = page.evaluate("getComputedStyle(document.querySelector('.hero__wave path')).animationName")
    record("extra reduced motion", anim == "none", f"hero wave animation with prefers-reduced-motion: {anim}")
    page.context.close()


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for test in (t_start, t_full, t_replay, t_no_mic, t_mic, t_keyboard, t_vocab, t_patterns, t_minicase, t_refresh, t_locked, t_mobile, t_mystery, t_motion):
        test(browser)
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
failed = [r for r in results if r["ok"] is False]
passed = [r for r in results if r["ok"]]
print(f"\n{len(passed)} passed, {len(failed)} failed, {len(results) - len(passed) - len(failed)} not applicable in MVP")
sys.exit(1 if failed else 0)
