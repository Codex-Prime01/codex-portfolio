import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/lib/motion";

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children?: ReactNode;
  play?: boolean;
  /** "rule" draws a horizontal line in from the left instead. */
  variant?: "block" | "rule";
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ as: Tag = "div", delay = 0, className, children, play, variant = "block" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref);
  const active = play ?? seen;

  return (
    <Tag
      ref={ref}
      className={cn(variant === "rule" ? "rule" : "reveal", active && "is-in", className)}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      aria-hidden={variant === "rule" ? true : undefined}
    >
      {children}
    </Tag>
  );
}
