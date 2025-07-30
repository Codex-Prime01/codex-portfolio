import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award, Briefcase, GraduationCap, MapPin } from "lucide-react";

const Resume = () => {
  const experience = [
    {
      title: "Backend Developer Intern",
      company: "Federal College of Education (Special)",
      location: "Oyo State, Nigeria",
      period: "Current",
      type: "Internship"
    },
    {
      title: "Freelance Backend Developer",
      company: "Self-Employed",
      location: "Remote",
      period: "2+ Years",
      type: "Freelance"
    }
  ];

  const education = [
    {
      school: "Nigerian Army University",
      period: "2025 – Present",
      level: "Current Student"
    },
    {
      school: "Lord's Secondary School",
      period: "2008 – 2024",
      level: "Secondary Education"
    }
  ];

  const certifications = [
    {
      name: "Free Code Camp Scientific Computing with Python",
      issuer: "freeCodeCamp",
      status: "Completed"
    },
    {
      name: "Free Code Camp Responsive Web Design",
      issuer: "freeCodeCamp", 
      status: "Completed"
    },
    {
      name: "Cisco Python Essentials 1",
      issuer: "Cisco Networking Academy",
      status: "Completed"
    },
    {
      name: "Python Essentials 2",
      issuer: "Cisco Networking Academy",
      status: "Currently Studying"
    }
  ];

  const downloadResume = () => {
    // In a real implementation, this would download the actual resume PDF
    window.open('#resume-download', '_blank');
  };

  return (
    <section id="resume" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Resume</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            My professional journey and qualifications
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Experience */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold ml-4">Experience</h3>
              </div>
              
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full"></div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">{exp.title}</h4>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {exp.location}
                        </div>
                        <span>•</span>
                        <span>{exp.period}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${exp.type === 'Internship' ? 'border-secondary/30 text-secondary' : 'border-accent/30 text-accent'}
                        `}
                      >
                        {exp.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold ml-4">Education</h3>
              </div>
              
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-secondary/30 pl-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-secondary rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-lg">{edu.school}</h4>
                      <p className="text-secondary font-medium">{edu.level}</p>
                      <p className="text-sm text-muted-foreground">{edu.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Certifications */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold ml-4">Certifications</h3>
              </div>
              
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-4 border border-card-border rounded-lg hover:border-accent/30 transition-colors">
                    <h4 className="font-semibold text-lg mb-2">{cert.name}</h4>
                    <p className="text-accent font-medium mb-2">{cert.issuer}</p>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${cert.status === 'Completed' ? 'border-primary/30 text-primary' : 'border-secondary/30 text-secondary'}
                      `}
                    >
                      {cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Resume */}
            <div className="glass-card p-8 text-center hover-lift">
              <h3 className="text-2xl font-bold mb-4">
                <span className="gradient-text">Download Full Resume</span>
              </h3>
              <p className="text-muted-foreground mb-6">
                Get the complete PDF version of my resume with detailed information
              </p>
              <Button 
                className="btn-neon w-full"
                onClick={downloadResume}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Resume PDF
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6 hover-lift">
              <h3 className="text-xl font-bold mb-4 text-center">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">2+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">4+</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">4</div>
                  <div className="text-sm text-muted-foreground">Certifications</div>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">🇳🇬</div>
                  <div className="text-sm text-muted-foreground">Based in Nigeria</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;