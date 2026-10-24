import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "@/components/Projects";
import { ChamferLink, Arrow } from "@/components/site/ChamferLink";
import { Corners } from "@/components/site/Intro";
import { useInView } from "@/lib/motion";
import { CERTIFICATIONS, JOURNEY, PROFILE } from "@/data/profile";

/** Turns the marker makes over the whole run of the rail. */
const MARKER_TURNS = 5;
/** How long a reached year holds full strength before settling to 40%. */
const YEAR_HOLD_MS = 2200;

const Resume = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // The thread follows the middle of the screen down the rail.
  useEffect(() => {
    const rail = railRef.current;
    const thread = threadRef.current;
    const marker = markerRef.current;
    if (!rail || !thread || !marker) return;
    let frame = 0;
    const apply = () => {
      const rect = rail.getBoundingClientRect();
      const middle = window.innerHeight * 0.5;
      const progress = Math.min(1, Math.max(0, (middle - rect.top) / rect.height));
      const run = progress * rect.height;
      thread.style.transform = `scaleY(${progress})`;
      marker.style.transform = `translate3d(-50%, ${run}px, 0) rotate(${progress * 360 * MARKER_TURNS}deg)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative bg-ink py-14 sm:py-32">
      <div className="shell">
        <SectionHead index="04" title="Journey" id="journey-title" aside="Experience · Education · Certifications" />

        <div className="relative">
          {/* The rail */}
          <div
            ref={railRef}
            aria-hidden="true"
            className="absolute bottom-0 left-[0.4rem] top-0 w-px md:left-[30%]"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,var(--line-strong)_0_6px,transparent_6px_12px)]" />
            <div ref={threadRef} className="absolute inset-0 origin-top scale-y-0 bg-ember" />
            <div ref={markerRef} className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 bg-ember shadow-[0_0_24px_var(--ember)]" />
          </div>

          <ol className="group/list space-y-10 sm:space-y-24">
            {JOURNEY.map((entry) => (
              <JourneyRow key={entry.title} entry={entry} />
            ))}
          </ol>
        </div>

        {/* Certifications */}
        <div className="mt-16 sm:mt-32">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SplitText as="h3" text="Certified" by="letter" className="display block text-4xl text-paper sm:text-7xl" />
            <p className="label">freeCodeCamp · Cisco Networking Academy</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {CERTIFICATIONS.map((cert, i) => (
              <Reveal as="li" key={cert.name} delay={i * 80} className="group relative p-6">
                <Corners className="text-paper/30 transition-colors duration-500 group-hover:text-ember" />
                <p className="label">{cert.issuer}</p>
                <p className="mt-3 font-display text-2xl uppercase leading-none text-paper sm:text-3xl">{cert.name}</p>
                {"verify" in cert && cert.verify && (
                  <a
                    href={cert.verify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label mt-5 inline-flex items-center gap-2 text-ember hover:text-paper"
                  >
                    Verify certificate <Arrow direction="up-right" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="mt-12 sm:mt-20 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-center">
          <p className="max-w-md text-lg text-paper/80">The full picture, on two pages.</p>
          <ChamferLink href={PROFILE.resumeUrl} download arrow="down">
            Download résumé (PDF)
          </ChamferLink>
        </Reveal>
      </div>
    </section>
  );
};

function JourneyRow({ entry }: { entry: (typeof JOURNEY)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  // Lit once the thread (the middle of the screen) reaches it.
  const reached = useInView(ref, { rootMargin: "0px 0px -50% 0px" });
  // Once reached, the year holds full strength for a beat, then settles back.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!reached) return;
    const timer = window.setTimeout(() => setSettled(true), YEAR_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [reached]);

  return (
    <li
      ref={ref}
      // Hovering any row dims the rest — only where there is real hover.
      className="group/row relative grid gap-4 pl-10 transition-opacity duration-700 [transition-timing-function:var(--ease-plate)] md:grid-cols-[30%_1fr] md:gap-0 md:pl-0 [@media(hover:hover)]:group-hover/list:opacity-30 [@media(hover:hover)]:hover:!opacity-100"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-[0.4rem] top-3 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border transition-colors duration-500 md:left-[30%]",
          reached ? "border-ember bg-ember" : "border-line-strong bg-ink",
        )}
      />
      <div className="md:pr-12 md:text-right">
        <p
          className={cn(
            "display text-3xl transition-colors duration-700 sm:text-5xl",
            !reached ? "text-paper/25" : settled ? "text-paper/40 group-hover/row:text-paper" : "text-paper",
          )}
        >
          {entry.when}
        </p>
        <p className="label mt-2">{entry.kind}</p>
      </div>
      <Reveal className="md:pl-12">
        <h3 className="text-xl font-semibold text-paper sm:text-3xl">{entry.title}</h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ember-2">{entry.place}</p>
        {entry.points.length > 0 && (
          <ul className="mt-5 max-w-2xl space-y-2.5 leading-relaxed text-paper/70">
            {entry.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-[0.1rem] text-ember" aria-hidden="true">→</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </li>
  );
}

export default Resume;
