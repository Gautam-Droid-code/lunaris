import logging
import threading
from collections.abc import Callable
from typing import Annotated, Literal, TypeVar

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
from ytmusicapi.exceptions import YTMusicServerError, YTMusicUserError

from app import normalize

logger = logging.getLogger("music-service")
T = TypeVar("T")

app = FastAPI(title="Lunaris Music Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Sync routes run in a thread pool; each thread keeps its own client and session.
_local = threading.local()


def yt() -> YTMusic:
    if not hasattr(_local, "client"):
        _local.client = YTMusic()
    return _local.client


def call(fn: Callable[..., T], *args, **kwargs) -> T:
    """Run a ytmusicapi call, turning its failures into clean HTTP errors."""
    try:
        return fn(*args, **kwargs)
    except YTMusicUserError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except YTMusicServerError as exc:
        message = str(exc)
        if "HTTP 400" in message or "HTTP 404" in message or "No content returned" in message:
            raise HTTPException(status_code=404, detail="Not found") from exc
        logger.exception("YouTube Music request failed")
        raise HTTPException(status_code=502, detail="YouTube Music request failed") from exc
    except KeyError as exc:
        # ytmusicapi raises this when an unknown ID returns an empty page.
        if "contents" in str(exc):
            logger.warning("Treating missing page contents as not found: %s", fn.__name__)
            raise HTTPException(status_code=404, detail="Not found") from exc
        logger.exception("Unexpected ytmusicapi response")
        raise HTTPException(status_code=502, detail="YouTube Music request failed") from exc
    except Exception as exc:
        logger.exception("Unexpected ytmusicapi failure")
        raise HTTPException(status_code=502, detail="YouTube Music request failed") from exc


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/search")
def search(
    q: Annotated[str, Query(min_length=1)],
    type: Literal["songs", "albums", "artists", "playlists"] = "songs",
):
    raw = call(yt().search, q, filter=type)
    return {"query": q, "type": type, "results": normalize.search_results(raw, type)}


@app.get("/search/suggestions")
def search_suggestions(q: Annotated[str, Query(min_length=1)]):
    return {"query": q, "suggestions": call(yt().get_search_suggestions, q)}


@app.get("/song/{video_id}")
def song(video_id: str):
    raw = call(yt().get_song, video_id)
    if not raw.get("videoDetails"):
        raise HTTPException(status_code=404, detail="Song not found")
    return normalize.song(raw)


@app.get("/album/{browse_id}")
def album(browse_id: str):
    return normalize.album(call(yt().get_album, browse_id), browse_id)


@app.get("/artist/{browse_id}")
def artist(browse_id: str):
    return normalize.artist(call(yt().get_artist, browse_id), browse_id)


@app.get("/playlist/{playlist_id}")
def playlist(
    playlist_id: str,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
):
    return normalize.playlist(call(yt().get_playlist, playlist_id, limit=limit))


@app.get("/lyrics/{video_id}")
def lyrics(video_id: str):
    watch = call(yt().get_watch_playlist, videoId=video_id, limit=1)
    lyrics_id = watch.get("lyrics")
    if not lyrics_id:
        raise HTTPException(status_code=404, detail="No lyrics for this song")
    return normalize.lyrics(call(yt().get_lyrics, lyrics_id), video_id)


@app.get("/radio/{video_id}")
def radio(
    video_id: str,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
):
    raw = call(yt().get_watch_playlist, videoId=video_id, limit=limit)
    # ytmusicapi treats limit as a minimum and can return more.
    return normalize.radio(raw, video_id, limit)


@app.get("/charts")
def charts(country: Annotated[str, Query(pattern="^[A-Za-z]{2}$")] = "ZZ"):
    code = country.upper()
    result = normalize.charts(call(yt().get_charts, country=code), code)
    # YouTube Music silently falls back to global charts for unsupported codes.
    if code not in result["availableCountries"]:
        raise HTTPException(status_code=404, detail="Charts are not available for this country")
    return result
