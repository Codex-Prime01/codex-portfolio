import { EmberLink } from "@/components/site/EmberBlock";
import { Arrow } from "@/components/site/ChamferLink";

/** The foot of a page: one big link onward, so pages read as a sequence. */
export function NextPage({ to, label, index }: { to: string; label: string; index: string }) {
  return (
    <div className="shell pb-10 sm:pb-16">
      <EmberLink
        to={to}
        className="group flex items-end justify-between gap-6 border-t border-line pt-6 transition-colors hover:border-ember"
      >
        <span>
          <span className="label block">
            <span className="text-ember">({index})</span> — Next
          </span>
          <span className="display mt-3 block text-[clamp(2.5rem,9vw,7rem)] text-paper transition-colors group-hover:text-ember">
            {label}
          </span>
        </span>
        <Arrow className="mb-3 h-6 w-8 text-ember transition-transform duration-500 ease-out group-hover:translate-x-2 sm:h-8 sm:w-10" />
      </EmberLink>
    </div>
  );
}
