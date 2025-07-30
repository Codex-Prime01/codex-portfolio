import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Github, Video, Send, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { toast } = useToast();

  const contactInfo = [
    {
      label: "Email",
      value: "samailaperey2@gmail.com",
      icon: Mail,
      link: "mailto:samailaperey2@gmail.com",
      color: "text-primary"
    },
    {
      label: "Phone",
      value: "08022487875",
      icon: Phone,
      link: "tel:08022487875",
      color: "text-secondary"
    },
    {
      label: "GitHub",
      value: "codex-prime01",
      icon: Github,
      link: "https://github.com/codex-prime01",
      color: "text-accent"
    },
    {
      label: "TikTok",
      value: "@codexprime_",
      icon: Video,
      link: "https://tiktok.com/@codexprime_",
      color: "text-primary"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Portfolio Contact: ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    const mailtoLink = `mailto:samailaperey2@gmail.com?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    toast({
      title: "Email Client Opened! 📧",
      description: "Your default email client should open with the message ready to send.",
    });
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to build something amazing together? Let's connect and discuss your next project!
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="glass-card p-8 hover-lift">
              <h3 className="text-2xl font-bold mb-6">
                <span className="gradient-text">Contact Information</span>
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={index}
                      href={contact.link}
                      target={contact.label === 'GitHub' || contact.label === 'TikTok' ? '_blank' : undefined}
                      rel={contact.label === 'GitHub' || contact.label === 'TikTok' ? 'noopener noreferrer' : undefined}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-card-border hover:border-primary/30 transition-all hover-lift group"
                    >
                      <div className={`p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors`}>
                        <Icon className={`w-6 h-6 ${contact.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{contact.label}</p>
                        <p className={`${contact.color} group-hover:underline`}>
                          {contact.value}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Location & Availability */}
            <div className="glass-card p-8 hover-lift">
              <h3 className="text-xl font-bold mb-4">
                <span className="gradient-text">Location & Availability</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Nigeria (Remote Work Available)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    Open to Freelance
                  </Badge>
                  <Badge variant="outline" className="border-secondary/30 text-secondary">
                    Remote Work
                  </Badge>
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    Part-time Projects
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8 hover-lift">
            <h3 className="text-2xl font-bold mb-6">
              <span className="gradient-text">Send me a message</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  className="bg-input/50 border-card-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  className="bg-input/50 border-card-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project or just say hello!"
                  rows={5}
                  required
                  className="bg-input/50 border-card-border focus:border-primary resize-none"
                />
              </div>

              <Button type="submit" className="btn-neon w-full group">
                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Send Message
              </Button>
            </form>

            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Pro tip:</strong> Include details about your project timeline and budget for faster response!
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Let's Build Something Great!</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Whether you need a robust backend system, want to collaborate on an existing project, 
              or just want to chat about Python development, I'm here to help.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                className="btn-neon"
                onClick={() => window.open('mailto:samailaperey2@gmail.com', '_blank')}
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Me
              </Button>
              <Button
                variant="outline"
                className="border-secondary/30 text-secondary hover:bg-secondary/10"
                onClick={() => window.open('https://github.com/codex-prime01', '_blank')}
              >
                <Github className="w-5 h-5 mr-2" />
                Follow on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;