import Projects from "@/components/Projects";
import { Marquee } from "@/components/site/Marquee";
import { NextPage } from "@/components/site/NextPage";

const WorkPage = () => (
  <div className="pt-[var(--nav-h)]">
    <Projects />
    <Marquee />
    <div className="pt-10 sm:pt-16">
      <NextPage to="/about" label="About" index="03" />
    </div>
  </div>
);

export default WorkPage;
