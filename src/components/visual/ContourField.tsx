import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { rgba, useTheme } from "@/lib/theme";
import { useFrameLoop, useInView, usePageVisible, useReducedMotion } from "@/lib/motion";
import { useCovered } from "@/lib/covered";

/**
 * Animated contour lines — a survey map that never sits still.
 *
 * A smooth field made of four sine waves is sampled on a grid, and marching
 * squares traces where it crosses a few fixed heights. Those crossings are
 * the contour lines. The field drifts with time, so the lines roll.
 *
 * Near the cursor the same lines are stroked a second time in the accent,
 * through a radial gradient, so they appear to light up under it.
 */

const LINE_SCALE = 3.4;
const LEVELS = 5;
const WAVE = 0.37;
const SPEED = 0.32;
/** Drawing every frame is wasted on lines this slow — 30fps is plenty. */
const FRAME_MS = 33;
const GLOW_RADIUS = 220;

const field = (x: number, y: number, t: number) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5;
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
};

interface ContourFieldProps {
  className?: string;
  /** Line opacity. The colour itself follows the theme's paper token. */
  alpha?: number;
  /** Light the lines up around the cursor. */
  interactive?: boolean;
  /** Receives the pointer as 0–1 across the canvas, or null when it leaves. */
  onPointer?: (point: { x: number; y: number } | null) => void;
}

export function ContourField({
  className,
  alpha = 0.09,
  interactive = false,
  onPointer,
}: ContourFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(canvasRef, { once: false, rootMargin: "0px" });
  const visible = usePageVisible();
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  // Resolved once per theme switch, not once per frame. `theme` isn't read
  // inside, but a switch changes what the CSS token resolves to.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const color = useMemo(() => rgba("--paper-rgb", alpha), [alpha, theme]);
  const pointer = useRef<{ x: number; y: number; on: boolean }>({ x: -9999, y: -9999, on: false });
  const glow = useRef(0);
  const last = useRef(0);
  const start = useRef(performance.now());
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Keep the backing store matched to the element, at a capped pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      setSize({ width, height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!interactive) return;
    // Only a real mouse lights the field; a finger would leave a stuck glow.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.current = { x, y, on: inside };
      onPointer?.(inside ? { x: x / rect.width, y: y / rect.height } : null);
    };
    const leave = () => {
      pointer.current.on = false;
      onPointer?.(null);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [interactive, onPointer]);

  const draw = useCallback(
    (now: number, force = false) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || !size.width) return;
      if (!force && now - last.current < FRAME_MS) return;
      last.current = now;

      const { width, height } = size;
      const ratio = canvas.width / width;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      // Fewer cells on small screens: the lines read the same, at half the cost.
      const cells = width < 768 ? 48 : 88;
      const cols = width >= height ? cells : Math.max(12, Math.round((cells * width) / height));
      const rows = Math.max(12, Math.round((cols * height) / width));
      const stepX = width / cols;
      const stepY = height / rows;
      const aspect = width / height;
      const t = reduced ? 4 : ((now - start.current) / 1000) * SPEED;

      const values = new Float32Array((cols + 1) * (rows + 1));
      for (let j = 0; j <= rows; j += 1) {
        for (let i = 0; i <= cols; i += 1) {
          const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE;
          const ny = ((j / rows) * 2 - 1) * LINE_SCALE;
          const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE;
          const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE;
          values[j * (cols + 1) + i] = field(qx, qy, t) * LEVELS;
        }
      }

      context.beginPath();
      const segment = (ax: number, ay: number, bx: number, by: number) => {
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
      };
      // Levels sit halfway between integers, so each band is cut once.
      for (let level = 0.5; level < LEVELS; level += 1) {
        for (let j = 0; j < rows; j += 1) {
          for (let i = 0; i < cols; i += 1) {
            const a = values[j * (cols + 1) + i];
            const b = values[j * (cols + 1) + i + 1];
            const c = values[(j + 1) * (cols + 1) + i + 1];
            const d = values[(j + 1) * (cols + 1) + i];
            const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (index === 0 || index === 15) continue;

            const x0 = i * stepX;
            const y0 = j * stepY;
            const tx = x0 + stepX * ((level - a) / (b - a));
            const ry = y0 + stepY * ((level - b) / (c - b));
            const bx = x0 + stepX * ((level - d) / (c - d));
            const ly = y0 + stepY * ((level - a) / (d - a));
            const right = x0 + stepX;
            const bottom = y0 + stepY;

            switch (index) {
              case 1: case 14: segment(x0, ly, bx, bottom); break;
              case 2: case 13: segment(bx, bottom, right, ry); break;
              case 3: case 12: segment(x0, ly, right, ry); break;
              case 4: case 11: segment(tx, y0, right, ry); break;
              case 6: case 9: segment(tx, y0, bx, bottom); break;
              case 7: case 8: segment(x0, ly, tx, y0); break;
              case 5: segment(x0, ly, tx, y0); segment(bx, bottom, right, ry); break;
              case 10: segment(x0, ly, bx, bottom); segment(tx, y0, right, ry); break;
            }
          }
        }
      }

      context.lineWidth = 1;
      context.strokeStyle = color;
      context.stroke();

      // Ease the glow in and out rather than snapping it on the boundary.
      const p = pointer.current;
      glow.current += ((p.on ? 1 : 0) - glow.current) * 0.12;
      if (interactive && glow.current > 0.01) {
        const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, GLOW_RADIUS);
        gradient.addColorStop(0, `rgba(255, 106, 61, ${0.95 * glow.current})`);
        gradient.addColorStop(0.45, `rgba(255, 59, 29, ${0.45 * glow.current})`);
        gradient.addColorStop(1, "rgba(255, 59, 29, 0)");
        context.lineWidth = 1.4;
        context.strokeStyle = gradient;
        context.stroke();
      }
    },
    [color, interactive, reduced, size],
  );

  // Covered by the section stacked over it: still "in view", but unseen.
  const covered = useCovered();
  const running = inView && visible && !reduced && !covered;
  useFrameLoop(draw, running);

  // When not animating (reduced motion, or first paint) still draw one frame.
  useEffect(() => {
    if (!running) draw(performance.now(), true);
  }, [running, draw]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none block h-full w-full", className)} />;
}
