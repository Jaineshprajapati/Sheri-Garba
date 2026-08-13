import { useEffect, useRef, useState } from "react";

import { getYouTubePlaylist } from "./services/youtube";

import { usePresenceClock } from "./hooks/usePresenceClock";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";

import { BackgroundScene } from "./components/BackgroundScene";
import { TopBar } from "./components/TopBar";
import { PlayerPill } from "./components/PlayerPill";
import { EeHaloButton } from "./components/EeHaloButton";

export default function App() {
  // --------------------------------------------------
  // Clock / online status
  // --------------------------------------------------

  const { timeStr, online } = usePresenceClock();

  // --------------------------------------------------
  // YouTube playlist
  // --------------------------------------------------

  const [tracks, setTracks] = useState([]);
  const [playlistLoading, setPlaylistLoading] = useState(true);
  const [playlistError, setPlaylistError] = useState(null);

  // --------------------------------------------------
  // YouTube player
  // --------------------------------------------------

  const playerElRef = useRef(null);

  // --------------------------------------------------
  // Fetch playlist from YouTube
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      try {
        setPlaylistLoading(true);
        setPlaylistError(null);

        const playlistTracks = await getYouTubePlaylist();

        if (!cancelled) {
          console.log("YOUTUBE PLAYLIST:", playlistTracks);

          setTracks(playlistTracks);
        }
      } catch (error) {
        console.error("YOUTUBE PLAYLIST ERROR:", error);

        if (!cancelled) {
          setPlaylistError("Unable to load music playlist");
        }
      } finally {
        if (!cancelled) {
          setPlaylistLoading(false);
        }
      }
    }

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // YouTube player
  // --------------------------------------------------

  const playerState = useYouTubePlayer(tracks, playerElRef);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      className="
        relative
        w-full
        h-screen
        min-h-[620px]
        overflow-hidden

        font-['Poppins',sans-serif]

        bg-[#7fb2d9]
      "
    >
      {/* Background */}
      <BackgroundScene />

      {/* Top Navigation */}
      <TopBar timeStr={timeStr} online={online} />

      {/* Ee Halo Button */}
      <EeHaloButton />

      {/* Hidden YouTube IFrame API Player */}
      <div
        className="fixed pointer-events-none opacity-0"
        style={{ width: 1, height: 1 }}
      >
        <div ref={playerElRef} />
      </div>

      {/* Music Player */}
      {tracks.length > 0 && <PlayerPill playerProps={playerState} />}

      {/* Playlist loading */}
      {playlistLoading && (
        <div
          className="
            absolute
            bottom-[120px]
            md:bottom-[130px]
            left-1/2
            -translate-x-1/2

            text-[#fdf6ee]/60

            text-[11px]

            whitespace-nowrap
          "
        >
          Loading music playlist…
        </div>
      )}

      {/* Playlist error */}
      {playlistError && (
        <div
          className="
            absolute
            bottom-[120px]
            md:bottom-[130px]
            left-1/2
            -translate-x-1/2

            text-[#fdf6ee]/60

            text-[11px]

            whitespace-nowrap
          "
        >
          {playlistError}
        </div>
      )}
    </div>
  );
}
