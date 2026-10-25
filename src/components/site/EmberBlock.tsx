import { createContext, useCallback, useContext, useRef, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, type LinkProps } from "react-router-dom";
import { ease, prefersReducedMotion } from "@/lib/motion";

/**
 * The ember block — the one object that ties the site together.
 *
 * It's the terminal cursor, the active nav item, the "open to roles" mark.
 * On a page change it grows out of whatever you clicked until it covers the
 * screen, the page swaps underneath, and it collapses into the new page's
 * nav item. Every position is measured at the moment it's needed.
 *
 * The box is a 1×1 px div moved and stretched with transform, and every
 * frame's box is computed from elapsed time alone.
 */

type Box = { x: number; y: number; w: number; h: number };

const GROW_MS = 460;
const COLLAPSE_MS = 720;

interface EmberApi {
  /** Grow from `from`, run `atCover` while the screen is hidden, then collapse into the nav. */
  run: (from: Box, atCover: () => void) => Promise<void>;
  /** Go to a route the ember way. `from` is the element that was clicked. */
  go: (to: string, from?: Element | null) => void;
}

const EmberContext = createContext<EmberApi | null>(null);

const boxOf = (element: Element): Box => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
};

/** Past all four corners, so no edge of the page peeks through. */
const coverBox = (): Box => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return { x: -w * 0.05, y: -h * 0.05, w: w * 1.1, h: h * 1.1 };
};

/** Where the block comes to rest: the active desktop nav item, or a thin line at the top. */
const homeBox = (): Box => {
  const active = document.querySelector('nav[aria-label="Primary"] [aria-current="page"]');
  const rect = active?.getBoundingClientRect();
  if (rect && rect.width > 0) return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
  // Phones have no visible nav bar: the block retracts upward, uncovering the page like a blind.
  return { x: -window.innerWidth * 0.05, y: 0, w: window.innerWidth * 1.1, h: 0 };
};

const mix = (a: Box, b: Box, t: number): Box => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

const nextFrames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(count);
  });

const draw = (block: HTMLElement, box: Box) => {
  block.style.display = "block";
  block.style.transform = `translate3d(${box.x}px, ${box.y}px, 0) scale(${Math.max(0, box.w)}, ${Math.max(0, box.h)})`;
};

/** Plays `from → to` with `curve`, each frame computed from elapsed time alone. */
const tween = (block: HTMLElement, from: () => Box, to: () => Box, ms: number, curve: (t: number) => number) =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // Re-measured every frame: the target may still be settling (fonts, the nav's own slide).
      draw(block, mix(from(), to(), curve(t)));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });

export function EmberProvider({ children }: { children: ReactNode }) {
  const blockRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const here = location.pathname + location.hash;

  const run = useCallback<EmberApi["run"]>(async (from, atCover) => {
    const block = blockRef.current;
    if (busy.current) return;
    if (!block || prefersReducedMotion()) {
      atCover();
      return;
    }
    busy.current = true;
    try {
      await tween(block, () => from, coverBox, GROW_MS, ease.inOutExpo);
      atCover();
      // Two frames for the new page to render and the nav to mark its new item.
      await nextFrames(2);
      await tween(block, coverBox, homeBox, COLLAPSE_MS, ease.spring);
    } finally {
      if (blockRef.current) blockRef.current.style.display = "none";
      busy.current = false;
    }
  }, []);

  const go = useCallback<EmberApi["go"]>(
    (to, from) => {
      if (to === here) return;
      const start = from
        ? boxOf(from)
        : { x: window.innerWidth / 2 - 8, y: window.innerHeight / 2 - 8, w: 16, h: 16 };
      void run(start, () => navigate(to));
    },
    [here, navigate, run],
  );

  return (
    <EmberContext.Provider value={{ run, go }}>
      {children}
      <div ref={blockRef} aria-hidden="true" className="ember-block" style={{ width: 1, height: 1, display: "none" }} />
    </EmberContext.Provider>
  );
}

export function useEmber() {
  const api = useContext(EmberContext);
  if (!api) throw new Error("useEmber must be used inside <EmberProvider>");
  return api;
}

/**
 * onClick for an in-app link: plain left clicks go the ember way. Ctrl/⌘-click,
 * middle-click and friends keep the browser's normal behaviour (new tab, etc.).
 */
export function useEmberClick(to: string, after?: () => void) {
  const { go } = useEmber();
  return (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const from = event.currentTarget;
    go(to, from);
    after?.();
  };
}

/** A router link that travels by ember block. Same props as <Link>, `to` must be a string. */
export function EmberLink({ to, onClick, ...props }: LinkProps & { to: string }) {
  const emberClick = useEmberClick(to);
  return (
    <Link
      to={to}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        emberClick(event);
      }}
    />
  );
}
