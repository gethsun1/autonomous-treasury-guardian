"use client";

import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

export default function ATGParticles() {
  const init = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="atgParticles"
      init={init}
      options={{
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
          number: { value: 60 }, // Increased slightly for "Moderate" feel
          color: { value: "#00f5ff" },
          opacity: { value: 0.12 },
          size: { value: 2 },
          links: { enable: true, opacity: 0.1, color: "#00eaff", distance: 150 },
          move: { enable: true, speed: 0.6 },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.2,
              },
            },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 -z-10"
    />
  );
}

