import { useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { ChamferLink, Arrow } from "@/components/site/ChamferLink";
import { Corners } from "@/components/site/Intro";
import { OverlapDiagram } from "@/components/visual/OverlapDiagram";
import { ARCHIVE, CONTACT, PROJECTS, type Project, type ProjectLink } from "@/data/profile";

/** The stepped-corner plate shape, as a clip on the plate's own box. */
const PLATE_CLIP =
  "polygon(0 0, 100% 0, 100% 88%, 66% 88%, 61% 100%, 0 100%)";

const Projects = () => {
  const [sabageo, nuesa, quantum, vendigo, bank] = PROJECTS;

  return (
    <section id="work" aria-labelledby="work-title" className="relative bg-ink pb-24 pt-24 sm:pt-32">
      <div className="shell">
        <SectionHead index="02" title="Selected work" id="work-title" aside={`${String(PROJECTS.length).padStart(2, "0")} projects + archive`} />

        <Featured project={sabageo} />

        <div className="mt-28 grid gap-x-6 gap-y-20 sm:mt-40 lg:grid-cols-12">
          <ImageCase project={nuesa} className="lg:col-span-12" />
        </div>

        <div className="mt-28 grid gap-6 sm:mt-40 md:grid-cols-2">
          <TypeCase project={quantum} />
          <TypeCase project={vendigo} offset />
        </div>

        <CodeCase project={bank} />

        <Archive />
      </div>
    </section>
  );
};

/** Section heading: index, a huge title and a short aside, over a drawn rule. */
export function SectionHead({ index, title, id, aside }: { index: string; title: string; id: string; aside?: string }) {
  return (
    <header className="mb-16 sm:mb-24">
      <div className="mb-6 flex items-end justify-between gap-6">
        <p className="label">
          <span className="text-ember">({index})</span>
        </p>
        {aside && <p className="label text-right">{aside}</p>}
      </div>
      <Reveal variant="rule" />
      <SplitText
        as="h2"
        id={id}
        text={title}
        by="letter"
        stagger={30}
        className="display mt-6 block text-[clamp(2.75rem,12vw,12rem)] text-paper"
      />
    </header>
  );
}

function ProjectLinks({ links, className }: { links: ProjectLink[]; className?: string }) {
  if (!links.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {links.map((link) =>
        link.offline ? (
          <p key={link.href} className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-dim" aria-hidden="true" />
            {link.label} — temporarily offline
          </p>
        ) : (
          <ChamferLink key={link.href} href={link.href} target="_blank" arrow="up-right">
            {link.label}
          </ChamferLink>
        ),
      )}
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Technologies">
      {items.map((item) => (
        <li key={item} className="border border-line px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-paper/80">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** 01 — SABAGeo, the long-form case. */
function Featured({ project }: { project: Project }) {
  return (
    <article aria-labelledby={`${project.slug}-title`} className="grid gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <Reveal className="flex items-center gap-4">
            <span className="font-mono text-sm text-ember">{project.index}</span>
            <span className="label">
              {project.kind} · {project.year}
            </span>
          </Reveal>
          <SplitText
            as="h3"
            id={`${project.slug}-title`}
            text={project.name}
            by="letter"
            stagger={40}
            // The project's name is "SABAGeo" — never set it in all caps.
            className="display mt-5 block text-[clamp(3rem,10vw,9rem)] normal-case text-paper"
          />
          <Reveal delay={150}>
            <p className="mt-6 max-w-[34ch] text-lg leading-snug sm:text-xl text-paper/90">{project.summary}</p>
          </Reveal>
          <Reveal delay={250} className="mt-8">
            <Tags items={project.tech} />
          </Reveal>
          <Reveal delay={350} className="mt-8">
            <ProjectLinks links={project.links} />
          </Reveal>
        </div>
      </div>

      <div className="lg:col-span-7">
        <Reveal className="relative bg-ink-2 p-4 sm:p-8">
          <Corners className="text-ember" />
          <OverlapDiagram />
        </Reveal>

        <ol className="mt-12 grid gap-x-8 sm:grid-cols-2">
          {project.points.map((point, i) => (
            <Reveal as="li" key={point} delay={i * 90} className="border-t border-line py-6">
              <span className="font-mono text-xs text-ember">0{i + 1} /</span>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-paper/80">{point}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </article>
  );
}

/** A case built around a real screenshot. */
function ImageCase({ project, className }: { project: Project; className?: string }) {
  const live = project.links.find((link) => !link.offline);
  return (
    <article aria-labelledby={`${project.slug}-title`} className={cn("plate grid gap-10 lg:grid-cols-12 lg:gap-6", className)}>
      <Reveal className="lg:col-span-7">
        <a
          href={live?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          aria-label={`${project.name} — ${live?.label ?? "open"} (opens in a new tab)`}
        >
          <div
            className="plate-media relative aspect-[16/10] overflow-hidden bg-ink-3"
            style={{ clipPath: PLATE_CLIP } as CSSProperties}
          >
            {project.image && (
              <img
                src={project.image}
                alt={project.imageAlt ?? ""}
                width={1440}
                height={900}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            )}
          </div>
          <p className="label mt-3 flex items-center gap-2 transition-colors group-hover:text-ember">
            Screenshot of the live site <Arrow direction="up-right" />
          </p>
        </a>
      </Reveal>

      <div className="flex flex-col justify-center lg:col-span-4 lg:col-start-9">
        <Reveal className="flex items-center gap-4">
          <span className="font-mono text-sm text-ember">{project.index}</span>
          <span className="label">{project.kind}</span>
        </Reveal>
        <SplitText as="h3" id={`${project.slug}-title`} text={project.name} className="display mt-4 block text-5xl text-paper sm:text-7xl" />
        <Reveal delay={150}>
          <p className="mt-5 text-base leading-snug text-paper/90 sm:text-lg">{project.summary}</p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-paper/70">
            {project.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="text-ember" aria-hidden="true">→</span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={250} className="mt-8 space-y-8">
          <Tags items={project.tech} />
          <ProjectLinks links={project.links} />
        </Reveal>
      </div>
    </article>
  );
}

/** A case with no public demo: type does the work, and says so plainly. */
function TypeCase({ project, offset }: { project: Project; offset?: boolean }) {
  return (
    <Reveal as="article" delay={offset ? 120 : 0} className={cn("group relative min-w-0 bg-ink-2 p-6 sm:p-10", offset && "md:mt-24")}>
      <Corners className="text-paper/30 transition-colors duration-500 group-hover:text-ember" />
      <div className="flex items-start justify-between gap-4">
        <span aria-hidden="true" className="display text-[clamp(5rem,12vw,9rem)] text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">
          {project.index}
        </span>
        {project.note && (
          <span className="label border border-line px-2 py-1">{project.note}</span>
        )}
      </div>
      <p className="label mt-6">{project.kind}</p>
      {/* Scales with the screen: "QuantumTasker" is one long word with nowhere to break. */}
      <h3 className="display mt-3 text-[clamp(2.25rem,10vw,3.75rem)] text-paper transition-colors duration-500 group-hover:text-ember">
        {project.name}
      </h3>
      {project.role && <p className="mt-3 font-mono text-xs uppercase tracking-wider text-ember-2">{project.role}</p>}
      <p className="mt-5 max-w-[40ch] leading-relaxed text-paper/80">{project.summary}</p>
      <ul className="mt-5 space-y-2 text-sm leading-relaxed text-paper/60">
        {project.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span className="text-ember" aria-hidden="true">→</span>
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Tags items={project.tech} />
      </div>
    </Reveal>
  );
}

/** Python made visible: a verbatim excerpt from the public repo. */
function CodeCase({ project }: { project: Project }) {
  const code = project.code;
  return (
    <article aria-labelledby={`${project.slug}-title`} className="mt-28 grid gap-10 sm:mt-40 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col justify-center lg:col-span-4">
        <Reveal className="flex items-center gap-4">
          <span className="font-mono text-sm text-ember">{project.index}</span>
          <span className="label">{project.kind}</span>
        </Reveal>
        <SplitText as="h3" id={`${project.slug}-title`} text={project.name} className="display mt-4 block text-5xl text-paper sm:text-7xl" />
        <Reveal delay={150}>
          <p className="mt-5 text-base leading-snug text-paper/90 sm:text-lg">{project.summary}</p>
        </Reveal>
        <Reveal delay={250} className="mt-8 space-y-8">
          <Tags items={project.tech} />
          <ProjectLinks links={project.links} />
        </Reveal>
      </div>

      {code && (
        // min-w-0: a grid item won't shrink below its content, so without it the
        // long code lines widen the whole page on a phone instead of scrolling here.
        <Reveal delay={100} className="min-w-0 lg:col-span-7 lg:col-start-6">
          <figure className="relative overflow-hidden border border-line bg-ink-2">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-mono text-xs text-paper/70">{code.file}</span>
              <span className="label">Excerpt · from the repo</span>
            </div>
            <pre className="overflow-x-auto p-5 text-[0.78rem] leading-relaxed sm:p-6 sm:text-sm">
              <code className="font-mono">{highlight(code.source)}</code>
            </pre>
            <figcaption className="border-t border-line px-4 py-3 font-mono text-xs text-dim">
              <span className="text-ember">#</span> CheckingAccount overrides withdraw() to allow an overdraft — inheritance and
              polymorphism in practice.
            </figcaption>
          </figure>
        </Reveal>
      )}
    </article>
  );
}

/** Just enough highlighting to read as Python: keywords, strings, comments. */
function highlight(source: string) {
  const pattern = /(#.*$)|('[^']*'|"[^"]*")|\b(class|def|if|return|self|super|False|True|and|or|not)\b/gm;
  const parts: (string | JSX.Element)[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(source))) {
    if (match.index > last) parts.push(source.slice(last, match.index));
    const [text, comment, string] = match;
    const color = comment ? "text-dim italic" : string ? "text-ember-2" : "text-ember";
    parts.push(
      <span key={key++} className={color}>
        {text}
      </span>,
    );
    last = match.index + text.length;
  }
  parts.push(source.slice(last));
  return parts;
}

/** Earlier builds: an index list, with a screenshot that follows the cursor where one exists. */
function Archive() {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const move = (event: React.PointerEvent) => {
    const list = listRef.current;
    const box = previewRef.current;
    if (!list || !box) return;
    const rect = list.getBoundingClientRect();
    box.style.transform = `translate3d(${event.clientX - rect.left + 24}px, ${event.clientY - rect.top - 90}px, 0)`;
  };

  return (
    <div className="mt-32 sm:mt-44">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SplitText as="h3" text="Archive" by="letter" className="display block text-5xl text-paper sm:text-8xl" />
        <p className="label max-w-xs">Earlier builds — smaller, but they're where it started.</p>
      </div>

      <ul ref={listRef} className="relative border-t border-line" onPointerMove={move} onPointerLeave={() => setPreview(null)}>
        {ARCHIVE.map((item, i) => {
          const body = (
            <>
              <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl uppercase leading-none text-paper transition-colors group-hover:text-ember sm:text-4xl">
                {item.name}
              </span>
              <span className="hidden text-sm text-dim md:block">{item.note}</span>
              <span className="hidden font-mono text-xs uppercase tracking-wider text-paper/60 sm:block">{item.tech}</span>
              <span className="label flex items-center justify-end gap-2 text-right">
                {item.offline ? (
                  "Link offline"
                ) : (
                  <>
                    <span className="text-paper/80 group-hover:text-ember">{item.kind}</span>
                    <Arrow direction="up-right" className="text-ember transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </>
          );
          const rowClass =
            "group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 sm:grid-cols-[3rem_1.4fr_9rem_7rem] md:grid-cols-[3rem_1.2fr_1fr_9rem_7rem]";
          return (
            <Reveal as="li" key={item.name} delay={i * 70}>
              {item.offline ? (
                <div className={cn(rowClass, "opacity-60")}>{body}</div>
              ) : (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(rowClass, "transition-[padding] duration-500 ease-out hover:pl-3")}
                  onPointerEnter={() => setPreview(item.preview ?? null)}
                  onFocus={() => setPreview(null)}
                >
                  {body}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </Reveal>
          );
        })}

        <div
          ref={previewRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 hidden w-72 lg:block"
        >
          <div
            className="overflow-hidden border border-line bg-ink-3 transition-[opacity,transform] duration-300 ease-out"
            style={{ opacity: preview ? 1 : 0, transform: preview ? "scale(1)" : "scale(0.92)" }}
          >
            {preview && <img src={preview} alt="" className="aspect-[16/10] w-full object-cover object-top" />}
          </div>
        </div>
      </ul>

      <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <p className="max-w-md text-dim">More experiments, exercises and work in progress live on GitHub.</p>
        <ChamferLink href={CONTACT.github} target="_blank" variant="ghost" arrow="up-right">
          github/{CONTACT.githubHandle}
        </ChamferLink>
      </Reveal>
    </div>
  );
}

export default Projects;
