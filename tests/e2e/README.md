# Acceptance QA

Playwright checks for every item in `docs/spec/14-acceptance.md` (listening/speaking version), run against the production build.
Speech is stubbed with an init script: `speechSynthesis` finishes each line after a few ms and records text/rate, and
`SpeechRecognition` returns a fixed phrase and counts starts. Real voices and a real microphone still need a manual check in a browser.

## One-time setup (Windows, from the project root)

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install playwright
$env:PLAYWRIGHT_BROWSERS_PATH = "0"   # keep the browser inside .venv
.\.venv\Scripts\python.exe -m playwright install chromium-headless-shell
```

## Run

```powershell
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH = "0"; $env:PYTHONIOENCODING = "utf-8"
.\.venv\Scripts\python.exe -I .claude\skills\webapp-testing\scripts\with_server.py --server "npx vite preview --port 4173 --strictPort" --port 4173 --timeout 60 -- .\.venv\Scripts\python.exe tests\e2e\qa_acceptance.py http://localhost:4173
```

- Output: `PASS` / `FAIL` / `N/A` per item, then `tests/e2e/output/results.json` and screenshots (git-ignored).
- Exit code is 1 when any check fails. `N/A` marks a criterion outside the MVP scope (item 12 needs EP11–12).
- On Windows `with_server.py` may leave `vite preview` running on port 4173 after the run; stop that `node` process before the next run, or `--strictPort` will fail.
