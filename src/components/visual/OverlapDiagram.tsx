import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useInView, useReducedMotion } from "@/lib/motion";

/**
 * An illustration of SABAGeo's core check: a newly submitted plot is tested
 * against a registered one, and the shared ground is flagged.
 *
 * The overlap is not computed — it falls out of SVG clipping. The new plot's
 * hatch is drawn inside a clip shaped like the registered plot, so only the
 * intersection shows, wherever the new plot happens to be.
 */

const REGISTERED = "M120 110 L330 82 L372 250 L168 300 Z";
const SUBMITTED = "M290 170 L470 150 L492 318 L312 344 Z";
/** Where the new plot starts before it is "submitted". */
const OFFSET = { x: 120, y: 58 };
const SLIDE_MS = 1400;

export function OverlapDiagram({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { rootMargin: "0px 0px -25% 0px" });
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [flagged, setFlagged] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setPlaced(true);
      setFlagged(true);
      return;
    }
    setPlaced(false);
    setFlagged(false);
    const place = window.setTimeout(() => setPlaced(true), 250);
    const flag = window.setTimeout(() => setFlagged(true), 250 + SLIDE_MS);
    return () => {
      window.clearTimeout(place);
      window.clearTimeout(flag);
    };
  }, [inView, reduced, run]);

  const slide = {
    transform: placed ? "translate(0px, 0px)" : `translate(${OFFSET.x}px, ${OFFSET.y}px)`,
    transition: placed ? `transform ${SLIDE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)` : "none",
  };

  return (
    <figure ref={ref} className={cn("relative", className)}>
      <svg viewBox="0 0 600 420" className="h-auto w-full" role="img" aria-labelledby="overlap-title overlap-desc">
        <title id="overlap-title">Illustration of an overlap check</title>
        <desc id="overlap-desc">
          A newly submitted land plot moves onto a registered plot. The area they share is hatched and flagged as an
          overlap.
        </desc>
        <defs>
          <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="9" height="9" fill="rgba(255,59,29,0.18)" />
            <line x1="0" y1="0" x2="0" y2="9" stroke="var(--ember)" strokeWidth="2.5" />
          </pattern>
          <clipPath id="registered-clip">
            <path d={REGISTERED} />
          </clipPath>
        </defs>

        {/* Survey grid */}
        <g stroke="var(--line)" strokeWidth="1">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="420" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} />
          ))}
        </g>
        <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--dim)" letterSpacing="1">
          <text x="10" y="20">UTM GRID · ILLUSTRATION</text>
          <text x="10" y="410">E →</text>
          <text x="560" y="20">N ↑</text>
        </g>

        {/* Registered plot, with beacons at its corners */}
        <path d={REGISTERED} fill="rgba(243,241,234,0.04)" stroke="var(--paper)" strokeWidth="1.5" />
        {[
          [120, 110],
          [330, 82],
          [372, 250],
          [168, 300],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="var(--ink)" stroke="var(--paper)" />
        ))}
        <text x="140" y="140" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--paper)" letterSpacing="1">
          REGISTERED PLOT
        </text>

        {/* Submitted plot */}
        <g style={slide}>
          <path d={SUBMITTED} fill="none" stroke="var(--ember-2)" strokeWidth="1.5" strokeDasharray="7 5" />
          <text x="372" y="330" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--ember-2)" letterSpacing="1">
            NEW SUBMISSION
          </text>
        </g>

        {/* The overlap: the submitted plot's hatch, clipped to the registered plot */}
        <g clipPath="url(#registered-clip)">
          <g style={slide}>
            <path
              d={SUBMITTED}
              fill="url(#hatch)"
              style={{ opacity: flagged ? 1 : 0, transition: "opacity 400ms ease" }}
            />
          </g>
        </g>
      </svg>

      {/* The verdict */}
      <div
        className="absolute right-3 top-3 flex items-center gap-2 border border-ember bg-ink px-3 py-2 font-mono text-[0.65rem] uppercase tracking-widest text-ember sm:right-5 sm:top-5"
        style={{
          opacity: flagged ? 1 : 0,
          transform: flagged ? "none" : "translateY(-0.5rem)",
          transition: "opacity 400ms ease, transform 600ms var(--ease-out)",
        }}
        aria-live="polite"
      >
        <span className="h-1.5 w-1.5 animate-pulse bg-ember" aria-hidden="true" />
        {flagged ? "Overlap detected" : ""}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="label">Illustration — how a submitted plot is checked against registered ones</span>
        {!reduced && (
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="label flex items-center gap-2 border border-line px-3 py-2 text-paper transition-colors hover:border-ember hover:text-ember"
          >
            ↻ Run the check again
          </button>
        )}
      </figcaption>
    </figure>
  );
}
