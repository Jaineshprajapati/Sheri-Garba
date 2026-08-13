import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "../utils/timeFormatter";

export function PlayerPill({ playerProps }) {
  const {
    track,
    isPlaying,
    ready,
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
    handleSeekTime,
    handleVolumeChange,
    toggleMute,
  } = playerProps;

  const [showVolume, setShowVolume] = useState(false);
  const progressBarRef = useRef(null);

  const progressPct = duration
    ? (currentTime / duration) * 100
    : 0;

  const handleSeek = (clientX) => {
    const bar = progressBarRef.current;

    if (!bar || !duration || !ready) return;

    const rect = bar.getBoundingClientRect();

    const ratio = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    );

    handleSeekTime(ratio * duration);
  };

  const disabledClass = !ready
    ? "opacity-50 cursor-wait"
    : "cursor-pointer";

  // Custom styles to bump the player up higher in mobile views
  // Tailwind: On mobile (below md), bump higher. On md+ keep as before.
  // bottom-[36px] -> bottom-[64px] on mobile (adjust as needed)

  return (
    <div
      className="
        absolute
        left-1/2
        -translate-x-1/2
        md:bottom-[68px]

        flex
        items-center

        gap-2.5
        md:gap-4

        bg-white/[0.08]
        dark:bg-black/[0.28]

        backdrop-blur-2xl
        backdrop-saturate-200

        border
        border-white/20
        border-t-white/35

        rounded-full

        p-2
        md:p-[10px_20px_10px_12px]

        shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.25)]

        w-[92vw]
        md:w-[min(640px,92vw)]

        z-20
        transition-all
        duration-300
      "
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
      }}
    >
      {/* =========================
          VINYL DISC
      ========================= */}
      <div
        className={`
          relative
          w-11
          h-11
          md:w-13
          md:h-13

          rounded-full
          shrink-0

          shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_6px_16px_rgba(0,0,0,0.4)]

          ${isPlaying ? "disc-spin" : "disc-spin disc-paused"}
        `}
      >
        <img
          src={
            track?.thumbnail ||
            (track?.id
              ? `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`
              : "")
          }
          alt={track?.title || "Track Cover"}
          className="
            w-full
            h-full
            rounded-full
            object-cover
            block
          "
        />

        <div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2

            w-2.5
            h-2.5

            rounded-full

            bg-black/80

            shadow-[0_0_0_1.5px_rgba(255,255,255,0.4)]
          "
        />
      </div>

      {/* =========================
          TRACK INFORMATION
      ========================= */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Track title */}
        <div
          className="
            text-white
            text-[12px]
            md:text-[13.5px]
            font-medium
            tracking-tight
            truncate
            leading-tight
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]
          "
        >
          {!ready
            ? "Waiting for music..."
            : track?.title || "Unknown track"}
        </div>

        {/* Artist */}
        <div
          className="
            text-white/70
            text-[9.5px]
            md:text-[11px]
            font-normal
            truncate
            mt-[2px]
            mb-1.5
          "
        >
          {!ready
            ? "Connecting to YouTube Music..."
            : track?.artist || "YouTube Music"}
        </div>

        {/* Progress bar */}
        <div
          ref={progressBarRef}
          className={`
            relative
            h-1
            rounded-full
            bg-white/20
            backdrop-blur-sm
            overflow-hidden
            ${ready ? "cursor-pointer" : "cursor-wait"}
          `}
          onMouseDown={(e) => {
            if (!ready) return;

            setSeeking(true);
            handleSeek(e.clientX);
          }}
          onMouseMove={(e) => {
            if (
              ready &&
              e.buttons === 1 &&
              seeking
            ) {
              handleSeek(e.clientX);
            }
          }}
          onMouseUp={() => setSeeking(false)}
          onMouseLeave={() => setSeeking(false)}
        >
          <div
            className="
              absolute
              top-0
              left-0
              bottom-0

              bg-gradient-to-r
              from-white/90
              via-amber-200
              to-amber-400

              rounded-full

              shadow-[0_0_10px_rgba(255,255,255,0.5)]

              transition-[width]
              duration-100
            "
            style={{
              width: `${progressPct}%`,
            }}
          />
        </div>

        {/* Time */}
        <div
          className="
            mt-[3px]
            text-[9px]
            md:text-[10.5px]
            font-medium
            tracking-wider
            text-white/50
          "
        >
          {ready
            ? `${formatTime(currentTime)} / ${formatTime(duration)}`
            : "Preparing audio..."}
        </div>
      </div>

      {/* =========================
          CONTROLS
      ========================= */}
      <div
        className="
          flex
          items-center
          gap-0.5
          md:gap-1.5
          shrink-0
        "
      >
        {/* Shuffle */}
        <button
          type="button"
          disabled={!ready}
          className={`
            p-1.5
            md:p-2

            text-white/90

            rounded-full

            hover:bg-white/20
            hover:text-white
            active:scale-90

            transition-all
            duration-200

            ${disabledClass}
          `}
          title={
            ready
              ? "Shuffle"
              : "Waiting for music..."
          }
          aria-label="Shuffle track"
          onClick={() => {
            if (ready) {
              setShuffle((s) => !s);
            }
          }}
          style={{
            opacity: !ready
              ? 0.35
              : shuffle
                ? 1
                : 0.55,
          }}
        >
          <Shuffle
            size={14}
            className="md:w-[15px] md:h-[15px]"
          />
        </button>

        {/* Previous */}
        <button
          type="button"
          disabled={!ready}
          className={`
            p-1.5
            md:p-2

            text-white/90

            rounded-full

            hover:bg-white/20
            hover:text-white
            active:scale-90

            transition-all
            duration-200

            ${disabledClass}
          `}
          aria-label="Previous track"
          title={
            ready
              ? "Previous"
              : "Waiting for music..."
          }
          onClick={() => {
            if (ready) {
              advanceTrack(-1);
            }
          }}
        >
          <SkipBack
            size={15}
            className="md:w-4 md:h-4"
            fill="currentColor"
          />
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          disabled={!ready}
          className={`
            bg-white/90
            hover:bg-white
            text-black

            w-9
            h-9
            md:w-10
            md:h-10

            rounded-full

            flex
            items-center
            justify-center

            shadow-[0_4px_14px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,1)]

            transition-all
            duration-200

            mx-1

            hover:scale-105
            active:scale-95

            ${disabledClass}
          `}
          onClick={togglePlay}
          title={
            !ready
              ? "Waiting for music..."
              : isPlaying
                ? "Pause"
                : "Play"
          }
          aria-label={
            !ready
              ? "Waiting for music"
              : isPlaying
                ? "Pause"
                : "Play"
          }
        >
          {!ready ? (
            <span
              className="
                text-black
                text-[10px]
                font-bold
                tracking-wider
                animate-pulse
              "
            >
              •••
            </span>
          ) : isPlaying ? (
            <Pause
              size={17}
              fill="currentColor"
            />
          ) : (
            <Play
              size={17}
              fill="currentColor"
              className="ml-0.5"
            />
          )}
        </button>

        {/* Next */}
        <button
          type="button"
          disabled={!ready}
          className={`
            p-1.5
            md:p-2

            text-white/90

            rounded-full

            hover:bg-white/20
            hover:text-white
            active:scale-90

            transition-all
            duration-200

            ${disabledClass}
          `}
          aria-label="Next track"
          title={
            ready
              ? "Next"
              : "Waiting for music..."
          }
          onClick={() => {
            if (ready) {
              advanceTrack(1);
            }
          }}
        >
          <SkipForward
            size={15}
            className="md:w-4 md:h-4"
            fill="currentColor"
          />
        </button>

        {/* Volume */}
        <div
          className={`
            relative
            ${!ready ? "opacity-40" : ""}
          `}
          onMouseEnter={() => {
            if (ready) {
              setShowVolume(true);
            }
          }}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button
            type="button"
            disabled={!ready}
            className={`
              p-1.5
              md:p-2

              text-white/90

              rounded-full

              hover:bg-white/20
              hover:text-white
              active:scale-90

              transition-all
              duration-200

              ${disabledClass}
            `}
            onClick={() => {
              if (ready) {
                toggleMute();
              }
            }}
            title={
              ready
                ? "Volume"
                : "Waiting for music..."
            }
            aria-label="Toggle mute"
          >
            {muted || volume === 0 ? (
              <VolumeX
                size={15}
                className="md:w-4 md:h-4"
              />
            ) : (
              <Volume2
                size={15}
                className="md:w-4 md:h-4"
              />
            )}
          </button>

          {/* Volume Slider */}
          {showVolume && ready && (
            <div
              className="
                absolute
                bottom-[130%]
                left-1/2
                -translate-x-1/2
                -rotate-90
                origin-center

                bg-black/60
                backdrop-blur-xl

                border
                border-white/20

                px-3
                py-2

                rounded-full

                shadow-[0_10px_25px_rgba(0,0,0,0.5)]

                whitespace-nowrap
              "
            >
              <input
                type="range"
                min={0}
                max={100}
                aria-label="Volume slider"
                value={muted ? 0 : volume}
                onChange={(e) =>
                  handleVolumeChange(
                    Number(e.target.value)
                  )
                }
                className="w-20 cursor-pointer accent-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}