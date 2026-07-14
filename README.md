# 🎧 Helpdesk Hero

An immersive **IT help desk simulator**. Step onto a busy support floor, chat with clients who
literally *talk to you*, triage a live ticket queue, and climb from nervous intern to legendary
**Helpdesk Hero** — one ticket at a time.

It's a "day in the life" of IT support: real ticketing, client tiers, difficulty levels, SLAs,
satisfaction scores, XP, ranks, and badges. No backend, no API keys — it ships as a fully static
site you can deploy anywhere.

![Helpdesk Hero](public/favicon.svg)

## ✨ Features

- **Real voices** — clients speak via the browser's speech synthesis, each persona tuned with pitch and pace. Pick a **voice per client** in settings.
- **41 ticket scenarios** — password resets to ransomware, major incidents, on-call pages, and war stories.
- **Live ticket queue** — tickets keep arriving. **Queue aging** makes ignored tickets angrier before you even open them.
- **Day & night shifts** — night shift uses a cooler UI theme and biases toward Security, VIP, and on-call escalations.
- **Client tiers & difficulty** — Standard through Executive, difficulty ★ to ★★★★★.
- **Real ticketing flow** — multi-step conversations, in-chat coaching on wrong picks, post-ticket debriefs.
- **Ticket documentation** — classify category, priority, and write an accurate **resolution note** before closing.
- **Live scoring** — CSAT, SLA timers (paused across refresh), mood meter, first-try streaks.
- **8 ranks + badges** — XP progression with mid-shift badge toasts.
- **Certification gates** — 7 exams unlock harder ticket pools; XP alone isn't enough.
- **Study Mode** — full knowledge base + certification exams.
- **Practice Library** — replay any scenario; **Replay my mistakes** from the dashboard.
- **Performance dashboard** — CSAT trends, category strengths/weaknesses, SLA and first-try rates.
- **Shift persistence** — resume an in-progress shift after refresh; export/import save files.
- **PWA** — installable and works offline after first load.
- **Adaptive queue** — leans toward categories where your CSAT is weakest.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Enter an agent name and clock in.

**Play live:** [https://bshadyboi.github.io/helpdesk-hero/](https://bshadyboi.github.io/helpdesk-hero/) — auto-deploys from `main` via GitHub Actions.

> 🔊 Turn your volume up — the clients talk!

## 🏗️ Build for production / go live

```bash
npm run build      # outputs a static site to dist/
npm run preview    # preview the production build locally
npm test           # unit tests (cert gates, queue aging, timer)
```

The `dist/` folder is a static site. Deploy it to any static host:

- **Netlify / Vercel / Cloudflare Pages** — point at this repo, build command `npm run build`,
  publish directory `dist`.
- **GitHub Pages** — push to `main` and the workflow in `.github/workflows/deploy.yml` publishes to
  `https://bshadyboi.github.io/helpdesk-hero/` (or fork and enable Pages on your repo).
- Any static file server.

## 🎮 How to play

1. **Pick a ticket** from the queue on the left.
2. **Read the client's message** (and listen — they'll speak).
3. **Choose the best response.** The Knowledge Base panel offers smart hints for each step.
4. **Resolve it** to earn XP and keep CSAT high. Beat the SLA for a bonus.
5. Keep a **first‑try streak** going, unlock **badges**, and climb the **ranks**.

## 🧱 Tech stack

- **React 18** + **TypeScript**
- **Vite** for dev/build
- **Tailwind CSS** for the UI
- **Web Speech API** (SpeechSynthesis) for client voices
- **Web Audio API** for UI sound effects
- **localStorage** for persistent progress + optional JSON export/import
- **vite-plugin-pwa** for offline install

No servers, no accounts, no tracking.

## 📁 Project structure

```
src/
  game/
    types.ts        # core data models
    scenarios.ts    # the ticket/scenario library (add your own!)
    knowledge.ts    # knowledge base articles
    ranks.ts        # ranks, XP thresholds, badges
    useGame.ts      # persistent progress (localStorage)
    useShift.ts     # shift + ticket game-loop reducer
  lib/
    speech.ts       # text-to-speech + sound effects
  components/       # UI (workspace, chat, queue, HUD, modals, etc.)
```

## ➕ Adding your own tickets

Open `src/game/scenarios.ts` and add a new `Scenario` object. Each scenario is a short conversation
of `steps`, and each step offers `options` (mark the best one `correct: true`). That's it — it shows
up in the queue automatically based on its `minLevel`.

---

Made for fun and for leveling up real IT support instincts. Go be a hero. 🦸
