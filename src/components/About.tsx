import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "@/components/Projects";
import { PROFILE, SKILLS, STATS } from "@/data/profile";

const About = () => {
  const facts = [
    { term: "Based in", detail: PROFILE.location },
    { term: "Availability", detail: PROFILE.availability },
    { term: "Looking for", detail: PROFILE.lookingFor },
    { term: "Languages", detail: PROFILE.languages.join(", ") },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="relative bg-ink-2 py-14 sm:py-32">
      <div className="shell">
        <SectionHead index="03" title="About" id="about-title" aside={PROFILE.fullName} />

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <SplitText
              as="p"
              stagger={35}
              text="I build and ship complete products — from the database and the API to the page the user clicks."
              className="block text-balance text-2xl font-medium leading-[1.15] text-paper sm:text-4xl lg:text-5xl"
            />
          </div>

          <div className="space-y-6 text-base leading-relaxed sm:text-lg text-paper/75 lg:col-span-5 lg:col-start-8">
            {PROFILE.about.map((paragraph, i) => (
              <Reveal as="p" key={i} delay={i * 120}>
                {paragraph}
              </Reveal>
            ))}
          </div>
        </div>

        <dl className="mt-12 sm:mt-20 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <Reveal key={fact.term} delay={i * 80} className="bg-ink-2 py-5 pr-6 sm:px-6 lg:first:pl-0">
              <dt className="label">{fact.term}</dt>
              <dd className="mt-2 text-paper">{fact.detail}</dd>
            </Reveal>
          ))}
        </dl>

        {/* Numbers */}
        <ul className="mt-12 sm:mt-20 grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <li key={stat.label} className="border-b border-line py-8 pr-4 even:pl-4 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
              <p className="flex items-baseline gap-1">
                <SplitText by="letter" text={stat.value} delay={i * 120} className="display block text-5xl text-paper sm:text-7xl" />
                {stat.unit && <span className="font-mono text-sm text-ember">{stat.unit}</span>}
              </p>
              <Reveal delay={200 + i * 120}>
                <p className="label mt-3 max-w-[18ch] leading-relaxed">{stat.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Skills */}
        <div className="mt-14 sm:mt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SplitText as="h3" text="Toolbox" by="letter" className="display block text-4xl text-paper sm:text-7xl" />
            <p className="label">Grouped as on my résumé</p>
          </div>
          <ul className="border-t border-line">
            {SKILLS.map((group, i) => (
              <Reveal
                as="li"
                key={group.group}
                delay={i * 70}
                className="group grid gap-3 border-b border-line py-6 transition-colors duration-500 hover:bg-ink-3 sm:grid-cols-[14rem_1fr] sm:items-baseline sm:px-3"
              >
                <h4 className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-dim group-hover:text-ember">
                  <span className="text-ember">{String(i + 1).padStart(2, "0")}</span>
                  {group.group}
                </h4>
                <p className="text-base leading-relaxed text-paper sm:text-xl">
                  {group.items.map((item, j) => (
                    <span key={item}>
                      <span className="whitespace-nowrap">{item}</span>
                      {j < group.items.length - 1 && (
                        <>
                          <span className="sr-only">,</span>
                          {/* The real space is the line-break opportunity between items. */}{" "}
                          <span className="pr-2 text-ember/60" aria-hidden="true">/</span>
                        </>
                      )}
                    </span>
                  ))}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
