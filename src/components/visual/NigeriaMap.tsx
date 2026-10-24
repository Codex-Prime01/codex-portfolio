import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";
import { MAP, PLACES, ROUTE, insideNigeria } from "@/data/nigeria";

/**
 * A halftone map of Nigeria with the story's route traced across it.
 *
 * Three layers:
 * 1. A canvas of dots — every lattice point inside the border, baked once.
 *    Under the cursor the dots in its row and column square up into a
 *    chequer, like a reticle taking a reading.
 * 2. An SVG with the grid, the route and the place markers. The route draws
 *    itself once, when the map comes into view, and lights each place as its
 *    head passes.
 * 3. HTML labels, so the type stays readable at any size.
 */

const PITCH = 14;
const DOT_R = 2.1;
const ROUTE_MS = 3200;
/** Reticle arms, in map units, and the bloom where they cross. */
const ARM = 300;
const CORE = 46;
const THRESHOLD = 0.3;

interface Dot {
  x: number;
  y: number;
  col: number;
  row: number;
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function NigeriaMap({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const [progress, setProgress] = useState(0);
  const [routeDone, setRouteDone] = useState(false);
  const [length, setLength] = useState(0);
  const [stops, setStops] = useState<number[]>([]);

  // Every lattice point inside the border, plus a grid index for O(1) lookups.
  const dots = useMemo(() => {
    const list: Dot[] = [];
    const cols = Math.floor(MAP.width / PITCH);
    const rows = Math.floor(MAP.height / PITCH);
    const index = new Int32Array(cols * rows).fill(-1);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = PITCH / 2 + col * PITCH;
        const y = PITCH / 2 + row * PITCH;
        if (insideNigeria(x, y)) {
          index[row * cols + col] = list.length;
          list.push({ x, y, col, row });
        }
      }
    }
    return { list, index, cols, rows };
  }, []);

  // Measure the route, and where along it each place sits.
  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setLength(total);
    // Walk the path and find the nearest sample to each place.
    const samples = 400;
    const found = PLACES.map((place) => {
      let best = 0;
      let bestDistance = Infinity;
      for (let i = 0; i <= samples; i += 1) {
        const point = path.getPointAtLength((total * i) / samples);
        const d = Math.hypot(point.x - place.x, point.y - place.y);
        if (d < bestDistance) {
          bestDistance = d;
          best = (total * i) / samples;
        }
      }
      return best;
    });
    setStops(found);
  }, []);

  // Draw the route once, when most of the map is on screen.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !length) return;
    if (prefersReducedMotion()) {
      setProgress(1);
      setRouteDone(true);
      return;
    }
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / ROUTE_MS);
          setProgress(easeInOutSine(t));
          if (t < 1) raf = requestAnimationFrame(tick);
          else setRouteDone(true);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [length]);

  // Keep the glowing head on the tip of the route.
  useEffect(() => {
    const path = routeRef.current;
    const head = headRef.current;
    if (!path || !head || !length) return;
    const point = path.getPointAtLength(length * progress);
    head.setAttribute("transform", `translate(${point.x} ${point.y})`);
  }, [progress, length]);

  // The halftone and the reticle.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const baked = document.createElement("canvas");
    let scale = 1;
    const pointer = { x: 0, y: 0, on: false };
    let heat = 0;
    let raf = 0;

    const bake = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      if (!width) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(width * (MAP.height / MAP.width) * ratio);
      baked.width = canvas.width;
      baked.height = canvas.height;
      scale = canvas.width / MAP.width;
      const bctx = baked.getContext("2d");
      if (!bctx) return;
      bctx.setTransform(scale, 0, 0, scale, 0, 0);
      bctx.fillStyle = "rgba(243, 241, 234, 0.32)";
      bctx.beginPath();
      for (const dot of dots.list) {
        bctx.moveTo(dot.x + DOT_R, dot.y);
        bctx.arc(dot.x, dot.y, DOT_R, 0, Math.PI * 2);
      }
      bctx.fill();
      draw();
    };

    const draw = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(baked, 0, 0);
      if (heat < 0.01) return;

      context.setTransform(scale, 0, 0, scale, 0, 0);
      const pc = Math.round((pointer.x - PITCH / 2) / PITCH);
      const pr = Math.round((pointer.y - PITCH / 2) / PITCH);
      const lit: [Dot, number][] = [];
      const consider = (col: number, row: number, level: number) => {
        if (col < 0 || row < 0 || col >= dots.cols || row >= dots.rows || level < THRESHOLD) return;
        const i = dots.index[row * dots.cols + col];
        if (i >= 0) lit.push([dots.list[i], level]);
      };
      // Arms along the pointer's own row and column, fading linearly.
      const span = Math.ceil(ARM / PITCH);
      for (let k = -span; k <= span; k += 1) {
        const level = (1 - Math.abs(k * PITCH) / ARM) * 0.85 * heat;
        consider(pc + k, pr, level);
        if (k !== 0) consider(pc, pr + k, level);
      }
      // A round bloom at the crossing.
      const core = Math.ceil(CORE / PITCH);
      for (let r = -core; r <= core; r += 1) {
        for (let c = -core; c <= core; c += 1) {
          const d = Math.hypot(c * PITCH, r * PITCH) / CORE;
          if (d < 1 && (r !== 0 && c !== 0)) consider(pc + c, pr + r, (1 - d) * (1 - d) * heat);
        }
      }
      // Clear the lit dots, then lay the chequer: only one parity fills.
      for (const [dot] of lit) context.clearRect(dot.x - PITCH / 2, dot.y - PITCH / 2, PITCH, PITCH);
      for (const [dot, level] of lit) {
        if ((dot.col + dot.row) & 1) continue;
        const t = Math.min(1, (level - THRESHOLD) / (1 - THRESHOLD));
        const side = PITCH * (0.7 + 0.3 * t);
        context.fillStyle = level > 0.75 ? "#f3f1ea" : level > 0.5 ? "#ff6a3d" : "#ff3b1d";
        context.fillRect(dot.x - side / 2, dot.y - side / 2, side, side);
      }
    };

    const loop = () => {
      heat += ((pointer.on ? 1 : 0) - heat) * 0.18;
      draw();
      if (pointer.on || heat > 0.01) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const armed = routeDone && fine && !prefersReducedMotion();
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * MAP.width;
      const y = ((event.clientY - rect.top) / rect.height) * MAP.height;
      pointer.on = x >= 0 && y >= 0 && x <= MAP.width && y <= MAP.height;
      pointer.x = x;
      pointer.y = y;
      wake();
    };
    const leave = () => {
      pointer.on = false;
      wake();
    };

    bake();
    const observer = new ResizeObserver(bake);
    observer.observe(canvas);
    if (armed) {
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerleave", leave);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [dots, routeDone]);

  const travelled = length * progress;

  return (
    <div ref={frameRef} className={cn("relative", className)} style={{ aspectRatio: `${MAP.width} / ${MAP.height}` }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full", routeDone && "cursor-crosshair")}
      />

      <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Survey axes through Biu, crawling slowly */}
        <g stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="10 8" className="map-crawl">
          <line x1={PLACES[2].x} y1={-200} x2={PLACES[2].x} y2={MAP.height + 200} />
          <line x1={-200} y1={PLACES[2].y} x2={MAP.width + 200} y2={PLACES[2].y} />
          <line x1={PLACES[0].x} y1={-200} x2={PLACES[0].x} y2={MAP.height + 200} />
        </g>
        <g fill="none" stroke="var(--line-strong)">
          <circle cx={PLACES[2].x} cy={PLACES[2].y} r="46" />
          <circle cx={PLACES[2].x} cy={PLACES[2].y} r="190" stroke="var(--line)" />
        </g>
        {/* "You are here": a slow ping on Biu */}
        <circle
          cx={PLACES[2].x}
          cy={PLACES[2].y}
          r="12"
          fill="none"
          stroke="var(--ember)"
          strokeWidth="2"
          className="map-ping"
        />

        {/* The route: a dim full line, the travelled part over it */}
        <path d={ROUTE} fill="none" stroke="rgba(243,241,234,0.12)" strokeWidth="2" strokeDasharray="4 6" />
        <path
          ref={routeRef}
          d={ROUTE}
          fill="none"
          stroke="var(--ember)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={length ? `${length} ${length}` : undefined}
          strokeDashoffset={length ? length - travelled : undefined}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,59,29,0.7))" }}
        />
        <g ref={headRef} style={{ opacity: progress > 0 && progress < 1 ? 1 : 0, transition: "opacity 0.4s" }}>
          <circle r="16" fill="rgba(255,106,61,0.25)" />
          <circle r="5" fill="#f3f1ea" />
        </g>

        {PLACES.map((place, i) => {
          const reached = stops.length > 0 && travelled >= stops[i] - 2;
          return (
            <g key={place.id} transform={`translate(${place.x} ${place.y})`}>
              <rect
                x="-7"
                y="-7"
                width="14"
                height="14"
                transform="rotate(45)"
                fill={reached ? "var(--ember)" : "var(--ink)"}
                stroke={reached ? "var(--ember)" : "var(--paper)"}
                strokeWidth="2"
                style={{ transition: "fill 0.4s, stroke 0.4s" }}
              />
              {reached && <circle r="10" fill="none" stroke="var(--ember-2)" strokeWidth="2" className="map-flare" />}
            </g>
          );
        })}
      </svg>

      {/* Labels in HTML, so they stay a readable size at any width */}
      {PLACES.map((place, i) => {
        const reached = stops.length > 0 && travelled >= stops[i] - 2;
        const position =
          place.id === "oyo"
            ? "translate(14px, calc(-100% - 6px))"
            : place.id === "ibadan"
              ? "translate(14px, 8px)"
              : "translate(calc(-100% - 18px), -50%)";
        return (
          <div
            key={place.id}
            className={cn(
              "pointer-events-none absolute w-max max-w-[11rem] transition-[opacity,transform] duration-700 ease-out [text-shadow:0_0_6px_var(--ink),0_0_12px_var(--ink)] sm:max-w-[15rem]",
              place.side === "left" && "text-right",
            )}
            style={{
              left: `${(place.x / MAP.width) * 100}%`,
              top: `${(place.y / MAP.height) * 100}%`,
              transform: position,
              opacity: reached ? 1 : 0.25,
            }}
          >
            <p className="font-display text-xl uppercase leading-none text-paper sm:text-2xl">{place.name}</p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-wider text-ember-2 sm:text-[0.65rem]">{place.when}</p>
            <p className="mt-1 hidden text-xs leading-snug text-paper/70 sm:block">{place.note}</p>
          </div>
        );
      })}
    </div>
  );
}
