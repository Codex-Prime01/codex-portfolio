import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SWITCH, ease, prefersReducedMotion } from "@/lib/motion";

/**
 * Code chips drifting around the laptop, in two depths.
 *
 * - The whole layer slides against the cursor (parallax): the back layer
 *   moves the opposite way to the front, which reads as depth.
 * - Each chip is pushed away when the cursor comes near, like a force field.
 * - When `switchKey` changes, every chip implodes into the centre, swaps to
 *   the new `labels`, then bursts back out to a fresh spot.
 *
 * Positions are written straight to the DOM each frame; React only renders
 * the labels.
 */

type Spot = { top: number; left: number; size: number; opacity: number };
type Layer = "back" | "front";

/** Hand-placed so the chips frame the laptop without sitting on the headline. */
const SPOTS: Record<Layer, Spot[]> = {
  back: [
    { top: 16, left: 40, size: 0.75, opacity: 0.4 },
    { top: 52, left: 57, size: 0.7, opacity: 0.35 },
    { top: 80, left: 36, size: 0.72, opacity: 0.4 },
    { top: 26, left: 70, size: 0.68, opacity: 0.3 },
  ],
  // Kept between the headline and the cards, so they never cover text you need to read.
  front: [
    { top: 26, left: 32, size: 1.05, opacity: 0.95 },
    { top: 68, left: 40, size: 0.9, opacity: 0.9 },
    { top: 40, left: 58, size: 1.1, opacity: 0.95 },
    { top: 13, left: 49, size: 0.95, opacity: 0.85 },
    { top: 84, left: 56, size: 1, opacity: 0.9 },
    { top: 58, left: 62, size: 1, opacity: 0.9 },
  ],
};

/** Phones: the box is just the laptop, so chips stay in its corners, off the screen. */
const PHONE_SPOTS: Record<Layer, Spot[]> = {
  back: [
    { top: 6, left: 6, size: 0.72, opacity: 0.4 },
    { top: 78, left: 80, size: 0.72, opacity: 0.4 },
  ],
  front: [
    { top: 4, left: 68, size: 0.85, opacity: 0.9 },
    { top: 86, left: 8, size: 0.85, opacity: 0.9 },
  ],
};

const PARALLAX = { back: -30, front: 60 };
const REPEL = { radius: 260, strength: 70 };
const DURATIONS = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10];

interface FloatingChipsProps {
  layer: Layer;
  labels: string[];
  switchKey: number;
  /** Use the small phone layout. */
  phone?: boolean;
  className?: string;
}

export function FloatingChips({ layer, labels, switchKey, phone = false, className }: FloatingChipsProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const spots = (phone ? PHONE_SPOTS : SPOTS)[layer];
  // Back chips start further along the label list so the two layers differ.
  const offset = layer === "back" ? 6 : 0;
  const [shown, setShown] = useState(labels);
  const pending = useRef<{ start: number; labels: string[]; swapped: boolean } | null>(null);
  const firstKey = useRef(switchKey);

  useEffect(() => {
    if (switchKey === firstKey.current) return;
    if (prefersReducedMotion()) {
      setShown(labels);
      return;
    }
    pending.current = { start: performance.now(), labels, swapped: false };
    // Only a new switchKey starts a switch; label edits alone don't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchKey]);

  useEffect(() => {
    const host = layerRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const state = spots.map((_, i) => ({
      rx: 0,
      ry: 0,
      baseX: 0,
      baseY: 0,
      fromX: 0,
      fromY: 0,
      nextX: 0,
      nextY: 0,
      phase: i * 0.7,
      dur: DURATIONS[i % DURATIONS.length],
    }));

    const mouse = { x: 0, y: 0, px: -9999, py: -9999 };
    const smooth = { x: 0, y: 0 };
    const onMove = (event: PointerEvent) => {
      mouse.x = event.clientX / window.innerWidth - 0.5;
      mouse.y = event.clientY / window.innerHeight - 0.5;
      mouse.px = event.clientX;
      mouse.py = event.clientY;
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const time = now / 1000;
      smooth.x += (mouse.x - smooth.x) * 0.05;
      smooth.y += (mouse.y - smooth.y) * 0.05;
      host.style.transform = `translate3d(${smooth.x * PARALLAX[layer]}px, ${smooth.y * PARALLAX[layer]}px, 0)`;

      const sw = pending.current;
      const elapsed = sw ? now - sw.start : 0;
      if (sw && !sw.swapped && elapsed >= SWITCH.in) {
        sw.swapped = true;
        setShown(sw.labels);
        state.forEach((s) => {
          s.nextX = (Math.random() - 0.5) * 120;
          s.nextY = (Math.random() - 0.5) * 120;
        });
      }

      chipRefs.current.forEach((chip, i) => {
        if (!chip || !chip.offsetWidth) return;
        const s = state[i];
        const floatY = reduced ? 0 : Math.sin(((time + s.phase) * Math.PI * 2) / s.dur) * 12;
        const tilt = reduced ? 0 : Math.cos(((time + s.phase) * Math.PI * 2) / s.dur) * 5;

        if (sw) {
          // Implode toward the stage centre, hold, then burst out somewhere new.
          const cx = host.clientWidth / 2 - chip.offsetLeft - chip.offsetWidth / 2;
          const cy = host.clientHeight / 2 - chip.offsetTop - chip.offsetHeight / 2;
          // No fading: chips shrink to nothing and grow back out, so nothing pops.
          let x: number, y: number, scale: number;
          if (elapsed < SWITCH.in) {
            const t = ease.inQuad(elapsed / SWITCH.in);
            x = s.baseX + s.rx + (cx - s.baseX - s.rx) * t;
            y = s.baseY + s.ry + (cy - s.baseY - s.ry) * t;
            scale = 1 - t;
          } else if (elapsed < SWITCH.in + SWITCH.hold) {
            x = cx;
            y = cy;
            scale = 0;
          } else {
            const t = Math.min(1, (elapsed - SWITCH.in - SWITCH.hold) / SWITCH.out);
            const e = ease.spring(t);
            x = cx + (s.nextX - cx) * e;
            y = cy + (s.nextY - cy) * e;
            scale = e;
          }
          chip.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg) scale(${scale})`;
          chip.style.opacity = String(spots[i].opacity);
          return;
        }

        // Push away from a nearby cursor, easing in and out.
        let targetRx = 0;
        let targetRy = 0;
        if (fine) {
          const rect = chip.getBoundingClientRect();
          const dx = mouse.px - (rect.left + rect.width / 2);
          const dy = mouse.py - (rect.top + rect.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < REPEL.radius) {
            const force = (REPEL.radius - distance) / REPEL.radius;
            targetRx = (dx / distance) * force * -REPEL.strength;
            targetRy = (dy / distance) * force * -REPEL.strength;
          }
        }
        s.rx += (targetRx - s.rx) * 0.1;
        s.ry += (targetRy - s.ry) * 0.1;
        const push = s.rx * 0.15;
        chip.style.transform = `translate3d(${s.baseX + s.rx}px, ${s.baseY + s.ry + floatY}px, 0) rotate(${tilt + push}deg)`;
        chip.style.opacity = String(spots[i].opacity);
      });

      if (sw && elapsed >= SWITCH.in + SWITCH.hold + SWITCH.out) {
        state.forEach((s) => {
          s.baseX = s.nextX;
          s.baseY = s.nextY;
          s.rx = 0;
          s.ry = 0;
        });
        pending.current = null;
      }
    };

    const start = () => {
      if (!raf && document.visibilityState === "visible") raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
    };
  }, [layer, spots]);

  return (
    <div ref={layerRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {spots.map((spot, i) => (
        <span
          key={i}
          ref={(node) => (chipRefs.current[i] = node)}
          className={cn(
            "chip px-3 py-1.5",
            layer === "front" ? "glass text-paper" : "border border-line text-paper/70 blur-[1px]",
          )}
          style={{
            top: `${spot.top}%`,
            left: `${spot.left}%`,
            fontSize: `${spot.size * (layer === "front" ? 0.95 : 0.8)}rem`,
            opacity: spot.opacity,
          }}
        >
          {shown[(i + offset) % shown.length]}
        </span>
      ))}
    </div>
  );
}
