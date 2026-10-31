# Lunaris

A YouTube Music-style web app: browse charts, search, play songs in one persistent
player, and keep a personal library. Built with Next.js (App Router), TypeScript and
Tailwind, with a mobile-first neomorphic light and dark theme.

## Parts

- **Web app** (this folder): the UI and its server-side `/api` routes.
- **Music service** (`music-service/`): a FastAPI service over `ytmusicapi`. The browser
  never calls it directly; server code reaches it through `MUSIC_SERVICE_URL`.
- **YouTube IFrame player**: plays the audio and video. One iframe lives for the whole
  session and is positioned over the current screen's player slot.
- **Supabase**: accounts and library data, protected by Row-Level Security.

## Setup

Requires Node.js and Python.

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values

cd music-service
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt   # Windows
```

## Run

Start both, in two terminals:

```bash
# from music-service/
.venv\Scripts\python -m uvicorn app.main:app --port 8000

# from the project root
npm run dev
```

Open **http://localhost:3000**. Use `localhost`, not `127.0.0.1`: most videos refuse to
embed on `127.0.0.1`.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Charts and trending artists |
| `/search` | Search with suggestions |
| `/album/[id]`, `/playlist/[id]`, `/artist/[id]` | Album, YouTube playlist and artist |
| `/now-playing/[videoId]` | Player, controls and lyrics |
| `/login` | Log in or sign up |
| `/library`, `/library/playlists/[id]` | Liked songs and your playlists |

## Accounts and library

Sessions live in cookies through `@supabase/ssr`. The browser only talks to this app:
`/api/library/*` Route Handlers and the login Server Actions call Supabase on the
server, and `proxy.ts` keeps the session fresh. Row-Level Security limits every table to
its owner. Browsing and playing need no account; library actions ask you to log in.

The Supabase project needs `http://localhost:3000/auth/callback` in its allowed redirect
URLs so sign-up confirmation links return to the app.

## Checks

```bash
npm run lint
npm run build
```
