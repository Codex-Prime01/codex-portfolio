import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { cssVar, useTheme } from "@/lib/theme";

/**
 * A seam between two blocks: the surface above carries into the block below
 * as solid rows, breaks into a chequerboard and burns away as you scroll.
 *
 * The pattern is scrubbed straight from scroll position — no timeline — so it
 * moves exactly as fast as the reader does. Which squares survive is decided
 * by a fixed per-cell hash, so the pattern is stable and never flickers.
 */

const SOLID_UNTIL = 0.16;
const LIFT = 1.15;
const ACCENT_SHARE = 0.07;

const hash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

/** Colours are token names ("--ink-2"), so the seam follows the theme. */
export function ChequerSeam({ carry = "--ink", accent = "--ember-2" }: { carry?: string; accent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (prefersReducedMotion()) {
      canvas.style.display = "none";
      return;
    }

    let frame = 0;
    let lastProgress = -1;
    const carryColor = cssVar(carry);
    const accentColor = cssVar(accent);

    const render = (progress: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
      if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const cell = width < 640 ? 16 : 24;
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const lift = progress * LIFT;

      for (let y = 0; y < rows; y += 1) {
        const depth = y / Math.max(1, rows - 1) + lift;
        if (depth > 1) break;
        const solid = depth <= SOLID_UNTIL;
        const fade = Math.min(1, Math.max(0, 1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL)));
        if (!solid && fade <= 0) break;
        for (let x = 0; x < columns; x += 1) {
          if (!solid) {
            if ((x + y) % 2 !== 0) continue;
            if (hash(x, y) > fade) continue;
          }
          context.fillStyle = !solid && hash(x + 101, y + 57) < ACCENT_SHARE ? accentColor : carryColor;
          context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    };

    // 0 while the seam's top is at the fold, 1 once it reaches the top of the screen.
    const update = () => {
      const rect = canvas.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, 1 - rect.top / view));
      if (Math.abs(progress - lastProgress) < 0.002) return;
      lastProgress = progress;
      render(progress);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      lastProgress = -1;
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // theme: the tokens resolve to new colours after a switch.
  }, [carry, accent, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[18svh] w-full sm:h-[32svh]"
    />
  );
}
