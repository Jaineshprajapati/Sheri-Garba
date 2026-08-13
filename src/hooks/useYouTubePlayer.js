import { useState, useEffect, useRef, useCallback } from "react";

export function useYouTubePlayer(tracks, containerRef) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const ytPlayerRef = useRef(null);
  const trackIndexRef = useRef(0);
  const shuffleRef = useRef(false);
  const initializedRef = useRef(false);
  const autoplayAttemptedRef = useRef(false);

  // --------------------------------------------------
  // Pick a random track when playlist loads
  // --------------------------------------------------

  useEffect(() => {
    if (tracks.length > 0 && !initializedRef.current) {
      const randomIndex = Math.floor(
        Math.random() * tracks.length
      );

      setTrackIndex(randomIndex);
      trackIndexRef.current = randomIndex;

      initializedRef.current = true;
    }
  }, [tracks]);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  // --------------------------------------------------
  // Advance track
  // --------------------------------------------------

  const advanceTrack = useCallback(
    (dir) => {
      const len = tracks.length;

      if (len === 0) return;

      let next;

      if (shuffleRef.current) {
        do {
          next = Math.floor(Math.random() * len);
        } while (
          next === trackIndexRef.current &&
          len > 1
        );
      } else {
        next =
          (trackIndexRef.current + dir + len) % len;
      }

      trackIndexRef.current = next;
      setTrackIndex(next);

      if (ytPlayerRef.current?.loadVideoById) {
        ytPlayerRef.current.loadVideoById(
          tracks[next].id
        );

        setCurrentTime(0);
        setDuration(0);
        setAutoplayBlocked(false);
        setIsPlaying(true);
      }
    },
    [tracks]
  );

  // --------------------------------------------------
  // Load YouTube IFrame API
  // --------------------------------------------------

  useEffect(() => {
    if (
      !containerRef.current ||
      tracks.length === 0
    ) {
      return;
    }

    let cancelled = false;

    function createPlayer() {
      if (
        cancelled ||
        !containerRef.current ||
        tracks.length === 0
      ) {
        return;
      }

      const initialTrack =
        tracks[trackIndexRef.current] || tracks[0];

      ytPlayerRef.current = new window.YT.Player(
        containerRef.current,
        {
          height: "0",
          width: "0",

          videoId: initialTrack.id,

          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },

          events: {
            onReady: (event) => {
              if (cancelled) return;

              setReady(true);

              event.target.setVolume(volume);

              // Attempt autoplay
              if (!autoplayAttemptedRef.current) {
                autoplayAttemptedRef.current = true;

                try {
                  event.target.playVideo();
                } catch (error) {
                  console.log(
                    "Autoplay was blocked:",
                    error
                  );

                  setAutoplayBlocked(true);
                }
              }
            },

            onStateChange: (event) => {
              if (!window.YT || cancelled) {
                return;
              }

              if (
                event.data ===
                window.YT.PlayerState.PLAYING
              ) {
                setIsPlaying(true);
                setAutoplayBlocked(false);

                setDuration(
                  event.target.getDuration()
                );
              }

              else if (
                event.data ===
                window.YT.PlayerState.PAUSED
              ) {
                setIsPlaying(false);
              }

              else if (
                event.data ===
                window.YT.PlayerState.ENDED
              ) {
                advanceTrack(1);
              }
            },
          },
        }
      );
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const existing = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existing) {
        const tag = document.createElement("script");

        tag.src =
          "https://www.youtube.com/iframe_api";

        document.body.appendChild(tag);
      }

      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousCallback === "function") {
          previousCallback();
        }

        createPlayer();
      };
    }

    return () => {
      cancelled = true;

      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (error) {
          // Ignore cleanup errors
        }
      }

      ytPlayerRef.current = null;

      setReady(false);
      setIsPlaying(false);
    };
  }, [tracks, advanceTrack, containerRef]);

  // --------------------------------------------------
  // Start music manually
  // --------------------------------------------------

  const startMusic = useCallback(() => {
    const player = ytPlayerRef.current;

    if (!player) return;

    try {
      player.unMute();
      player.setVolume(volume || 70);
      player.playVideo();

      setMuted(false);
      setAutoplayBlocked(false);
    } catch (error) {
      console.error(
        "Could not start music:",
        error
      );
    }
  }, [volume]);

  // --------------------------------------------------
  // Play / Pause
  // --------------------------------------------------

  const togglePlay = useCallback(() => {
    const player = ytPlayerRef.current;

    if (!player || !ready) return;

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      startMusic();
    }
  }, [
    ready,
    isPlaying,
    startMusic,
  ]);

  // --------------------------------------------------
  // Progress polling
  // --------------------------------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      const player = ytPlayerRef.current;

      if (
        player?.getCurrentTime &&
        !seeking
      ) {
        setCurrentTime(
          player.getCurrentTime()
        );

        const currentDuration =
          player.getDuration
            ? player.getDuration()
            : 0;

        if (currentDuration) {
          setDuration(currentDuration);
        }
      }
    }, 400);

    return () => clearInterval(timer);
  }, [seeking]);

  // --------------------------------------------------
  // Seek
  // --------------------------------------------------

  const handleSeekTime = useCallback(
    (time) => {
      const player = ytPlayerRef.current;

      if (!player || !ready) return;

      setCurrentTime(time);
      player.seekTo(time, true);
    },
    [ready]
  );

  // --------------------------------------------------
  // Volume
  // --------------------------------------------------

  const handleVolumeChange = useCallback(
    (value) => {
      setVolume(value);
      setMuted(value === 0);

      if (ytPlayerRef.current?.setVolume) {
        ytPlayerRef.current.setVolume(value);

        if (value === 0) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      }
    },
    []
  );

  // --------------------------------------------------
  // Mute
  // --------------------------------------------------

  const toggleMute = useCallback(() => {
    const player = ytPlayerRef.current;

    if (!player || !ready) return;

    if (muted) {
      player.unMute();

      const targetVolume = volume || 50;

      player.setVolume(targetVolume);

      setMuted(false);

      if (!volume) {
        setVolume(50);
      }
    } else {
      player.mute();
      setMuted(true);
    }
  }, [ready, muted, volume]);

  // --------------------------------------------------
  // Keyboard controls
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName =
        event.target?.tagName?.toLowerCase();

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        event.target?.isContentEditable
      ) {
        return;
      }

      if (!ready) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlay();
          break;

        case "ArrowLeft":
          event.preventDefault();
          advanceTrack(-1);
          break;

        case "ArrowRight":
          event.preventDefault();
          advanceTrack(1);
          break;

        case "KeyM":
          event.preventDefault();
          toggleMute();
          break;

        case "KeyS":
          event.preventDefault();
          setShuffle((value) => !value);
          break;

        case "ArrowUp":
          event.preventDefault();

          handleVolumeChange(
            Math.min(100, volume + 10)
          );

          break;

        case "ArrowDown":
          event.preventDefault();

          handleVolumeChange(
            Math.max(0, volume - 10)
          );

          break;

        default:
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    ready,
    volume,
    togglePlay,
    advanceTrack,
    toggleMute,
    handleVolumeChange,
  ]);

  // --------------------------------------------------
  // Return player state
  // --------------------------------------------------

  return {
    track: tracks[trackIndex],
    trackIndex,

    isPlaying,
    ready,
    autoplayBlocked,

    currentTime,
    duration,

    volume,
    muted,

    shuffle,
    seeking,

    setSeeking,
    setShuffle,

    advanceTrack,

    togglePlay,
    startMusic,

    handleSeekTime,
    handleVolumeChange,
    toggleMute,
  };
}