import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { CoveredContext } from "@/lib/covered";

/**
 * Pins `pinned` while `over` slides up across it. As it is covered the pinned
 * block recedes — scaling down a touch and darkening — rather than scrolling
 * away. Once fully covered it stops painting, and tells its children through
 * context so a canvas inside it can stop drawing too.
 */

const RECEDE_SCALE = 0.92;
const RECEDE_SHADE = 0.6;

export function StackRecede({ pinned, over }: { pinned: ReactNode; over: ReactNode }) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<HTMLDivElement>(null);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const sticky = stickyRef.current;
    const inner = innerRef.current;
    const shade = shadeRef.current;
    const next = overRef.current;
    if (!sticky || !inner || !shade || !next) return;

    const phone = window.matchMedia("(max-width: 639px)");
    let frame = 0;
    let wasCovered = false;

    // A pinned block taller than the screen sticks by its foot, not its head,
    // so all of it can still be read before the next block arrives.
    const place = () => {
      sticky.style.top = `${Math.min(0, window.innerHeight - sticky.offsetHeight)}px`;
    };

    const apply = () => {
      const view = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view));
      const shrink = phone.matches || prefersReducedMotion() ? 0 : 1 - RECEDE_SCALE;
      // No transform at rest: a transformed ancestor would trap fixed children.
      inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : "";
      shade.style.opacity = `${RECEDE_SHADE * p}`;
      const isCovered = p >= 1;
      inner.style.visibility = isCovered ? "hidden" : "visible";
      if (isCovered !== wasCovered) {
        wasCovered = isCovered;
        setCovered(isCovered);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    const onResize = () => {
      place();
      onScroll();
    };

    place();
    apply();
    const observer = new ResizeObserver(onResize);
    observer.observe(sticky);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative bg-black">
      <div ref={stickyRef} className="sticky top-0 z-0">
        <div ref={innerRef} className="origin-[50%_30%] will-change-transform">
          <CoveredContext.Provider value={covered}>{pinned}</CoveredContext.Provider>
        </div>
        <div ref={shadeRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0" />
      </div>
      <div ref={overRef} className="relative z-10">
        {over}
      </div>
    </div>
  );
}
