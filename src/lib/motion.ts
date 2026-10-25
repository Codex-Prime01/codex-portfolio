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

/** Easing curves for hand-run tweens (the home stage has no tween library). */
export const ease = {
  inQuad: (t: number) => t * t,
  inOutExpo: (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  /** Overshoots a little, then settles. `s` sets how far. */
  outBack: (t: number, s = 1.70158) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2,
  /**
   * A damped spring squeezed into 0–1: overshoots ~3% once, then settles.
   * index.css has the same curve as `--ease-spring`, so CSS and JS match.
   */
  spring: (t: number) => {
    if (t >= 1) return 1;
    const damping = 0.75;
    const omega = 8.3;
    const omegaD = omega * Math.sqrt(1 - damping * damping);
    const decay = Math.exp(-damping * omega * t);
    return 1 - decay * (Math.cos(omegaD * t) + ((damping * omega) / omegaD) * Math.sin(omegaD * t));
  },
};

/** Durations shared by the laptop spin and the chips, so they land together. */
export const SWITCH = { in: 600, hold: 300, out: 1200 } as const;

/**
 * A slow camera push tied to scroll: the element scales from 1.0 to 1.04 as
 * it travels up through the viewport, so a heading is never quite still.
 * Written straight to the element; no will-change, so text stays crisp.
 */
export function useScrollPush<T extends HTMLElement>(ref: RefObject<T>, amount = 0.04) {
  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    let frame = 0;
    const apply = () => {
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight || 1;
      // 0 as its top enters the bottom of the screen, 1 as it leaves the top.
      const progress = Math.min(1, Math.max(0, (view - rect.top) / (view + rect.height)));
      element.style.transform = `scale(${1 + amount * progress})`;
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
  }, [ref, amount]);
}
