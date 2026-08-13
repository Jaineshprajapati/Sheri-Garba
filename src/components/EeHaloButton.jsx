import React from "react";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export function EeHaloButton() {
    const triggerConfettiBomb = () => {
        const count = 120;
        const colors = ["#e63946", "#ffb703", "#fb8500", "#06d6a0", "#fdf6ee", "#d9825b"];

        const defaults = {
            origin: { y: 0.95 },
            colors: colors,
            ticks: 350,
            gravity: 0.8,
            decay: 0.94,
            startVelocity: 65,
            scalar: 1.2,
        };

        // Left corner cannon explosion
        confetti({
            ...defaults,
            particleCount: count,
            angle: 60,
            origin: { x: 0.02, y: 0.95 },
        });

        // Right corner cannon explosion
        confetti({
            ...defaults,
            particleCount: count,
            angle: 120,
            origin: { x: 0.98, y: 0.95 },
        });

        // Secondary delayed burst for extra slow impact
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: Math.floor(count * 0.7),
                angle: 65,
                startVelocity: 55,
                origin: { x: 0.05, y: 0.95 },
            });
            confetti({
                ...defaults,
                particleCount: Math.floor(count * 0.7),
                angle: 115,
                startVelocity: 55,
                origin: { x: 0.95, y: 0.95 },
            });
        }, 180);
    };

    return (
        <button
            type="button"
            onClick={triggerConfettiBomb}
            className="
      fixed

      left-0
      top-1/2
      -translate-y-1/2

      z-30

      w-9
      h-12
      md:w-10
      md:h-14

      flex
      items-center
      justify-center

      rounded-r-full

      bg-black/25
      backdrop-blur-md

      border
      border-l-0
      border-white/15

      text-[#fdf6ee]

      hover:bg-black/40
      hover:w-11

      active:scale-90

      transition-all
      duration-200

      cursor-pointer
      select-none

      shadow-[0_4px_20px_rgba(0,0,0,0.15)]
    "
            aria-label="Play celebration sound"
            title="Play"
        >
            <Sparkles
                size={17}
                strokeWidth={1.8}
            />
        </button>
    );
}