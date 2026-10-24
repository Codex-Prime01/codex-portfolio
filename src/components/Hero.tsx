import { Suspense, lazy, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { ContourField } from "@/components/visual/ContourField";
import { FloatingChips } from "@/components/visual/FloatingChips";
import { RisingBits } from "@/components/visual/RisingBits";
import type { TerminalSlide } from "@/components/visual/LaptopScene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { ChamferLink, Arrow } from "@/components/site/ChamferLink";
import { Corners } from "@/components/site/Intro";
import { PROFILE, PROJECTS } from "@/data/profile";

// three.js is big, so the laptop loads in its own chunk after the page shows.
const LaptopScene = lazy(() => import("@/components/visual/LaptopScene"));

/**
 * (01) The home stage — one screen, no scrolling on desktop.
 *
 * Left: who and what. Centre: a 3D laptop that leans toward the cursor,
 * with a live terminal on it. Right: the featured builds as cards. Picking
 * a card spins the laptop, loads that project into the terminal, re-tints
 * the stage and shuffles the floating chips to that project's stack.
 */

/** A stage tint per project — presentation only, so it lives here, not in profile.ts. */
const TINTS: Record<string, string> = {
  sabageo: "rgb(11 138 120 / 0.28)",
  "nuesa-quiz": "rgb(11 79 138 / 0.32)",
  quantumtasker: "rgb(124 58 237 / 0.24)",
  vendigo: "rgb(245 158 11 / 0.22)",
  "codex-bank": "rgb(34 197 94 / 0.2)",
};

const INTRO_CHIPS = ["Python", "Django", "PostgreSQL", "PostGIS", "REST APIs", "</>", "{ }", "SELECT *", ">>>", "FastAPI"];
const GLYPHS = ["</>", "{ }", ">>>", "SELECT *"];

const INTRO_SLIDE: TerminalSlide = {
  command: "whoami",
  output: [
    `# ${PROFILE.name} — ${PROFILE.brand}`,
    `${PROFILE.role} · ${PROFILE.stack}`,
    PROFILE.tagline,
    "✓ open to backend, SWE and data roles",
  ],
};

const Hero = ({ ready }: { ready: boolean }) => {
  const { theme } = useTheme();
  // -1 is the intro slide; 0.. are PROJECTS.
  const [active, setActive] = useState(-1);
  const [switchKey, setSwitchKey] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);
  const lastSwitch = useRef(0);

  const slides = useMemo<TerminalSlide[]>(
    () => [
      INTRO_SLIDE,
      ...PROJECTS.map((project) => ({
        command: `cat projects/${project.slug}.md`,
        output: [`# ${project.name} — ${project.kind}`, project.summary, `✓ stack: ${project.tech.join(" · ")}`],
      })),
    ],
    [],
  );

  const chips = active < 0 ? INTRO_CHIPS : [...PROJECTS[active].tech, ...GLYPHS];
  const tint = active < 0 ? undefined : TINTS[PROJECTS[active].slug];

  const select = (index: number) => {
    const now = performance.now();
    // Let one spin finish before the next starts — mashing arrows shouldn't stack them.
    if (index === active || now - lastSwitch.current < 900) return;
    lastSwitch.current = now;
    setActive(index);
    setSwitchKey((key) => key + 1);
    cardsRef.current
      ?.querySelector<HTMLElement>(`[data-card="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  const step = (by: 1 | -1) => {
    const count = PROJECTS.length;
    // From the intro, "next" lands on the first build and "previous" on the last.
    if (active < 0) select(by > 0 ? 0 : count - 1);
    else select((active + by + count) % count);
  };

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="stage relative isolate min-h-[100svh] overflow-hidden lg:h-[100svh] lg:min-h-[36rem]"
      style={tint ? ({ "--glow": tint } as CSSProperties) : undefined}
    >
      <div className="absolute inset-0 -z-10">
        <ContourField alpha={0.045} />
      </div>
      <RisingBits />
      <FloatingChips layer="back" labels={chips} switchKey={switchKey} className="-z-0 hidden lg:block" />

      <div className="shell relative flex min-h-[100svh] flex-col pb-6 pt-[calc(var(--nav-h)+1.25rem)] lg:static lg:grid lg:h-full lg:min-h-0 lg:grid-cols-12 lg:gap-6 lg:pb-8 lg:pt-[calc(var(--nav-h)+2rem)]">
        {/* Left: name, pitch, call to action, availability. */}
        <div className="relative z-10 flex flex-col lg:col-span-4 lg:h-full">
          <Reveal play={ready} delay={100}>
            <p className="label">
              <span className="text-ember">●</span> {PROFILE.brand} — Portfolio 2026
            </p>
          </Reveal>

          <h1
            className="display mt-4 select-none text-[clamp(3.25rem,16vw,5.5rem)] text-paper lg:mt-8 lg:text-[clamp(3.75rem,min(6.9vw,12svh),8.25rem)]"
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

          <Reveal play={ready} delay={600}>
            <p className="label mt-4 lg:mt-6">
              (01) — {PROFILE.role} · {PROFILE.stack}
            </p>
          </Reveal>
          <SplitText
            as="p"
            play={ready}
            delay={700}
            stagger={30}
            text={PROFILE.tagline}
            className="mt-3 block max-w-[28ch] text-balance text-lg font-medium leading-snug text-paper/85 sm:text-xl lg:text-[1.35rem]"
          />

          <Reveal play={ready} delay={1000} className="mt-6 hidden flex-col items-start gap-3 lg:flex">
            <ChamferLink to="/about">Get to know me</ChamferLink>
            <a href={PROFILE.resumeUrl} download className="label link-underline text-paper hover:text-ember">
              or download the résumé (PDF) ↓
            </a>
          </Reveal>

          <Reveal play={ready} delay={1200} className="mt-auto hidden lg:block">
            <Availability />
          </Reveal>
        </div>

        {/* Centre: the laptop. In the flow on phones, behind everything on desktop. */}
        <div className="pointer-events-none relative -mx-[var(--gutter)] my-2 h-[36svh] min-h-[16rem] lg:absolute lg:inset-0 lg:m-0 lg:h-auto">
          <FloatingChips layer="back" labels={chips} switchKey={switchKey} phone className="lg:hidden" />
          <Suspense fallback={null}>
            <LaptopScene
              slides={slides}
              active={active + 1}
              theme={theme}
              className={cn("h-full w-full transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}
            />
          </Suspense>
          <FloatingChips layer="front" labels={chips} switchKey={switchKey} phone className="lg:hidden" />
        </div>

        {/* Right: the featured builds and the second headline. */}
        <div className="relative z-10 flex flex-col lg:col-span-4 lg:col-start-9 lg:h-full lg:items-end lg:justify-between lg:text-right">
          <Reveal play={ready} delay={900} className="w-full lg:max-w-[27rem]">
            <div className="mb-3 flex items-end justify-between gap-4">
              <p className="label text-left">Featured builds · tap to load</p>
              <div className="flex gap-2">
                <StepButton label="Previous project" direction={-1} onClick={() => step(-1)} />
                <StepButton label="Next project" direction={1} onClick={() => step(1)} />
              </div>
            </div>
            <div
              ref={cardsRef}
              className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-2 pt-3 lg:mx-0 lg:px-0"
            >
              {PROJECTS.map((project, i) => (
                <button
                  key={project.slug}
                  type="button"
                  data-card={i}
                  onClick={() => select(i)}
                  aria-pressed={active === i}
                  className={cn(
                    "stage-card glass relative flex w-[8.25rem] shrink-0 snap-start flex-col items-start p-3 text-left transition-colors duration-300",
                    active === i ? "border-ember bg-ember/10" : "hover:border-paper/40 hover:bg-paper/10",
                  )}
                >
                  <span className="stage-card-num font-display text-4xl leading-none text-ember">{project.index}</span>
                  <span className="mt-6 text-sm font-medium leading-tight text-paper">{project.name}</span>
                  <span className="label mt-1 text-[0.6rem] leading-snug">{project.kind}</span>
                </button>
              ))}
            </div>
            {/* Where to go once a project has caught your eye. */}
            <p className="label mt-2 h-4 text-left lg:text-right">
              {active >= 0 && (
                <Link to={`/work#${PROJECTS[active].slug}-title`} className="inline-flex items-center gap-2 text-ember hover:text-paper">
                  Open the {PROJECTS[active].name} case study <Arrow />
                </Link>
              )}
            </p>
          </Reveal>

          <div className="mt-6 flex flex-col gap-3 lg:hidden">
            <ChamferLink to="/about">Get to know me</ChamferLink>
            <Availability />
          </div>

          <h2
            className="display hidden text-[clamp(3rem,min(5.4vw,9svh),6.5rem)] text-paper lg:block [@media(max-height:700px)]:lg:hidden"
            aria-label="Database to deploy."
          >
            <SplitText by="letter" play={ready} delay={800} stagger={35} text="Database" className="block" />
            <SplitText by="letter" play={ready} delay={1050} stagger={35} text="to deploy." className="block text-ember" />
          </h2>
        </div>
      </div>

      {/* The front chips sit above the text on desktop, like fruit in front of the can. */}
      <FloatingChips layer="front" labels={chips} switchKey={switchKey} className="z-20 hidden lg:block" />

      <p className="label pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        Move your cursor — it&rsquo;s watching
      </p>
    </section>
  );
};

/** The "award badge" spot: what I'm open to right now. */
function Availability() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <Corners className="text-ember" size={10} />
        <span className="h-2 w-2 animate-pulse bg-ember" />
      </div>
      <div className="text-left">
        <p className="label">Open to roles</p>
        <p className="text-sm font-medium text-paper">Backend · SWE · Data — remote or on-site</p>
      </div>
    </div>
  );
}

function StepButton({ label, direction, onClick }: { label: string; direction: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="glass flex h-9 w-9 items-center justify-center text-paper transition-colors hover:border-ember hover:text-ember"
    >
      <Arrow className={direction < 0 ? "rotate-180" : undefined} />
    </button>
  );
}

export default Hero;
