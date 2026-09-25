# Vulhub AI Tutor

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688.svg)
![React](https://img.shields.io/badge/React-frontend-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)

AI-assisted learning platform on top of [Vulhub](https://github.com/vulhub/vulhub) — browse the full vulnerable-lab library, get AI explanations, chat with a tutor, take auto-graded quizzes, generate study notes, and track your progress. Runs locally; see [`PRD.md`](PRD.md) for the full product spec.

**Tech stack:** FastAPI · SQLAlchemy · SQLite (backend) · React · Vite · Tailwind CSS · TypeScript (frontend) · OpenAI / Anthropic (optional AI).

Status: MVP features 1–9 are implemented (bundled lab library, lab browser, README viewer, AI explain, AI tutor chat, quiz, progress tracking, study notes, optional VM convenience integration). Feature 10 (SOC/Splunk mode) is out of scope for the MVP per the PRD.

**This app ships with the full Vulhub lab library built in** (every lab's README + docker-compose file, ~2MB,
committed to this repo under `backend/vulhub_data/`) and works immediately with zero configuration — browse
labs, get AI explanations, chat with the tutor, take quizzes, generate study notes, track progress. **The app
never runs Docker or connects to anything on your behalf.** The intended setup: a Kali VM and an Ubuntu VM
with [Vulhub](https://github.com/vulhub/vulhub) + Docker installed, both running in VMware — you clone the
lab there yourself and run `docker compose up` on the Ubuntu VM, then attack it from the Kali VM, entirely
outside this app. Optional VM integration (see below) just shows you those two VMs' power status and lets
you start/stop them from the dashboard; it never connects to or controls anything inside them.

## Prerequisites

- Python 3.11+ and Node 18+ — that's it, for the core app.
- Optional: [VMware Workstation or Player](https://www.vmware.com/products/workstation-pro.html) + a Kali VM
  and an Ubuntu VM with [Vulhub](https://github.com/vulhub/vulhub) + Docker installed, if you want the VM
  power-on/off buttons on the dashboard. Not required to use anything else in the app.

## Quick start (every time you sit down to use it)

Nothing here survives a reboot — both dev servers need to be started fresh (and your VMs too, if you use them).

1. Double-click **`start.bat`** in the project root. First run, it'll also set up the backend venv, copy
   `.env.example` → `.env`, and run `npm install` — that part only happens once. Every run after that just
   opens two windows (backend + frontend) and your browser at http://localhost:5173, in one click.

   Under the hood it's the same two things you'd otherwise run by hand:
   ```bash
   cd backend  &&  .venv/Scripts/python -m uvicorn app.main:app --port 8001
   cd frontend &&  npm run dev
   ```
   (deliberately **not** `--reload` on the backend — see the note under Backend setup for why), which is
   still there as a fallback if you'd rather run them yourself in your own terminals, or you're on
   macOS/Linux where `start.bat` doesn't apply.
2. **Using it** — labs are already there, nothing else to set up:
   - **Dashboard** — Backend API / AI Tutor status, plus Kali/Vulhub VM status if you've configured those.
   - **Labs** — browse/search the built-in library. *Rescan* re-reads the bundled library (only useful if
     you edit `backend/vulhub_data/` yourself).
   - Click into a lab → **How to Run This Lab** shows the lab's path within vulhub, the ports it exposes,
     and a template `docker compose up` command. **Explain With AI** for a breakdown, **Ask the AI Tutor**
     for follow-up questions, **Quiz Me** to test yourself, **Generate Study Notes** when done, and mark
     your progress (in progress/completed + confidence) at the bottom.
   - **Progress** — see everything you've started/completed across sessions.
   - **Settings** — switch AI provider; optionally assign your Kali + Vulhub VMs and power them on/off.
3. **Shutting down**: close both terminal windows that `start.bat` opened (or Ctrl+C in each). If you were
   running a lab on your own VM, stop it there yourself (`docker compose down`) — the app never started it,
   so it won't stop it either.

If a step fails, check `## Notes` below.

## Layout

```
backend/             FastAPI service: bundled lab library, AI integration, SQLite storage, optional VM helpers
backend/vulhub_data/ Bundled copy of every Vulhub lab's README + docker-compose.yml (committed to this repo)
frontend/            React + Tailwind app (functional scaffolding — UI components may be swapped in separately)
start.bat            One-click launcher (Windows): sets up + starts both servers, opens the browser
```

## Backend setup

`start.bat` does all of this for you (see Quick start above) — this is the manual/macOS/Linux version.

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # .venv/bin/pip on macOS/Linux
copy .env.example .env                          # cp on macOS/Linux
.venv/Scripts/python -m uvicorn app.main:app --port 8001
```

`backend/.env` only needs `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` to get you going — optional, without one the
AI endpoints (explain, tutor chat, quiz, study notes) run in **stub mode**: they work end-to-end but return
clearly-labeled placeholder content instead of real AI output. Add a key and restart the backend for real
responses — no code changes needed. VM fields in `.env` are optional first-run bootstrap defaults for the
(optional) VM integration — edit them from the Settings page after that, not the file.

> **Don't use `--reload` on Windows.** With it on, uvicorn's WatchFiles-based auto-restart breaks the
> OpenAI SDK's client construction (`TypeError: Client.__init__() got an unexpected keyword argument
> 'proxies'`, from its `httpx2` dependency) — every AI call 500s even with a valid key. Without `--reload`
> it works correctly. If you're editing backend code, restart the server manually after each change
> instead of relying on `--reload`.

API docs: http://127.0.0.1:8001/docs

## Frontend setup

`start.bat` does this for you too — this is the manual/macOS/Linux version.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (the dev server proxies `/api/*` to the backend on port 8001 — 8000 is taken by another project's Docker container on this machine).

UI components (Dashboard: sidebar, topbar, environment status, current lab, progress stats, recent labs) are
ported from [willy-exe24/vulhub-ai-tutor-dashboard](https://github.com/willy-exe24/vulhub-ai-tutor-dashboard)
— originally a static Next.js/shadcn mockup, converted to plain React and wired to real backend data in
`frontend/src/components/dashboard/` and `frontend/src/components/ui/`. `Labs`, `Lab Detail`, `Progress`, and
`Settings` pages predate that UI drop and still use plain Tailwind pending matching components.

## API overview

- **Labs**: `GET /labs` (supports `?search=&product=&category=&difficulty=`), `GET /labs/{id}`, `GET /labs/{id}/readme`, `GET /labs/{id}/run-instructions` (path + ports, for running it yourself), `POST /labs/rescan` (re-reads the bundled library — labs are auto-populated on first backend startup already)
- **AI tutor**: `POST /ai/explain`, `POST /ai/chat` + `GET /ai/chat/{lab_id}`, `POST /ai/explain-command`, `POST /ai/quiz` + `GET /ai/quiz/{lab_id}` + `POST /ai/quiz/{quiz_id}/submit`, `POST /ai/study-notes` + `GET /ai/study-notes/{lab_id}`
- **Progress**: `GET /progress` (summary), `GET /progress/labs` (started/completed list, with category + latest quiz score), `GET|PUT /progress/{lab_id}`, `PUT /progress/{lab_id}/confidence`
- **Settings**: `GET|PUT /settings/ai` (active provider + whether each provider has a key configured)
- **System**: `GET /system/status` (API reachability, active AI provider + configured status, Kali/Vulhub VM power status) — powers the dashboard's environment cards
- **VMs** (optional, power control only — no execution): `GET /vms/discover` (scan for `.vmx` files), `GET|PUT /vms/config` (assign Kali/Vulhub VM roles), `POST /vms/{kali,vulhub}/start|stop` (power control via `vmrun`)

## Optional: VM power control

None of this is required to use the app — it's a convenience layer for people (like this project's author)
who run Vulhub inside a dedicated Ubuntu VM with a separate Kali attacker VM, rather than on their main
machine. The app never connects to either VM itself; it only runs local `vmrun` calls (no network — no SSH,
no credentials, nothing sent to either VM) to check power state and start/stop them.

1. **VMware Workstation/Player only** (detected via `vmrun`, checked on PATH and standard install locations)
   — no VirtualBox/Hyper-V support.
2. Open **Settings** in the app → *Virtual Machines*. It auto-discovers `.vmx` files under
   `~/Documents/Virtual Machines` (override with `VM_LIBRARY_PATH` in `backend/.env` if yours live
   elsewhere). Assign which detected VM is your **Kali VM** and which is your **Vulhub VM** — VM folder
   names are often unreliable (ours had a Kali VM literally named "Ubuntu 64-bit (3)"), so this is manual by
   design rather than guessed.
3. Use the Start/Stop buttons to power the VMs on/off (via `vmrun start`/`stop`). Once they're up, do
   everything else yourself: clone vulhub onto the Ubuntu VM, run `docker compose up` there for the lab
   you're studying, and attack it from the Kali VM over its own network — this app has no part in that.

## Notes

- Vulhub category is inferred heuristically from README keywords (`backend/app/scanner.py::infer_category`) — Vulhub itself doesn't label categories, so treat this as best-effort, not authoritative.
- The bundled library (`backend/vulhub_data/`) is a point-in-time snapshot — it won't pick up new Vulhub labs added upstream unless someone re-syncs it from a fresh `vulhub` checkout and commits the update.
- VM helpers (`backend/app/vm_control.py`) are VMware-Workstation-only and Windows-oriented (`vmrun.exe`). `KALI_VMX_PATH`/`VULHUB_VMX_PATH`/etc. in `backend/.env` only seed the database on first run — after that, edit them from the Settings page, not the file.

## Acknowledgements

- [Vulhub](https://github.com/vulhub/vulhub) by [phith0n](https://github.com/phith0n) and contributors — the vulnerable-lab library this project is built around. A point-in-time copy of its lab READMEs and `docker-compose` files is bundled under `backend/vulhub_data/` and redistributed under Vulhub's MIT license.

## License

Released under the [MIT License](LICENSE). Bundled Vulhub content under `backend/vulhub_data/` remains under its own MIT license (© 2017-present phith0n, https://vulhub.org).
