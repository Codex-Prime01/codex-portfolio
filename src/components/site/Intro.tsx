import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { PROFILE } from "@/data/profile";

/**
 * The opening veil.
 *
 * The meter is honest about what it waits for: it creeps toward 70% while
 * the display fonts load, and only completes once they have — so the hero
 * never flashes in a fallback face. A short minimum keeps it from blinking,
 * a hard backstop means it can never hold the page hostage, and it plays
 * once per visit. Any click or key skips it.
 */

const SESSION_KEY = "cp-intro-seen";
const MIN_MS = 1100;
const MAX_MS = 3500;
const CLEAR_MS = 380;
const LIFT_MS = 900;

type Phase = "loading" | "clearing" | "lifting" | "done";

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Storage blocked (private mode, strict settings): just play it.
    return false;
  }
};

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>(() => (alreadySeen() || prefersReducedMotion() ? "done" : "loading"));
  const meterRef = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Skipped outright: hand over on the first effect.
  useEffect(() => {
    if (phase === "done") doneRef.current();
    // Only on mount — later "done" transitions call onDone themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";

    const began = performance.now();
    let progress = 0;
    let frame = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* storage blocked — the intro will simply play again next visit */
      }
      setPhase("clearing");
    };

    document.fonts?.ready
      .then(() => {
        ready.current = true;
      })
      .catch(() => {
        // Fonts failed: the page still works in the fallback face.
        ready.current = true;
      });
    if (!document.fonts) ready.current = true;

    const tick = (now: number) => {
      const elapsed = now - began;
      const canFinish = ready.current && elapsed > MIN_MS;
      const target = canFinish ? 1 : 0.7;
      progress += (target - progress) * (canFinish ? 0.14 : 0.03);
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${progress})`;
      if ((canFinish && progress > 0.995) || elapsed > MAX_MS) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // The backstop runs on its own timer, not inside the frame loop: a
    // throttled or background tab can starve requestAnimationFrame entirely.
    const backstop = window.setTimeout(finish, MAX_MS);

    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      window.clearTimeout(backstop);
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "clearing") {
      const timer = window.setTimeout(() => {
        setPhase("lifting");
        // The page's own entrance starts as the veil begins to lift.
        doneRef.current();
      }, CLEAR_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "lifting") {
      document.documentElement.style.overflow = "";
      const timer = window.setTimeout(() => setPhase("done"), LIFT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  // Whatever happens, never leave the page locked.
  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  if (phase === "done") return null;

  const clearing = phase !== "loading";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={clearing ? "Loaded" : `Loading ${PROFILE.brand}`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      style={{
        transform: phase === "lifting" ? "translate3d(0,-100%,0)" : "none",
        transition: `transform ${LIFT_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
      }}
    >
      <div
        className="flex flex-col items-center gap-6"
        style={{
          opacity: clearing ? 0 : 1,
          transform: clearing ? "translate3d(0,-0.75rem,0)" : "none",
          transition: `opacity ${CLEAR_MS}ms ease, transform ${CLEAR_MS}ms var(--ease-out)`,
        }}
      >
        <div className="relative px-6 py-4">
          <Corners />
          <p className="display text-[clamp(2.5rem,12vw,4.5rem)] text-paper" aria-hidden="true">
            {[..."CODEX PRIME"].map((char, i) => (
              <span
                key={i}
                className="inline-block animate-[intro-rise_0.8s_var(--ease-out)_both]"
                style={{ animationDelay: `${120 + i * 45}ms` }}
              >
                {char === " " ? " " : char}
              </span>
            ))}
          </p>
        </div>
        <p className="label animate-[intro-rise_0.8s_var(--ease-out)_both] [animation-delay:600ms]">
          {PROFILE.name} — {PROFILE.role}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
        <div ref={meterRef} className="h-full origin-left scale-x-0 bg-ember" />
      </div>
      <p className="label absolute bottom-5 right-[var(--gutter)] hidden sm:block">Click or press any key to skip</p>

      <style>{`@keyframes intro-rise { from { opacity: 0; transform: translateY(0.35em); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

/** Four corner brackets — the same mark used on panels across the site. */
export function Corners({ className = "text-ember", size = 12 }: { className?: string; size?: number }) {
  const path = "M0 0.75H11.25V12";
  const corners = [
    "right-0 top-0",
    "left-0 top-0 -scale-x-100",
    "bottom-0 left-0 -scale-100",
    "bottom-0 right-0 -scale-y-100",
  ];
  return (
    <>
      {corners.map((position) => (
        <svg
          key={position}
          aria-hidden="true"
          viewBox="0 0 12 12"
          width={size}
          height={size}
          className={`pointer-events-none absolute ${position} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d={path} />
        </svg>
      ))}
    </>
  );
}
