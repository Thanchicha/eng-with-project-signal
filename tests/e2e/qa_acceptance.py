"""Acceptance QA for the Project SIGNAL MVP (docs/spec/14-acceptance.md).

Run against a built app (see tests/e2e/README.md):
    .venv/Scripts/python .claude/skills/webapp-testing/scripts/with_server.py \
        --server "npx vite preview --port 4173 --strictPort" --port 4173 \
        -- .venv/Scripts/python tests/e2e/qa_acceptance.py http://localhost:4173

Each check prints PASS/FAIL with evidence; results go to tests/e2e/output/results.json.
"""

import json
import re
import sys
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173"
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "output"
OUT.mkdir(exist_ok=True)
KEY = "project-signal:progress:v1"
THAI = re.compile(r"[฀-๿]")

results: list[dict] = []


def record(item: str, ok: bool | None, evidence: str):
    """ok=None marks a criterion that cannot be met inside the MVP scope (reported, not failed)."""
    results.append({"item": item, "ok": ok, "evidence": evidence})
    print(f"{'N/A ' if ok is None else 'PASS' if ok else 'FAIL'}  [{item}] {evidence}")


def check(item: str):
    """Decorator: run a check, turning exceptions into a FAIL with the error message."""

    def wrap(fn):
        def run(*args):
            try:
                fn(*args)
            except Exception as e:  # noqa: BLE001 — report every failure, keep going
                record(item, False, f"error: {e}".splitlines()[0][:300])

        return run

    return wrap


def fresh(page: Page, route: str = "#/", progress: dict | None = None):
    page.goto(f"{BASE}/")
    page.evaluate(f"localStorage.removeItem('{KEY}')")
    if progress is not None:
        page.evaluate("([k, v]) => localStorage.setItem(k, JSON.stringify(v))", [KEY, progress])
    page.goto(f"{BASE}/{route}")
    page.reload()
    page.wait_for_load_state("networkidle")


def button(page: Page, name: str):
    return page.get_by_role("button", name=name, exact=True)


def reveal_scene(page: Page):
    show_all = button(page, "แสดงทั้งฉาก")
    if show_all.count():
        show_all.click()


def progress(page: Page) -> dict:
    return json.loads(page.evaluate(f"localStorage.getItem('{KEY}')") or "{}")


COMPLETED_EP1 = {
    "completedEpisodes": ["ep01"],
    "savedVocabulary": [],
    "triedDrills": [],
    "practicedPatterns": [],
    "viewedChoices": [],
    "settings": {"thaiHints": False, "textSize": "normal"},
}


# 1 ─ start EP1 with no account / API key
@check("1 start without account")
def t_start(page: Page):
    fresh(page)
    forms = page.locator("input[type=password], input[type=email], input[name*=key i]").count()
    button(page, "เริ่ม Episode 1").click()
    page.wait_for_url("**/#/ep/ep01")
    before_reading = page.get_by_role("heading", name="ก่อนอ่าน").is_visible()
    button(page, "เริ่มตอนนี้").click()
    page.wait_for_url("**/#/ep/ep01/play")
    first_line = page.locator(".line__en").first.inner_text()
    record("1 start without account", forms == 0 and before_reading and "7:55" in first_line,
           f"no login/key fields ({forms}); intro shows Before Reading; story opens: {first_line[:40]!r}")


# 2, 3, 5 ─ full EP1 playthrough: every scene, every choice, then all lessons to the recap
@check("2/3/5 full playthrough")
def t_playthrough(page: Page):
    fresh(page, "#/ep/ep01/play")
    scenes, choices_ok, choices_total, missing_leads = 0, 0, 0, []
    while "/play" in page.url:
        scenes += 1
        reveal_scene(page)
        speakers = set(page.locator(".line__name").all_inner_texts())
        if not {"Kuro", "Miyu"} <= speakers:
            missing_leads.append(f"scene {scenes}: {sorted(speakers)}")
        n = page.locator(".choice").count()
        for i in range(n):
            choices_total += 1
            page.locator(".choice").nth(i).click()
            parts = page.locator(".feedback__parts dd").all_inner_texts()
            if len(parts) == 4 and all(p.strip() for p in parts) and THAI.search(parts[0]) and THAI.search(parts[2]):
                choices_ok += 1
            if i < n - 1:
                button(page, "ลองตัวเลือกอื่น").click()
        page.screenshot(path=str(OUT / f"ep01_scene{scenes}.png"), full_page=True)
        page.locator(".feedback__actions .btn--primary").click()
        page.wait_for_timeout(150)
    steps = []
    while "/recap" not in page.url:
        steps.append(page.locator(".learn__title span").first.inner_text())
        page.locator(".learn__nav .btn--primary").click()
        page.wait_for_timeout(150)
    recap_title = page.locator(".learn__title").inner_text()
    completed = progress(page).get("completedEpisodes", [])
    page.screenshot(path=str(OUT / "ep01_recap.png"), full_page=True)

    record("2 Before Reading → Recap", scenes == 6 and len(steps) == 6 and "จบแล้ว" in recap_title and completed == ["ep01"],
           f"{scenes} scenes → {len(steps)} lesson steps ({', '.join(steps)}) → recap; completed={completed}")
    record("3 Kuro & Miyu in every scene", not missing_leads,
           "both speak in all 6 scenes" if not missing_leads else "; ".join(missing_leads))
    record("5 Thai feedback on every choice", choices_ok == choices_total and choices_total == 18,
           f"{choices_ok}/{choices_total} choices show 4 non-empty parts with Thai explanation")


# 4 ─ translation toggles and vocabulary popover
@check("4 translation + vocabulary")
def t_translation(page: Page):
    fresh(page, "#/ep/ep01/play")
    reveal_scene(page)
    hidden_at_start = page.locator(".line__th").count()
    page.locator(".line__translate", has_text="แปล").first.click()
    one_line = page.locator(".line__th").count()
    page.locator(".story__toggle").click()
    all_lines = page.locator(".line__th").count() == page.locator(".line").count()
    page.locator(".vocab-word").first.click()
    dialog = page.locator("dialog.vocab-pop")
    word = dialog.locator(".vocab-pop__word").inner_text()
    th = dialog.locator(".vocab-pop__th").inner_text()
    page.keyboard.press("Escape")
    closed = not dialog.evaluate("d => d.open")
    record("4 translation + vocabulary", hidden_at_start == 0 and one_line == 1 and all_lines and word and THAI.search(th) and closed,
           f"Thai hidden by default; one line opens on tap; toggle shows all; word card '{word}' = '{th}', Esc closes")


# 6 ─ three sentence patterns and typed answers
@check("6 patterns + typing")
def t_patterns(page: Page):
    fresh(page, "#/ep/ep01/learn/patterns")
    patterns = page.locator(".pattern").count()
    page.goto(f"{BASE}/#/ep/ep01/learn/drills")
    box = page.locator(".drill textarea").first
    box.fill("We need to check the data.")
    page.locator(".drill").first.get_by_role("button", name="ตรวจคำตอบ").click()
    result = page.locator(".drill__result").first.inner_text()
    record("6 patterns + typing", patterns >= 3 and bool(result),
           f"{patterns} patterns; typed drill answered → {result!r}")


# 7 ─ mini case without AI
@check("7 mini case")
def t_minicase(page: Page):
    requests: list[str] = []
    page.on("request", lambda r: requests.append(r.url))
    fresh(page, "#/ep/ep01/learn/case")
    rows = page.locator(".minicase__table tbody tr").count()
    sample = button(page, "ดูคำตอบตัวอย่าง")
    disabled_before = sample.is_disabled()
    page.locator(".minicase textarea").fill("The data shows that Wi-Fi has the most reports. However, we don't know the impact.")
    sample.click()
    shown = page.locator(".minicase__sample").is_visible()
    external = sorted({u.split("/")[2] for u in requests if not u.startswith(BASE) and "fonts.g" not in u})
    record("7 mini case", rows == 5 and disabled_before and shown and not external,
           f"{rows} data rows; sample answer locked until the player writes, then shown; external calls: {external or 'none (fonts only)'}")


# 8 ─ progress and vocabulary survive refresh
@check("8 refresh keeps progress")
def t_refresh(page: Page):
    fresh(page, "#/ep/ep01/play")
    reveal_scene(page)
    page.locator(".vocab-word").first.click()
    button(page, "บันทึกลงสมุดคำศัพท์").click()
    button(page, "ปิด").click()
    page.locator(".choice").first.click()
    button(page, "ไปฉากต่อไป").click()
    page.reload()
    page.wait_for_load_state("networkidle")
    scene = page.locator(".story__scene-num").inner_text()
    page.goto(f"{BASE}/#/notebook")
    saved_tab = page.get_by_role("button", name=re.compile("บันทึกไว้ทบทวน")).inner_text()
    record("8 refresh keeps progress", scene == "ฉาก 2" and "(1)" in saved_tab,
           f"after reload story resumes at '{scene}'; notebook shows '{saved_tab}'")


# 9 ─ locked episodes show title, summary, roles, concept
@check("9 locked previews")
def t_locked(page: Page):
    fresh(page)
    cards = page.locator(".ep-node")
    total = cards.count()
    complete, statuses = 0, []
    for i in range(1, total):
        c = cards.nth(i)
        texts = [c.locator(s).inner_text().strip() for s in (".ep-card__title", ".ep-card__mystery", ".ep-card__meta dd >> nth=0", ".ep-card__meta dd >> nth=1")]
        status = c.locator(".ep-card__status").inner_text()
        statuses.append(status.replace("🔒", "").strip())
        if all(texts) and "🔒" in status and c.locator("a").count() == 0:
            complete += 1
    record("9 locked previews", total == 12 and complete == 11,
           f"{total} episode cards; EP2–12 all show title/summary/roles/language + lock and no link; e.g. {statuses[0]!r}, {statuses[-1]!r}")


# 10 ─ phone layout: no horizontal scroll, comfortable buttons
@check("10 mobile layout")
def t_mobile(browser):
    routes = ["#/", "#/ep/ep01", "#/ep/ep01/play", "#/ep/ep01/learn/note", "#/ep/ep01/learn/drills",
              "#/ep/ep01/learn/speak", "#/ep/ep01/learn/case", "#/ep/ep01/learn/recap", "#/notebook", "#/settings"]
    problems = []
    for width in (375, 320):
        ctx = browser.new_context(viewport={"width": width, "height": 740}, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        fresh(page, "#/", COMPLETED_EP1)
        for r in routes:
            page.goto(f"{BASE}/{r}")
            page.wait_for_timeout(200)
            if r.endswith("/play"):
                reveal_scene(page)
                page.locator(".choice").first.click()
            over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            small = page.evaluate(
                "[...document.querySelectorAll('.btn')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).length"
            )
            if over > 0 or small:
                problems.append(f"{width}px {r}: overflow {over}px, small buttons {small}")
            if width == 320 and r in ("#/", "#/ep/ep01/play"):
                page.screenshot(path=str(OUT / f"mobile320_{r.strip('#/').replace('/', '_') or 'home'}.png"), full_page=True)
        ctx.close()
    record("10 mobile layout", not problems,
           f"{len(routes)} screens at 375px and 320px: no horizontal scroll, main buttons ≥ 44px" if not problems else "; ".join(problems))


# 11 ─ keyboard play and labelled controls
@check("11 keyboard + labels")
def t_keyboard(page: Page):
    fresh(page, "#/ep/ep01/play")

    def tab_to(name: str, limit: int = 40) -> bool:
        for _ in range(limit):
            page.keyboard.press("Tab")
            if page.evaluate("document.activeElement?.textContent?.trim()") == name:
                return True
        return False

    reached_next = tab_to("ต่อไป")
    for _ in range(12):
        if page.evaluate("document.activeElement?.id") == "choices-prompt":
            break
        page.keyboard.press("Enter")
        page.wait_for_timeout(60)
    at_choices = page.evaluate("document.activeElement?.id") == "choices-prompt"
    page.keyboard.press("Tab")
    page.keyboard.press("Enter")
    at_feedback = page.evaluate("document.activeElement?.id") == "feedback-title"
    outline = page.evaluate(
        "(() => { const b = document.querySelector('.feedback .btn--primary'); b.focus(); return getComputedStyle(b).outlineStyle; })()"
    )
    page.keyboard.press("Enter")
    page.wait_for_timeout(150)
    scene2 = page.locator(".story__scene-num").inner_text() == "ฉาก 2"

    unlabeled = []
    for r in ["#/", "#/ep/ep01", "#/ep/ep01/play", "#/ep/ep01/learn/drills", "#/ep/ep01/learn/case", "#/notebook", "#/settings"]:
        page.goto(f"{BASE}/{r}")
        page.wait_for_timeout(150)
        reveal_scene(page)
        missing = page.evaluate(
            """[...document.querySelectorAll('button, a[href], input, textarea, select, [role=switch]')]
               .filter(el => el.offsetParent !== null)
               .filter(el => {
                 const named = (el.getAttribute('aria-label') || '').trim() || (el.textContent || '').trim();
                 const byId = el.getAttribute('aria-labelledby');
                 const label = el.id && document.querySelector(`label[for="${el.id}"]`);
                 const wrapped = el.closest('label');
                 return !(named || byId || label || wrapped);
               }).map(el => el.outerHTML.slice(0, 80))"""
        )
        unlabeled += [f"{r}: {m}" for m in missing]
    ok = reached_next and at_choices and at_feedback and scene2 and outline != "none" and not unlabeled
    record("11 keyboard + labels", ok,
           f"Tab/Enter only: reveal lines → focus moves to choices → feedback → scene 2 (focus ring: {outline}); "
           f"unlabelled controls on 7 screens: {unlabeled or 'none'}")


# 12 ─ main mystery is not reduced to hacking
@check("12 mystery explanation")
def t_mystery(_page: Page):
    content = " ".join(p.read_text(encoding="utf-8") for p in (ROOT / "src" / "content").glob("ep*.ts"))
    accusations = re.findall(r"[^.\"]*\b(?:hack(?:ed|er|ing)?|แฮก)[^.\"]*", content, flags=re.I)
    record("12 mystery explanation", None if not accusations else False,
           f"EP1–3 never claim a hack ({len(accusations)} mentions); full resolution (mixed test data + join key + KPI/access) "
           "belongs to EP11–12, which are not written in this MVP")


def reduced_motion(browser):
    ctx = browser.new_context(reduced_motion="reduce")
    page = ctx.new_page()
    fresh(page)
    anim = page.evaluate("getComputedStyle(document.querySelector('.hero__wave path')).animationName")
    record("extra reduced motion", anim == "none", f"hero wave animation with prefers-reduced-motion: {anim}")
    ctx.close()


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for test in (t_start, t_playthrough, t_translation, t_patterns, t_minicase, t_refresh, t_locked, t_keyboard, t_mystery):
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        test(page)
        if errors:
            record(f"console errors during {test.__name__}", False, "; ".join(errors)[:300])
        ctx.close()
    t_mobile(browser)
    reduced_motion(browser)
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
failed = [r for r in results if r["ok"] is False]
passed = [r for r in results if r["ok"]]
print(f"\n{len(passed)} passed, {len(failed)} failed, {len(results) - len(passed) - len(failed)} not applicable in MVP")
sys.exit(1 if failed else 0)
