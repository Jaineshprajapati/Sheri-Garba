import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { YT_MUSIC_URL } from "../constants/tracks";

export function TopBar({ timeStr, online }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-[22px_28px] z-10">

      {/* Time */}
      <div className="flex items-center text-[#fdf6ee] text-xs md:text-sm font-medium px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
        {timeStr}
      </div>

      {/* Center Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
        <span className="online-dot w-[9px] h-[9px] rounded-full bg-[#3ddc71] inline-block shadow-[0_0_8px_#3ddc71]" />

        <span className="text-[#fdf6ee] text-xs md:text-sm font-medium whitespace-nowrap">
          {online} Joined in Garba Circle
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">

        {/* YouTube Music */}
        <a
          className="flex items-center gap-1.5 text-[#fdf6ee] text-xs md:text-sm font-medium px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 hover:bg-black/50 transition-colors"
          href={YT_MUSIC_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          YT Music
          <ExternalLink size={13} />
        </a>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="
            flex
            items-center
            justify-center

            w-9
            h-9

            rounded-full

            bg-black/30
            backdrop-blur-md

            border
            border-white/15

            text-[#fdf6ee]

            hover:bg-black/50
            hover:border-white/25

            active:scale-95

            transition-all

            cursor-pointer
          "
          title={
            isFullscreen
              ? "Exit fullscreen"
              : "Enter fullscreen"
          }
          aria-label={
            isFullscreen
              ? "Exit fullscreen"
              : "Enter fullscreen"
          }
        >
          {isFullscreen ? (
            <Minimize2 size={16} />
          ) : (
            <Maximize2 size={16} />
          )}
        </button>

      </div>
    </header>
  );
}