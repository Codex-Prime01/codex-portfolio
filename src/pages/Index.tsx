import Hero from "@/components/Hero";
import { usePageReady } from "@/components/site/Layout";

/** Home: just the stage. Everything else has its own page now. */
const Index = () => <Hero ready={usePageReady()} />;

export default Index;
