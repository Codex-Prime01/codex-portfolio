import About from "@/components/About";
import GroundCovered from "@/components/GroundCovered";
import { NextPage } from "@/components/site/NextPage";

const AboutPage = () => (
  <div className="pt-[var(--nav-h)]">
    <About />
    <GroundCovered />
    <NextPage to="/work" label="Selected work" index="03" />
  </div>
);

export default AboutPage;
