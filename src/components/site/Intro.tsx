import { forwardRef, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { PROFILE } from "@/data/profile";
import { useEmber } from "@/components/site/EmberBlock";

/**
 * The opening: the ember block types the hook, then becomes the page change.
 *
 * 1. On a dark veil, the block works as a cursor and types "From database to deploy."
 * 2. Once that's done (and the fonts have loaded), the cursor grows until it
 *    covers the screen. The veil is removed underneath it.
 * 3. The block collapses into the active nav item, uncovering the page.
 *
 * Plays once per visit. Any click or key skips straight to step 2, and a
 * hard backstop means it can never hold the page hostage.
 */

const SESSION_KEY = "cp-intro-seen";
const HOOK = "From database to deploy.";
const CHAR_MS = 42;
const PAUSE_MS = 380; // a beat to read the line before the block takes over
const MAX_MS = 4000;

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Storage blocked (private mode, strict settings): just play it.
    return false;
  }
};

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"typing" | "leaving" | "done">(() =>
    alreadySeen() || prefersReducedMotion() ? "done" : "typing",
  );
  const [typed, setTyped] = useState(0);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const { run } = useEmber();
  const runRef = useRef(run);
  runRef.current = run;

  // Skipped outright: hand over on the first effect.
  useEffect(() => {
    if (phase === "done") doneRef.current();
    // Only on mount — the "leaving" path calls onDone itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    const html = document.documentElement;
    html.style.overflow = "hidden";

    const began = performance.now();
    let left = false;
    let fontsReady = !document.fonts;
    document.fonts?.ready
      .then(() => (fontsReady = true))
      // Fonts failed: the page still works in the fallback face.
      .catch(() => (fontsReady = true));

    const leave = () => {
      if (left) return;
      left = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* storage blocked — the intro will simply play again next visit */
      }
      setTyped(HOOK.length);
      setPhase("leaving");
      const rect = cursorRef.current?.getBoundingClientRect();
      const from = rect
        ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2, w: 16, h: 16 };
      void runRef.current(from, () => {
        html.style.overflow = "";
        setPhase("done");
        doneRef.current();
      });
    };

    // Typing runs on a timer, not animation frames: a throttled tab still gets through.
    const typing = window.setInterval(() => {
      const elapsed = performance.now() - began;
      const count = Math.min(HOOK.length, Math.floor(elapsed / CHAR_MS));
      setTyped(count);
      if (count === HOOK.length && fontsReady && elapsed > HOOK.length * CHAR_MS + PAUSE_MS) leave();
    }, 30);
    const backstop = window.setTimeout(leave, MAX_MS);

    const skip = () => leave();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      window.clearInterval(typing);
      window.clearTimeout(backstop);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase]);

  // Whatever happens, never leave the page locked.
  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${PROFILE.brand}`}
      className="fixed inset-0 z-[85] flex flex-col justify-center bg-ink px-[var(--gutter)]"
    >
      <p className="label mb-6">
        <span className="text-ember">●</span> {PROFILE.name} — {PROFILE.role}
      </p>
      <p className="display max-w-[14ch] text-[clamp(3rem,10vw,9rem)] text-paper" aria-label={HOOK}>
        {/* Every letter is laid out from the start, so typing never reflows the line. */}
        {[...HOOK].map((char, i) => (
          <span key={i} aria-hidden="true" className={i < typed ? undefined : "invisible"}>
            {char === "." ? <span className="text-ember">.</span> : char}
            {i === typed - 1 && <Cursor ref={cursorRef} />}
          </span>
        ))}
        {typed === 0 && <Cursor ref={cursorRef} />}
      </p>
      <p className="label absolute bottom-5 right-[var(--gutter)] hidden sm:block">Click or press any key to skip</p>
    </div>
  );
}

/** The block, as a text cursor sitting on the baseline. */
const Cursor = forwardRef<HTMLSpanElement>(function Cursor(_, ref) {
  return <span ref={ref} aria-hidden="true" className="ml-[0.06em] inline-block h-[0.72em] w-[0.42em] bg-ember align-baseline" />;
});

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
