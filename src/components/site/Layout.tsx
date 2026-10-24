import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Intro } from "@/components/site/Intro";

/**
 * The frame every page shares: grain, the intro veil (first visit only),
 * the nav, and the page itself. Pages read `ready` to time their entrance.
 */

type LayoutContext = { ready: boolean };

export function Layout() {
  // Flips when the intro veil starts to lift (or straight away if it's skipped).
  const [ready, setReady] = useState(false);
  const onIntroDone = useCallback(() => setReady(true), []);
  const { pathname, hash } = useLocation();

  // Land at the top of each new page, or on the #section the link asked for.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="grain min-h-screen bg-ink">
      <Intro onDone={onIntroDone} />
      <Navigation ready={ready} />
      {/* Keyed on the path so the entrance plays on every page change. */}
      <main id="main" key={pathname} className={ready ? "page-in" : "opacity-0"}>
        <Outlet context={{ ready } satisfies LayoutContext} />
      </main>
    </div>
  );
}

export const usePageReady = () => useOutletContext<LayoutContext>().ready;
