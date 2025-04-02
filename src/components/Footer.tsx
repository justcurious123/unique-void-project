
import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border px-6 py-16 rounded-none">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Company */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/9c9ecc20-aa31-4cfb-8642-b9430ae12999.png" 
                alt="WayToPoint Logo" 
                className="h-8 mr-2" 
              />
              <span className="text-xl font-medium tracking-tight">WayToPoint</span>
            </div>
            <p className="text-sm text-foreground/70">
              Your personal navigator for life's biggest goals.
            </p>
          </div>
          
          {/* Column 2: Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/70">
            © {new Date().getFullYear()} WayToPoint. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {[
              { name: "Twitter", icon: <Twitter size={18} /> },
              { name: "Instagram", icon: <Instagram size={18} /> },
              { name: "LinkedIn", icon: <Linkedin size={18} /> },
              { name: "GitHub", icon: <Github size={18} /> }
            ].map((item) => (
              <a
                key={item.name}
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors"
                aria-label={item.name}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
