import React from "react";
import garbaBg from "../assets/sherigarba_bg.avif";

export function BackgroundScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      <img
        src={garbaBg}
        alt="Garba Background"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}
