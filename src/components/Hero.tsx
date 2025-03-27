
import React, { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
          entry.target.classList.remove("opacity-0", "translate-y-4");
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white pointer-events-none" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />
      
      <div
        ref={heroRef}
        className="relative max-w-5xl mx-auto text-center transition-all duration-1000 opacity-0 translate-y-4 pt-20"
      >
        <div className="inline-block mb-6">
          <img 
            src="/lovable-uploads/e469a406-0cc2-4a24-a75c-353e5c1de348.png" 
            alt="WayToPoint Logo" 
            className="h-28 md:h-32 mx-auto mb-4"
          />
        </div>
        
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
          Introducing a new standard
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6">
          Crafted with precision
          <br />
          <span className="text-primary">designed for you</span>
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10">
          A minimalist approach to design that focuses on what matters most—your experience.
          Every pixel, every interaction, thoughtfully considered.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 rounded-full bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md">
            Get Started
          </button>
          <button className="px-8 py-3 rounded-full bg-secondary text-foreground font-medium transition-all hover:bg-secondary/80">
            Learn More
          </button>
        </div>
        
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hidden md:block">
          <button 
            onClick={scrollToFeatures}
            aria-label="Scroll down"
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-subtle hover:shadow-md transition-all"
          >
            <ArrowDown className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
