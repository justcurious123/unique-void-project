import React from "react";
import { Link } from "react-router-dom";
const Footer: React.FC = () => {
  return <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img alt="WayToPoint Logo" className="h-10 mr-2" src="/lovable-uploads/826da630-20ad-4efb-8b6c-dae3cb1940dd.png" />
              <span className="text-xl font-medium tracking-tight">WayToPoint</span>
            </Link>
            <p className="text-foreground/70 text-sm">
              Your personal navigator for life's journey. We help you transform dreams into achievable goals.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Products</h3>
            <ul className="space-y-2">
              {["Features", "Pricing", "Gallery", "Resources"].map(item => <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>)}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map(item => <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>)}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2">
              {["Terms", "Privacy", "Cookies", "Licenses"].map(item => <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>)}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 mt-12 border-t border-border">
          <p className="text-sm text-foreground/70">
            © {new Date().getFullYear()} WayToPoint. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {["Twitter", "Instagram", "LinkedIn", "GitHub"].map(item => {})}
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;