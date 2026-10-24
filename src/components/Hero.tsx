import { useCallback, useRef } from "react";
import { ContourField } from "@/components/visual/ContourField";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { ChamferLink } from "@/components/site/ChamferLink";
import { Corners } from "@/components/site/Intro";
import { PROFILE, PROJECTS } from "@/data/profile";

/**
 * Nigeria's rough bounding box. The pointer readout maps the hero onto it,
 * so the contour field reads as a survey sheet of home — a nod to SABAGeo.
 */
const BOUNDS = { north: 13.9, south: 4.27, west: 2.67, east: 14.68 };

const formatCoord = (value: number, positive: string, negative: string) =>
  `${value >= 0 ? positive : negative} ${Math.abs(value).toFixed(4).padStart(7, "0")}°`;

const Hero = ({ ready }: { ready: boolean }) => {
  const readout = useRef<HTMLSpanElement>(null);
  const latest = PROJECTS[0];

  // Written straight to the DOM: a re-render per mouse move would be waste.
  const onPointer = useCallback((point: { x: number; y: number } | null) => {
    const node = readout.current;
    if (!node) return;
    if (!point) {
      node.textContent = "Move the cursor across the map";
      return;
    }
    const lat = BOUNDS.north - point.y * (BOUNDS.north - BOUNDS.south);
    const lng = BOUNDS.west + point.x * (BOUNDS.east - BOUNDS.west);
    node.textContent = `${formatCoord(lat, "N", "S")}  ${formatCoord(lng, "E", "W")}`;
  }, []);

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 -z-10">
        <ContourField interactive onPointer={onPointer} />
        {/* Darken the foot so the name always sits on calm ground. */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      </div>

      <div className="shell flex flex-1 flex-col pb-8 pt-[calc(var(--nav-h)+2rem)] sm:pb-10">
        {/* Top row: who, where, and the live coordinate readout. */}
        <Reveal play={ready} delay={100} className="flex items-start justify-between gap-6 border-t border-line pt-4">
          <p className="label">
            <span className="text-ember">●</span> {PROFILE.brand} — Portfolio 2026
          </p>
          <p className="label hidden text-right lg:block">
            <span className="text-paper">Survey grid · </span>
            <span ref={readout}>Move the cursor across the map</span>
          </p>
          <p className="label text-right lg:hidden">{PROFILE.location}</p>
        </Reveal>

        {/* Middle: the pitch on the left, the latest build on the right. */}
        <div className="mt-8 grid flex-1 content-center gap-10 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7 lg:col-span-6">
            <Reveal play={ready} delay={250}>
              <p className="label mb-5">
                (01) — {PROFILE.role} · {PROFILE.stack}
              </p>
            </Reveal>
            <SplitText
              as="p"
              play={ready}
              delay={350}
              stagger={40}
              text={PROFILE.tagline}
              className="block max-w-[30ch] text-balance text-2xl font-medium leading-[1.15] text-paper sm:text-3xl lg:text-[2.6rem]"
            />
          </div>

          <Reveal play={ready} delay={700} className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9 md:self-center">
            <a href="#work" className="group relative block p-5 sm:p-6">
              <Corners className="text-paper/60 transition-colors group-hover:text-ember" />
              <p className="label text-ember">Latest build · {latest.year}</p>
              <p className="mt-4 font-display text-4xl leading-none">{latest.name}</p>
              <p className="mt-2 text-sm text-dim">{latest.kind}</p>
              <ul className="mt-5 space-y-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-paper/80">
                <li>→ PostGIS overlap detection</li>
                <li>→ Polygon-anchored records</li>
                <li>→ Python · PostgreSQL · Leaflet</li>
              </ul>
              <span className="label mt-5 flex items-center gap-2 text-paper transition-colors group-hover:text-ember">
                See the case study <span aria-hidden="true">↓</span>
              </span>
            </a>
          </Reveal>
        </div>

        {/* The name, as large as the screen allows. */}
        {/* Two lines on a phone, one line from lg — sized so the hero fits one screen. */}
        <h1
          className="display mt-10 flex select-none flex-wrap gap-x-[0.18em] text-[clamp(4.5rem,21vw,12rem)] text-paper lg:mt-6 lg:flex-nowrap lg:text-[12.2vw] 2xl:text-[11.5rem]"
          aria-label={`${PROFILE.name}, ${PROFILE.brand}`}
        >
          <SplitText by="letter" play={ready} delay={150} stagger={45} text="Samaila" className="block" />
          <SplitText
            by="letter"
            play={ready}
            delay={450}
            stagger={45}
            text="Peter."
            className="block [&_.split-unit:last-child]:text-ember"
          />
        </h1>

        {/* Actions. */}
        <Reveal
          play={ready}
          delay={1300}
          className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <ChamferLink href="#work" arrow="down">
              View selected work
            </ChamferLink>
            <ChamferLink href={PROFILE.resumeUrl} download variant="ghost" arrow="down">
              Download résumé
              <span className="sr-only">(PDF)</span>
            </ChamferLink>
          </div>
          <p className="label hidden max-w-[20rem] leading-relaxed lg:block">
            Also known as <span className="text-paper">{PROFILE.brand}</span> — or just {PROFILE.nickname}. Building from{" "}
            {PROFILE.location}.
          </p>
          <a href="#work" className="label hidden items-center gap-3 hover:text-paper sm:flex" aria-hidden="true" tabIndex={-1}>
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_var(--ease-out)_infinite] bg-ember" />
            </span>
          </a>
        </Reveal>
      </div>

      <style>{`@keyframes scroll-cue { from { transform: translateY(-100%); } to { transform: translateY(200%); } }`}</style>
    </section>
  );
};

export default Hero;
