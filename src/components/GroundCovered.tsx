import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Corners } from "@/components/site/Intro";
import { StatusPlate } from "@/components/site/StatusPlate";
import { NigeriaMap } from "@/components/visual/NigeriaMap";
import { ChequerSeam } from "@/components/visual/ChequerSeam";
import { PROFILE } from "@/data/profile";

/**
 * (03) Ground covered — the places behind the work, on a halftone map.
 * The F1 brief's "season so far" circuit, rebuilt around Perey's own route.
 */
const GroundCovered = () => (
  <section id="ground" aria-labelledby="ground-title" className="relative isolate overflow-hidden bg-ink pb-14 pt-[20svh] sm:pb-28 sm:pt-[30svh]">
    {/* About's surface carries into this block and breaks apart. */}
    <ChequerSeam carry="--ink-2" accent="--ember" />

    <div className="shell grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col justify-between gap-10 lg:col-span-4">
        <div>
          <p className="label">
            <span className="text-ember">(03)</span> — Map
          </p>
          <h2 id="ground-title" className="mt-5" aria-label="Ground covered.">
            <SplitText
              by="letter"
              stagger={35}
              text="Ground"
              className="display block text-[clamp(2.75rem,9vw,7rem)] text-ember"
            />
            <SplitText
              by="letter"
              stagger={35}
              delay={250}
              text="covered."
              className="display block text-[clamp(2.75rem,9vw,7rem)] text-ember [&_.split-unit:last-child]:text-paper"
            />
          </h2>
          <Reveal variant="rule" delay={300} className="mt-6 h-0.5 w-8 bg-ember" />
          <SplitText
            as="p"
            delay={380}
            stagger={30}
            text="Three places, one thread: where the school years, the client work and the degree happened."
            className="mt-6 block max-w-[30ch] text-base leading-snug text-paper/80 sm:text-lg"
          />
        </div>

        <StatusPlate
          rows={[
            { figure: PROFILE.cgpa, label: "CGPA at NAUB" },
            { figure: "10", label: "projects here" },
            { figure: "2023", label: "freelance since" },
          ]}
        />
      </div>

      <Reveal className="relative p-3 sm:p-6 lg:col-span-8">
        <Corners className="text-paper/30" />
        <NigeriaMap />
        <p className="label mt-3 flex flex-wrap justify-between gap-2">
          <span>Stylised map · positions approximate</span>
          <span className="hidden lg:inline">Hover the map — the reticle takes a reading</span>
        </p>
      </Reveal>
    </div>
  </section>
);

export default GroundCovered;
