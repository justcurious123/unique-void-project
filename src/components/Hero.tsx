
import React, { useEffect, useRef } from "react";
import { ArrowRight, Target, Map, ListChecks, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("opacity-100");
        entry.target.classList.remove("opacity-0", "translate-y-4");
      }
    }, {
      threshold: 0.1
    });
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 py-20 md:py-28 overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white pointer-events-none" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />
      
      <div ref={heroRef} className="relative max-w-6xl mx-auto transition-all duration-1000 opacity-0 translate-y-4">
        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Navigate Your Way to
              <span className="text-primary block mt-2">Meaningful Goals</span>
            </h1>
            
            <p className="text-xl text-foreground/70 leading-relaxed">
              WayToPoint is your personal goal-setting navigator: turning your ambitions into clear,
              actionable plans with AI-powered insights and step-by-step guidance.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="w-full text-base rounded-full bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-sm text-foreground/60 italic self-center">
                Free plan available. No credit card required.
              </p>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="relative h-full flex items-center justify-center">
            <img 
              src="/lovable-uploads/b495b358-dce2-4e09-a14f-148dcd9749a8.png" 
              alt="WayToPoint Goal Navigator" 
              className="h-64 md:h-80 mx-auto object-contain animate-float"
            />
          </div>
        </div>
        
        {/* Value Proposition Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Define Clear Goals</h3>
            <p className="text-foreground/70">
              Transform vague dreams into specific, achievable objectives with our guided setup process.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="glass-card p-6 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Your Roadmap</h3>
            <p className="text-foreground/70">
              Receive AI-generated action plans that break down your journey into manageable steps.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="glass-card p-6 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-foreground/70">
              Stay motivated with visual progress tracking and celebrate each milestone along the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
