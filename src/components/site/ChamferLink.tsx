import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * The site's call to action: a frame with its bottom-right corner cut,
 * drawn as one SVG path so the cut stays crisp at any width. On hover an
 * ember sheet floods it from the left and the label turns dark.
 */

const FRAME = "M0.5 0.5H219.5V41L211 49.5H0.5Z";

interface ChamferLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: "solid" | "ghost";
  arrow?: "right" | "down" | "up-right";
  /** An in-app route. Renders a router link, so the page changes without a reload. */
  to?: string;
}

export function ChamferLink({ children, variant = "solid", arrow = "right", to, className, ...props }: ChamferLinkProps) {
  const external = props.target === "_blank";
  const Anchor = to ? Link : "a";
  return (
    <Anchor
      {...props}
      to={to as string}
      rel={external ? "noopener noreferrer" : props.rel}
      className={cn(
        "group relative inline-flex h-14 min-w-[13.75rem] items-center justify-between gap-8 px-6",
        "font-mono text-xs uppercase tracking-[0.14em] text-ember transition-colors duration-300 hover:text-ink focus-visible:text-ink",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 220 50"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path d={FRAME} fill={variant === "solid" ? "var(--ink-3)" : "none"} />
        <path
          d={FRAME}
          fill="var(--ember)"
          className="origin-left scale-x-0 transition-transform duration-500 [transition-timing-function:var(--ease-plate)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
        <path d={FRAME} fill="none" stroke="var(--ember)" strokeOpacity={variant === "solid" ? 1 : 0.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="relative">{children}</span>
      <Arrow direction={arrow} className="relative transition-transform duration-300 group-hover:translate-x-1" />
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </Anchor>
  );
}

export function Arrow({ direction = "right", className }: { direction?: "right" | "down" | "up-right"; className?: string }) {
  const rotate = direction === "down" ? "rotate-90" : direction === "up-right" ? "-rotate-45" : "";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 11"
      className={cn("h-[0.7rem] w-[0.9rem] shrink-0", rotate, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M0 5.35H13M8 10.35L13 5.35L8 0.35" />
    </svg>
  );
}
