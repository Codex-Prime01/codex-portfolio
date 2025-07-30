import { Github, Mail, Phone, Video, Heart, Code } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/codex-prime01",
      color: "hover:text-primary"
    },
    {
      name: "Email",
      icon: Mail,
      url: "mailto:samailaperey2@gmail.com",
      color: "hover:text-secondary"
    },
    {
      name: "Phone",
      icon: Phone,
      url: "tel:08022487875",
      color: "hover:text-accent"
    },
    {
      name: "TikTok",
      icon: Video,
      url: "https://tiktok.com/@codexprime_",
      color: "hover:text-primary"
    }
  ];

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Projects", href: "#projects" },
    { name: "Resume", href: "#resume" },
    { name: "Contact", href: "#contact" }
  ];

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.slice(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="glass-card border-t border-card-border mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-xl gradient-text">Samaila Peter</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Backend Developer specializing in Python. Building efficient and scalable solutions 
              with clean, maintainable code.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={link.name === 'GitHub' || link.name === 'TikTok' ? '_blank' : undefined}
                    rel={link.name === 'GitHub' || link.name === 'TikTok' ? 'noopener noreferrer' : undefined}
                    className={`p-2 rounded-lg bg-muted/10 text-muted-foreground ${link.color} transition-colors hover-lift`}
                    aria-label={link.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Get In Touch</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>📧 samailaperey2@gmail.com</p>
              <p>📱 08022487875</p>
              <p>📍 Nigeria (Remote Available)</p>
              <p>💼 Open for Freelance Projects</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-card-border mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Samaila Peter (Codex Prime). All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>using React & TypeScript</span>
            </div>
          </div>
          
          {/* Fun Footer Note */}
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              🚀 Ready to turn your ideas into code? Let's build something amazing together! 
              <span className="text-primary ml-1">Also known as Pete 😎</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;