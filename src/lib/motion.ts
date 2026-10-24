import { useEffect, useState, type RefObject } from "react";

/** Shared timing so every section moves with the same rhythm. */
export const STAGGER = { word: 70, letter: 28, item: 90 } as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * True once the element has entered the viewport. `once` keeps it true, so a
 * reveal plays a single time and never reverses when scrolling back up.
 */
export function useInView<T extends Element>(
  ref: RefObject<T>,
  { rootMargin = "0px 0px -12% 0px", once = true, threshold = 0 } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // No observer support: show everything rather than hide it forever.
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, once, threshold]);

  return inView;
}

/**
 * Runs `draw` every animation frame, but only while `active` is true. Used by
 * the canvases so they cost nothing while scrolled away or in a hidden tab.
 */
export function useFrameLoop(draw: (time: number) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw, active]);
}

/** True while the document is visible — background tabs stop animating. */
export function usePageVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}
