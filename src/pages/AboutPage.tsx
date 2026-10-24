import About from "@/components/About";
import GroundCovered from "@/components/GroundCovered";
import { NextPage } from "@/components/site/NextPage";

const AboutPage = () => (
  <div className="pt-[var(--nav-h)]">
    <About />
    <GroundCovered />
    <NextPage to="/journey" label="Journey" index="04" />
  </div>
);

export default AboutPage;
