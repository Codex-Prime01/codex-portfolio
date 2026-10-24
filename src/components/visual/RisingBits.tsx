import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Tiny characters drifting up the stage, the way bubbles rise in a glass.
 * Each one is a span with a CSS animation that removes itself when done.
 */

const CHARS = "01{}<>/;=$#*".split("");

export function RisingBits() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;
    // Phones get fewer, so the stage stays calm and the battery stays happy.
    const every = window.matchMedia("(max-width: 639px)").matches ? 900 : 420;
    const timers = new Set<number>();

    const spawn = () => {
      if (document.visibilityState !== "visible") return;
      const bit = document.createElement("span");
      bit.className = "rise-bit";
      bit.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
      const duration = 4 + Math.random() * 6;
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.fontSize = `${10 + Math.random() * 10}px`;
      bit.style.setProperty("--dur", `${duration}s`);
      bit.style.setProperty("--o", `${0.12 + Math.random() * 0.3}`);
      if (Math.random() < 0.25) bit.style.color = "var(--ember)";
      host.appendChild(bit);
      const timer = window.setTimeout(() => {
        bit.remove();
        timers.delete(timer);
      }, duration * 1000);
      timers.add(timer);
    };

    const interval = window.setInterval(spawn, every);
    return () => {
      window.clearInterval(interval);
      timers.forEach((timer) => window.clearTimeout(timer));
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
