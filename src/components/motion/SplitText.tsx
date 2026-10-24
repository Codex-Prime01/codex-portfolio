import { Fragment, useRef, type CSSProperties, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { STAGGER, useInView } from "@/lib/motion";

interface SplitTextProps {
  text: string;
  as?: ElementType;
  by?: "word" | "letter";
  delay?: number;
  stagger?: number;
  className?: string;
  id?: string;
  /** Let a parent decide when to play (e.g. after the intro lifts). */
  play?: boolean;
}

/**
 * Splits text into words or letters that rise in one after another.
 *
 * Screen readers get the plain string from a visually hidden copy; the
 * animated spans are hidden from them, so nothing is read letter by letter.
 */
export function SplitText({
  text,
  as: Tag = "span",
  by = "word",
  delay = 0,
  stagger,
  className,
  id,
  play,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref);
  const active = play ?? seen;
  const step = stagger ?? (by === "word" ? STAGGER.word : STAGGER.letter);

  const words = text.split(" ");
  let unit = 0;

  return (
    <Tag ref={ref} id={id} className={cn("split", active && "is-in", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          // The space sits between word boxes, not inside them, so lines can break there.
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {by === "word" ? (
                <span className="split-unit" style={{ "--d": `${delay + unit++ * step}ms` } as CSSProperties}>
                  {word}
                </span>
              ) : (
                [...word].map((char, c) => (
                  <span key={c} className="split-unit" style={{ "--d": `${delay + unit++ * step}ms` } as CSSProperties}>
                    {char}
                  </span>
                ))
              )}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
