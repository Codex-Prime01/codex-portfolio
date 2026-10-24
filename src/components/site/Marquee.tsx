/**
 * An editorial ticker between sections. The run is rendered twice and the
 * track slides by exactly one copy, so the loop has no seam. Pauses on hover;
 * reduced motion stops it (see index.css).
 */

const RUN = [
  "Python",
  "Django",
  "PostgreSQL",
  "PostGIS",
  "REST APIs",
  "FastAPI",
  "Flask",
  "Leaflet",
  "Database to deployment",
];

export function Marquee() {
  const items = RUN.map((word) => (
    <span key={word} className="flex items-center">
      <span className="px-6 font-display text-4xl uppercase leading-none text-paper sm:px-10 sm:text-6xl">{word}</span>
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 fill-ember sm:h-4 sm:w-4">
        <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" />
      </svg>
    </span>
  ));

  return (
    <div className="marquee overflow-hidden border-y border-line bg-ink py-6 sm:py-8">
      <p className="sr-only">Working with: {RUN.join(", ")}.</p>
      <div className="marquee-track" aria-hidden="true">
        <div className="flex">{items}</div>
        <div className="flex">{items}</div>
      </div>
    </div>
  );
}
