import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigationType, useOutletContext } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Intro } from "@/components/site/Intro";
import { EmberProvider } from "@/components/site/EmberBlock";

/**
 * The frame every page shares: grain, the intro (first visit only), the
 * nav, and the page itself. Pages read `ready` to time their entrance.
 *
 * Clicked links change page under the ember block (EmberBlock.tsx), so the
 * page itself needs no entrance. Back/forward ("POP") have no click to grow
 * from, so the page is uncovered with a top-down wipe instead.
 */

type LayoutContext = { ready: boolean };

export function Layout() {
  // Flips when the intro hands over (or straight away if it's skipped).
  const [ready, setReady] = useState(false);
  const onIntroDone = useCallback(() => setReady(true), []);
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  // "default" is the page you loaded; only later POPs are real back/forward presses.
  const wipe = navigationType === "POP" && key !== "default";

  // Land at the top of each new page, or on the #section the link asked for.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <EmberProvider>
      <div className="grain min-h-screen bg-ink">
        <Intro onDone={onIntroDone} />
        <Navigation ready={ready} />
        {/* Keyed on the path so the back/forward wipe replays on every change. */}
        <main id="main" key={pathname} className={!ready ? "invisible" : wipe ? "page-wipe" : undefined}>
          <Outlet context={{ ready } satisfies LayoutContext} />
        </main>
      </div>
    </EmberProvider>
  );
}

export const usePageReady = () => useOutletContext<LayoutContext>().ready;
