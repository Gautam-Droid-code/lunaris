# Lunaris music service

A FastAPI wrapper around unauthenticated ytmusicapi. It returns normalized JSON for the Lunaris app.

## Run

```powershell
cd C:\code\Projects\lunaris\music-service
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

API docs are at http://localhost:8000/docs.

## Endpoints

| Route | Notes |
| --- | --- |
| `GET /health` | Service check |
| `GET /search?q=&type=` | `type` is `songs` (default), `albums`, `artists` or `playlists` |
| `GET /search/suggestions?q=` | Search suggestions |
| `GET /song/{videoId}` | Song details |
| `GET /album/{browseId}` | Album and tracks |
| `GET /artist/{browseId}` | Artist and top sections |
| `GET /playlist/{playlistId}?limit=` | Playlist and tracks (default 100, max 500) |
| `GET /lyrics/{videoId}` | Lyrics, or 404 if none exist |
| `GET /radio/{videoId}?limit=` | Next-up queue (default 25, max 100) |
| `GET /charts?country=ZZ` | Charts; `ZZ` is global |

Errors use `{"detail": "..."}`: 400 for malformed album IDs, 404 for unknown IDs or missing lyrics, 422 for bad parameters, 502 for upstream failures.
