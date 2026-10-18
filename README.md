# Angels of Deceit: Project SIGNAL

A story game for Thai learners to practise **listening and speaking** English at about A2–B1 level.
The player joins a team of students on a data project. Each scene follows the same loop: listen, check you understood, say a reply aloud, then see what happens.

เกมเนื้อเรื่องฝึกฟังและพูดภาษาอังกฤษสำหรับผู้เรียนไทย (ระดับ A2–B1) — ฟัง → เข้าใจ → พูด → เห็นผล

## What's in it

- **3 playable episodes** (5 chapters of 3 scenes each, about 1,900 words of dialogue per episode) that unlock in order, and chapters unlock in order within an episode, plus 9 locked previews (EP4–12) that show each episode's listening and speaking mission.
- **Chapter clear cards.** Each chapter ends with a short summary and one phrase to hear and say again (optional), and you can stop after any chapter.
- **Visual-novel scenes.** You play the audio line by line or on auto-play. The English text stays hidden until you answer the Listening Check, though you can open the transcript at any time.
- **You play the chapter lead.** In every scene, after the Listening Check, you take the lead character's seat (Miyu or Kuro, depending on the chapter): the other characters' lines play on request, and you hear and then say each of the lead's lines. Mic, "I said it" and typing all count, and nothing is scored.
- **Speaking points everywhere.** You can use the microphone (optional, only after a privacy notice and your consent), tap "I said it", or type your answer. You never need a microphone to move on.
- **Lessons after each story:** sentence patterns, Shadow & Substitute, a stand-up roleplay, a Mini Case and an optional writing task.
- **Recap, vocabulary notebook and settings** (speed, transcript, Thai hints, text-only mode).
- **Career roles and XP.** You pick a team role to practise. XP comes from doing things, never from being "right".

There is no account, no backend and no scoring of pronunciation or accent. Audio uses the browser's built-in speech (Web Speech API), and what you say into the mic is never stored. Progress is saved in your browser's `localStorage`.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built app |
| `npm run content` | Rebuild `src/content/epXX.ts` from the story files in `docs/story/` |

## Editing the story

Dialogue, Listening Checks, Speaking Prompts and feedback live in `docs/story/epXX.md` (the format is in `docs/story/FORMAT.md`).
Edit the Markdown, then run `npm run content`. The script checks the format and fails if something is missing. Don't edit `src/content/epXX.ts` by hand.

## Project layout

```
src/
  app/          router and app shell
  screens/      Home, Career, Story, Learn, Notebook, Settings…
  components/   VN stage, listening check, speaking practice, lessons…
  features/     speech (TTS + optional recognition), progress, XP, art
  content/      generated episode data + schema (types.ts)
  styles/       design tokens and global CSS
docs/
  spec/         specification (start at 00-index.md)
  story/        episode scripts
  design/       palette and layout notes
  art/          brief for character and background art
tests/e2e/      Playwright acceptance test (see tests/e2e/README.md)
```

## Art

The game runs without any artwork: characters fall back to silhouettes and backgrounds to a CSS night city.
To add real art, put files in `src/assets/art/characters/` and `src/assets/art/bg/`, using the names listed in `docs/art/ART_BRIEF.md`.

## Tests

`tests/e2e/qa_acceptance.py` checks the acceptance criteria in `docs/spec/14-acceptance.md` against a built copy of the app, with the speech and mic APIs stubbed. How to run it is in `tests/e2e/README.md`.

## Stack

React 18, TypeScript and Vite, with plain CSS and design tokens and a hash router. There's no UI library.
