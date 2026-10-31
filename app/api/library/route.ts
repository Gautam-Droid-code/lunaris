import { NextResponse } from "next/server";
import { toTrack, type LibraryData, type SavedTrack } from "@/lib/library";
import { createSupabase } from "@/lib/supabase/server";

const LOGGED_OUT: LibraryData = { user: null, liked: [], playlists: [] };

type PlaylistRow = { id: string; name: string; playlist_tracks: { count: number }[] };

export async function GET() {
  const supabase = await createSupabase();
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json(LOGGED_OUT);

    const [liked, playlists] = await Promise.all([
      supabase
        .from("liked_songs")
        .select("video_id, title, artists, thumbnail")
        .order("liked_at", { ascending: false }),
      supabase
        .from("playlists")
        .select("id, name, playlist_tracks(count)")
        .order("created_at", { ascending: false }),
    ]);
    if (liked.error) throw liked.error;
    if (playlists.error) throw playlists.error;

    const library: LibraryData = {
      user: { email: data.user.email ?? "" },
      liked: (liked.data as SavedTrack[]).map(toTrack),
      playlists: (playlists.data as PlaylistRow[]).map(({ id, name, playlist_tracks }) => ({
        id,
        name,
        trackCount: playlist_tracks[0]?.count ?? 0,
      })),
    };
    return NextResponse.json(library);
  } catch (error) {
    // Supabase being down must not stop anyone browsing or playing.
    console.error("Library load failed", error);
    return NextResponse.json(LOGGED_OUT);
  }
}
