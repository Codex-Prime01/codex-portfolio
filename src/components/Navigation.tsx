import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CONTACT, NAV, PROFILE } from "@/data/profile";

/** Tracks which section is under the bar, for the active indicator. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      // A thin band across the upper third of the screen decides the winner.
      { rootMargin: "-30% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const SECTION_IDS = NAV.map((item) => item.href.slice(1));

const Navigation = ({ ready = true }: { ready?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  // Hide while scrolling down, return on the way up — the bar never covers a heading you're reading.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolid(y > 24);
        setHidden(y > lastY && y > window.innerHeight * 0.6);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <a
        href="#work"
        className="label fixed left-4 top-4 z-[70] -translate-y-24 bg-ember px-3 py-2 text-ink focus:translate-y-0"
      >
        Skip to work
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-out",
          "border-b",
          solid ? "border-line bg-ink/90 backdrop-blur-sm" : "border-transparent bg-transparent",
          hidden && !open && "-translate-y-full",
          !ready && "opacity-0",
        )}
        style={{ transitionProperty: "transform, background-color, border-color, opacity" }}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" aria-label={`${PROFILE.brand} — back to top`}>
            <Monogram />
            <span className="font-display text-lg uppercase tracking-wide text-paper">
              Codex<span className="text-ember">/</span>Prime
            </span>
          </a>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-10">
              {NAV.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group relative flex items-baseline gap-1.5 py-2 text-sm transition-colors",
                        isActive ? "text-paper" : "text-dim hover:text-paper",
                      )}
                    >
                      
                      <span className="font-mono text-[0.65rem] text-ember">{item.index}</span>
                      {item.label}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ember transition-transform duration-500 ease-out",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href={PROFILE.resumeUrl}
            download
            className="hidden items-center gap-2 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:text-ember lg:flex"
          >
            <span aria-hidden="true" className="text-ember">[</span>
            Résumé
            <span aria-hidden="true">↓</span>
            <span aria-hidden="true" className="text-ember">]</span>
            <span className="sr-only">(PDF)</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span className="h-px w-6 bg-paper" />
            <span className="h-px w-6 bg-paper" />
          </button>
        </div>
      </header>

      {open && <MobileMenu active={active} onClose={() => setOpen(false)} />}
    </>
  );
};

/**
 * The phone menu: a full-screen dialog, portalled to <body> so no transformed
 * ancestor can pin it inside the header.
 */
function MobileMenu({ active, onClose }: { active: string | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    const frame = requestAnimationFrame(() => setShown(true));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // Keep Tab inside the dialog.
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && onClose();
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      cancelAnimationFrame(frame);
      html.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [onClose]);

  return createPortal(
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={cn(
        "fixed inset-0 z-[80] flex flex-col bg-ink px-[var(--gutter)] transition-opacity duration-300",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="flex h-[var(--nav-h)] items-center justify-between">
        <span className="font-display text-lg uppercase tracking-wide">
          Codex<span className="text-ember">/</span>Prime
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="relative -mr-2 h-11 w-11"
          aria-label="Close menu"
        >
          <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 rotate-45 bg-paper" />
          <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -rotate-45 bg-paper" />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
        <ul className="space-y-2">
          {NAV.map((item, i) => (
            <li
              key={item.href}
              className="transition-[opacity,transform] duration-700 ease-out"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(1rem)",
                transitionDelay: `${120 + i * 60}ms`,
              }}
            >
              <a
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-baseline gap-4 border-b border-line py-3 font-display text-5xl uppercase leading-none transition-colors",
                  active === item.href.slice(1) ? "text-ember" : "text-paper hover:text-ember",
                )}
              >
                <span className="font-mono text-xs text-dim">{item.index}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-line py-6 font-mono text-xs uppercase tracking-wider">
        <a href={PROFILE.resumeUrl} download onClick={onClose} className="text-ember">
          Résumé ↓<span className="sr-only">(PDF)</span>
        </a>
        <a href={`mailto:${CONTACT.email}`} className="text-dim hover:text-paper">
          Email
        </a>
        <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-paper">
          GitHub
        </a>
      </div>
    </div>,
    document.body,
  );
}

/** The CP mark: two ember corners and the initials. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", className)} aria-hidden="true">
      <path
        d="M4 11V4h7M28 21v7h-7"
        fill="none"
        stroke="var(--ember)"
        strokeWidth="2"
        className="transition-transform duration-500 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
      />
      <text x="16" y="21" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="13" fill="var(--paper)">
        CP
      </text>
    </svg>
  );
}

export default Navigation;
