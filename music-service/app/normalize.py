"""Convert raw ytmusicapi responses into the service's stable JSON shapes."""

from typing import Any

Raw = dict[str, Any]


def thumbnails(item: Raw) -> list[Raw]:
    raw = item.get("thumbnails") or item.get("thumbnail") or []
    if isinstance(raw, dict):  # videoDetails nests the list one level down
        raw = raw.get("thumbnails") or []
    return [
        {"url": t.get("url"), "width": t.get("width"), "height": t.get("height")}
        for t in raw
    ]


def artists(raw: list[Raw] | None) -> list[Raw]:
    return [{"id": a.get("id"), "name": a.get("name")} for a in raw or []]


def album_ref(raw: Raw | str | None) -> Raw | None:
    if not raw:
        return None
    if isinstance(raw, str):  # album tracks carry only the album name
        return {"id": None, "name": raw}
    return {"id": raw.get("id"), "name": raw.get("name")}


def duration_seconds(duration: str | None) -> int | None:
    """Parse "3:22" or "1:02:03" into seconds."""
    if not duration:
        return None
    try:
        seconds = 0
        for part in duration.split(":"):
            seconds = seconds * 60 + int(part)
        return seconds
    except ValueError:
        return None


def track(item: Raw) -> Raw:
    duration = item.get("duration") or item.get("length")
    seconds = item.get("duration_seconds")
    video_id = item.get("videoId")
    return {
        "id": video_id,
        "videoId": video_id,
        "title": item.get("title"),
        "artists": artists(item.get("artists")),
        "album": album_ref(item.get("album")),
        "duration": duration,
        "durationSeconds": seconds if seconds is not None else duration_seconds(duration),
        "thumbnails": thumbnails(item),
        "isExplicit": item.get("isExplicit"),
    }


def tracks(items: list[Raw] | None) -> list[Raw]:
    """Normalize tracks, dropping entries that have no playable video."""
    return [track(item) for item in items or [] if item.get("videoId")]


def album_summary(item: Raw) -> Raw:
    browse_id = item.get("browseId")
    return {
        "id": browse_id,
        "browseId": browse_id,
        "playlistId": item.get("playlistId") or item.get("audioPlaylistId"),
        "title": item.get("title"),
        "type": item.get("type"),
        "artists": artists(item.get("artists")),
        "year": item.get("year"),
        "thumbnails": thumbnails(item),
        "isExplicit": item.get("isExplicit"),
    }


def artist_summary(item: Raw) -> Raw:
    browse_id = item.get("browseId")
    return {
        "id": browse_id,
        "browseId": browse_id,
        "name": item.get("artist") or item.get("title") or item.get("name"),
        "thumbnails": thumbnails(item),
    }


def _author(item: Raw) -> Raw | None:
    author = item.get("author")
    if isinstance(author, list):
        author = author[0] if author else None
    if isinstance(author, str):
        return {"id": None, "name": author}
    if isinstance(author, dict):
        return {"id": author.get("id"), "name": author.get("name")}
    return None


def playlist_summary(item: Raw) -> Raw:
    browse_id = item.get("browseId") or item.get("playlistId")
    playlist_id = browse_id.removeprefix("VL") if browse_id else None
    return {
        "id": playlist_id,
        "browseId": browse_id,
        "playlistId": playlist_id,
        "title": item.get("title"),
        "author": _author(item),
        "itemCount": item.get("itemCount"),
        "thumbnails": thumbnails(item),
    }


SEARCH_NORMALIZERS = {
    "songs": ("song", track),
    "albums": ("album", album_summary),
    "artists": ("artist", artist_summary),
    "playlists": ("playlist", playlist_summary),
}


def search_results(items: list[Raw], search_type: str) -> list[Raw]:
    result_type, normalize = SEARCH_NORMALIZERS[search_type]
    return [
        normalize(item)
        for item in items
        if item.get("resultType") == result_type
        and (search_type != "songs" or item.get("videoId"))
    ]


def song(raw: Raw) -> Raw:
    details = raw["videoDetails"]
    seconds = int(details["lengthSeconds"]) if details.get("lengthSeconds") else None
    video_id = details.get("videoId")
    return {
        "id": video_id,
        "videoId": video_id,
        "title": details.get("title"),
        "artists": [{"id": details.get("channelId"), "name": details.get("author")}],
        "album": None,
        "duration": f"{seconds // 60}:{seconds % 60:02d}" if seconds is not None else None,
        "durationSeconds": seconds,
        "thumbnails": thumbnails(details),
        "viewCount": details.get("viewCount"),
        "playable": raw.get("playabilityStatus", {}).get("status") == "OK",
    }


def album(raw: Raw, browse_id: str) -> Raw:
    cover = thumbnails(raw)
    ref = {"id": browse_id, "name": raw.get("title")}
    album_tracks = []
    for item in tracks(raw.get("tracks")):
        # Album tracks have no art or album id of their own.
        album_tracks.append(
            {**item, "album": ref, "thumbnails": item["thumbnails"] or cover}
        )
    return {
        "id": browse_id,
        "browseId": browse_id,
        "playlistId": raw.get("audioPlaylistId"),
        "title": raw.get("title"),
        "type": raw.get("type"),
        "artists": artists(raw.get("artists")),
        "year": raw.get("year"),
        "description": raw.get("description"),
        "trackCount": raw.get("trackCount"),
        "duration": raw.get("duration"),
        "durationSeconds": raw.get("duration_seconds"),
        "thumbnails": cover,
        "isExplicit": raw.get("isExplicit"),
        "tracks": album_tracks,
    }


def _section(raw: Raw, name: str) -> list[Raw]:
    return (raw.get(name) or {}).get("results") or []


def artist(raw: Raw, browse_id: str) -> Raw:
    owner = [{"id": browse_id, "name": raw.get("name")}]

    def with_owner(item: Raw) -> Raw:
        return {**item, "artists": item["artists"] or owner}

    return {
        "id": browse_id,
        "browseId": browse_id,
        "name": raw.get("name"),
        "description": raw.get("description"),
        "subscribers": raw.get("subscribers"),
        "monthlyListeners": raw.get("monthlyListeners"),
        "radioId": raw.get("radioId"),
        "shuffleId": raw.get("shuffleId"),
        "thumbnails": thumbnails(raw),
        "songs": [with_owner(t) for t in tracks(_section(raw, "songs"))],
        "albums": [with_owner(album_summary(a)) for a in _section(raw, "albums")],
        "singles": [with_owner(album_summary(a)) for a in _section(raw, "singles")],
        "videos": [with_owner(t) for t in tracks(_section(raw, "videos"))],
        "relatedArtists": [artist_summary(a) for a in _section(raw, "related")],
    }


def playlist(raw: Raw) -> Raw:
    return {
        "id": raw.get("id"),
        "playlistId": raw.get("id"),
        "title": raw.get("title"),
        "description": raw.get("description"),
        "author": _author(raw),
        "year": raw.get("year"),
        "trackCount": raw.get("trackCount"),
        "duration": raw.get("duration"),
        "durationSeconds": raw.get("duration_seconds"),
        "thumbnails": thumbnails(raw),
        "tracks": tracks(raw.get("tracks")),
    }


def radio(raw: Raw, video_id: str, limit: int) -> Raw:
    return {
        "videoId": video_id,
        "playlistId": raw.get("playlistId"),
        "tracks": tracks(raw.get("tracks"))[:limit],
    }


def lyrics(raw: Raw, video_id: str) -> Raw:
    return {
        "videoId": video_id,
        "lyrics": raw.get("lyrics"),
        "source": raw.get("source"),
        "hasTimestamps": raw.get("hasTimestamps", False),
    }


def _ranked_artist(item: Raw) -> Raw:
    return {
        **artist_summary(item),
        "rank": item.get("rank"),
        "trend": item.get("trend"),
        "subscribers": item.get("subscribers"),
    }


def charts(raw: Raw, country: str) -> Raw:
    countries = raw.get("countries") or {}
    songs = raw.get("songs")
    if isinstance(songs, dict):  # older chart responses nest items under the section
        songs = songs.get("items")
    return {
        "country": country,
        "countryName": (countries.get("selected") or {}).get("text"),
        "availableCountries": countries.get("options") or [],
        "songs": tracks(songs),
        "playlists": [playlist_summary(p) for p in raw.get("videos") or []],
        "artists": [_ranked_artist(a) for a in raw.get("artists") or []],
    }
