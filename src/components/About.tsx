import { Badge } from "@/components/ui/badge";
import { Code, Server, Database, GitBranch, FileText, Palette } from "lucide-react";

const About = () => {
  const skills = [
    { name: "Python", icon: Code, level: "Advanced" },
    { name: "Object-Oriented Programming", icon: Server, level: "Advanced" },
    { name: "JSON", icon: Database, level: "Intermediate" },
    { name: "File Handling", icon: FileText, level: "Advanced" },
    { name: "Git & GitHub", icon: GitBranch, level: "Intermediate" },
    { name: "HTML, CSS, JavaScript", icon: Palette, level: "Basic Frontend" },
    { name: "Flask", icon: Server, level: "Learning" }
  ];

  return (
    <section id="about" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">About Me</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* About Text */}
          <div className="glass-card p-8 hover-lift animate-fade-in-left">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Hi, I'm <span className="text-primary font-semibold">Samaila Peter</span> — a self-taught backend developer 
              with over <span className="text-secondary font-semibold">2 years of freelance experience</span>. 
              I specialize in building clean and functional backend systems using 
              <span className="text-accent font-semibold"> Python</span> and object-oriented programming.
            </p>
            
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              I've worked on web apps, CLI tools, and e-commerce systems. Currently, I'm interning at the 
              <span className="text-primary font-semibold"> Federal College of Education (Special), Oyo State</span>, 
              while also working on expanding my backend skills into frameworks like 
              <span className="text-secondary font-semibold"> Flask</span> and 
              <span className="text-accent font-semibold"> FastAPI</span>.
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                🇳🇬 Based in Nigeria
              </Badge>
              <Badge variant="outline" className="border-secondary/30 text-secondary">
                Also known as Codex Prime
              </Badge>
              <Badge variant="outline" className="border-accent/30 text-accent">
                Pete
              </Badge>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="gradient-text">Skills & Tools</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div 
                    key={skill.name}
                    className="glass-card p-4 hover-lift group cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{skill.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${skill.level === 'Advanced' ? 'border-primary/30 text-primary' : ''}
                          ${skill.level === 'Intermediate' ? 'border-secondary/30 text-secondary' : ''}
                          ${skill.level === 'Learning' ? 'border-accent/30 text-accent' : ''}
                          ${skill.level === 'Basic Frontend' ? 'border-muted-foreground/30 text-muted-foreground' : ''}
                        `}
                      >
                        {skill.level}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;