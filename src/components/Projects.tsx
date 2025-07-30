import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Code, Gamepad2, ShoppingBag, Gift } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Banking App",
      description: "A Python-based console bank app using OOP, with file storage and CLI interface.",
      technologies: ["Python", "JSON", "OOP"],
      github: "https://github.com/codex-prime01/bank-app",
      live: null,
      icon: Code,
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      id: 2,
      title: "Love Meter Game",
      description: "A fun HTML/CSS/JS game with animated questions, futuristic design, and scoring system.",
      technologies: ["HTML", "CSS", "JavaScript"],
      github: null,
      live: "https://codex-prime01.github.io/love-meter/",
      icon: Gamepad2,
      gradient: "from-secondary/20 to-accent/20"
    },
    {
      id: 3,
      title: "Velocity Wear Hub",
      description: "A futuristic and mobile-responsive e-commerce website for showcasing fashion items.",
      technologies: ["HTML", "CSS", "JS"],
      github: null,
      live: "https://velocity-wear-hub.lovable.app/",
      icon: ShoppingBag,
      gradient: "from-accent/20 to-primary/20"
    },
    {
      id: 4,
      title: "Birthday Website",
      description: "A creative HTML-based birthday greeting site.",
      technologies: ["HTML", "CSS", "JavaScript"],
      github: null,
      live: "https://codex-prime01.github.io/birthday-website/index.html",
      icon: Gift,
      gradient: "from-primary/20 to-accent/20"
    },
    {
      id: 5,
      title: "Rock, Paper, Scissors Game",
      description: "A fun command-line game where the user plays against the computer. Uses emoji icons for a playful experience.",
      technologies: ["Python", "Random module"],
      github: "https://github.com/codex-prime01/rock-paper-scissors-python",
      live: null,
      icon: Gamepad2,
      gradient: "from-secondary/20 to-primary/20"
    },
    {
      id: 6,
      title: "My Text Adventure Game",
      description: "A story-based Python game where player choices determine the outcome. Includes branching logic and replay option.",
      technologies: ["Python", "Conditionals", "Loops"],
      github: "https://github.com/codex-prime01/my--adventure-game",
      live: null,
      icon: Gamepad2,
      gradient: "from-accent/20 to-secondary/20"
    }
  ];

  return (
    <section id="projects" className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Here are some of my recent projects showcasing my backend development skills and creativity
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <div 
                key={project.id}
                className="glass-card p-6 hover-lift group animate-slide-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Project Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${project.gradient} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex space-x-2">
                    {project.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => window.open(project.github, '_blank')}
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                    )}
                    {project.live && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-secondary/30 text-secondary hover:bg-secondary/10"
                        onClick={() => window.open(project.live, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Project Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <Badge 
                      key={tech}
                      variant="outline" 
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {project.github && (
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => window.open(project.github, '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  )}
                  {project.live && (
                    <Button
                      className="flex-1 btn-neon"
                      onClick={() => window.open(project.live, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Want to see more?</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Check out my GitHub profile for more projects and contributions
            </p>
            <Button
              className="btn-neon"
              onClick={() => window.open('https://github.com/codex-prime01', '_blank')}
            >
              <Github className="w-5 h-5 mr-2" />
              Visit My GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;