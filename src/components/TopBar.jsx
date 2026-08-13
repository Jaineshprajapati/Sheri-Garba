import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Music2,
} from "lucide-react";
import { YT_MUSIC_URL } from "../constants/tracks";

export function TopBar({ timeStr }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ambient Garba Circle count
  const [onlineCount, setOnlineCount] = useState(() =>
    Math.floor(Math.random() * (48 - 12 + 1)) + 12
  );

  // Natural updates every 1–2 minutes
  useEffect(() => {
    let timer;

    const scheduleNext = () => {
      const delay = (Math.floor(Math.random() * 61) + 60) * 1000;

      timer = setTimeout(() => {
        setOnlineCount((prev) => {
          const next = prev + (Math.random() > 0.5 ? 1 : -1);
          return Math.max(12, Math.min(48, next));
        });

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timer);
  }, []);

  // Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-[22px_28px]">
      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[#fdf6ee] text-sm font-medium px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
            {timeStr}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={YT_MUSIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#fdf6ee] hover:bg-black/50 transition-colors"
              title="Open YouTube Music"
            >
              <Music2 size={18} />
            </a>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#fdf6ee] hover:bg-black/50 active:scale-95 transition-all"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 size={18} />
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
          <span className="online-dot w-[8px] h-[8px] rounded-full bg-[#3ddc71] shadow-[0_0_8px_#3ddc71]" />

          <span className="text-[#fdf6ee] text-sm font-normal whitespace-nowrap tabular-nums">
            {onlineCount} Joined in Garba Circle
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center text-[#fdf6ee] text-sm font-medium px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
          {timeStr}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
          <span className="online-dot w-[9px] h-[9px] rounded-full bg-[#3ddc71] shadow-[0_0_8px_#3ddc71]" />

          <span className="text-[#fdf6ee] text-sm font-normal whitespace-nowrap tabular-nums">
            {onlineCount} Joined in Garba Circle
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={YT_MUSIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#fdf6ee] text-sm font-medium px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 hover:bg-black/50 transition-colors"
          >
            YT Music
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#fdf6ee] hover:bg-black/50 hover:border-white/25 active:scale-95 transition-all"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 size={16} />
            ) : (
              <Maximize2 size={16} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}