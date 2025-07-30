import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadResume = () => {
    // In a real implementation, this would download the actual resume
    window.open('#', '_blank');
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/80"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="floating absolute top-20 left-10 w-2 h-2 bg-primary rounded-full pulse-glow"></div>
        <div className="floating absolute top-40 right-20 w-1 h-1 bg-secondary rounded-full pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="floating absolute bottom-32 left-1/4 w-3 h-3 bg-accent rounded-full pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-slide-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Samaila Peter</span>
          </h1>
          
          <div className="text-xl md:text-2xl mb-4 text-muted-foreground">
            <span className="text-primary">Backend Developer</span> • <span className="text-secondary">Web Developer</span>
          </div>
          
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-muted-foreground">
            I build <span className="text-primary font-semibold">efficient</span>, 
            <span className="text-secondary font-semibold"> scalable</span>, and 
            <span className="text-accent font-semibold"> clean</span> backend systems using Python.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToProjects}
              className="btn-neon group"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              View My Projects
            </Button>
            
            <Button 
              onClick={downloadResume}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary hover-lift"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;