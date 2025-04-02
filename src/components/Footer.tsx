import React from "react";
import { Link } from "react-router-dom";
const Footer: React.FC = () => {
  return <footer className="border-t border-border px-6 py-[64px] rounded-none">
      <div className="max-w-7xl mx-auto">
        

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