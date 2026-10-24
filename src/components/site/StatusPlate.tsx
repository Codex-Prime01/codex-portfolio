import { useEffect, useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { prefersReducedMotion, useInView } from "@/lib/motion";

/**
 * A small instrument plate: a turning globe beside three figures.
 *
 * The globe is two ellipses and a line; the "turn" is the meridian's width
 * following |cos| of an angle, which reads as rotation without any 3D.
 */

const SPIN_MS = 10000;
const FRAME = "M0.5 0.5H299.5V79L290 88.5H0.5Z";

export function StatusPlate({ rows }: { rows: { figure: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const meridian = useRef<SVGEllipseElement>(null);
  const inView = useInView(ref, { once: false, rootMargin: "0px" });

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const turn = (((now - start) % SPIN_MS) / SPIN_MS) * Math.PI * 2;
      meridian.current?.setAttribute("rx", String(Math.max(0.5, Math.abs(Math.cos(turn)) * 18)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <Reveal delay={260}>
      <div ref={ref} className="relative grid w-full max-w-[19rem] grid-cols-[5.5rem_1fr]">
        <svg aria-hidden="true" viewBox="0 0 300 89" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d={FRAME} fill="var(--ink)" stroke="var(--ember)" vectorEffect="non-scaling-stroke" />
          <line x1="88" y1="0.5" x2="88" y2="88.5" stroke="var(--ember)" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="relative flex flex-col items-center justify-center gap-2 py-4">
          <svg aria-hidden="true" viewBox="0 0 37 23" className="h-6 w-10" fill="none" stroke="var(--ember)" strokeWidth="1">
            <ellipse cx="18.5" cy="11.5" rx="18" ry="11" />
            <line x1="0.5" y1="11.5" x2="36.5" y2="11.5" />
            <ellipse ref={meridian} cx="18.5" cy="11.5" rx="18" ry="11" />
          </svg>
          <p className="flex gap-1 font-mono text-[0.65rem] uppercase tracking-wider">
            <span className="text-paper">NG</span>
            <span className="text-ember">/ 2026</span>
          </p>
        </div>

        <dl className="relative flex flex-col justify-center gap-1.5 py-4 pl-4 pr-3">
          {rows.map((row, i) => (
            <div key={row.label} className="flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-wide">
              <dt className="text-ember">
                <SplitText by="letter" text={row.figure} delay={430 + i * 110} stagger={22} />
              </dt>
              <dd className="whitespace-nowrap text-paper">{row.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}
