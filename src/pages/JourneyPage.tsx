import Resume from "@/components/Resume";
import { NextPage } from "@/components/site/NextPage";

const JourneyPage = () => (
  <div className="pt-[var(--nav-h)]">
    <Resume />
    <NextPage to="/contact" label="Contact" index="05" />
  </div>
);

export default JourneyPage;
