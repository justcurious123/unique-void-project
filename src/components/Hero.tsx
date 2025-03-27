import React, { useEffect, useRef } from "react";
import { ArrowDown, Target, Map, ListChecks, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section className="relative min-h-screen flex flex-col justify-center px-6 py-20 md:py-28 overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white pointer-events-none" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />
      
      <div ref={heroRef} className="relative max-w-6xl mx-auto text-center transition-all duration-1000 opacity-0 translate-y-4">
        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Stop Dreaming About Your Future.
              <span className="text-primary block mt-2">Start Building It.</span>
            </h1>
            
            <p className="text-lg text-foreground/70 leading-relaxed">
              Feeling stuck on how to reach your biggest ambitions? Whether it's buying your first home, 
              securing a comfortable retirement, planning that dream vacation, or sorting out your estate, 
              the path forward often feels unclear and overwhelming. WayToPoint replaces confusion with a clear, 
              intelligently-generated plan tailored just for you.
            </p>
            
            <p className="text-lg text-foreground/80 leading-relaxed">
              You know <em>what</em> you want, eventually. But figuring out the <em>how</em>, the <em>when</em>, 
              and the <em>what next</em>? That's where plans fall apart. You deserve a smarter way.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <Button size="lg" className="text-base px-8 py-6 rounded-full bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md">
                Try Setting Your First Goal Now
              </Button>
              <p className="text-sm text-foreground/60 italic self-center">It's easier than you think. 1 - 2 - 3</p>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="relative h-full flex items-center justify-center">
            <img src="/lovable-uploads/b495b358-dce2-4e09-a14f-148dcd9749a8.png" alt="WayToPoint Logo" className="h-64 md:h-80 mx-auto object-contain animate-float" />
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h3 className="text-2xl font-semibold text-center mb-12">
            Your Personal Navigator for Life's Journey
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-subtle hover:shadow-md transition-all">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-center">Define What Matters Most</h4>
              <p className="text-foreground/70 text-center">
                Go beyond vague ideas. Our guided process helps you articulate the specific outcomes you desire.
              </p>
            </div>
            
            {/* Benefit 2 */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-subtle hover:shadow-md transition-all">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-center">Get Your Personalized Roadmap</h4>
              <p className="text-foreground/70 text-center">
                Receive a clear, step-by-step action plan, intelligently crafted to bridge the gap between where you are and where you want to be.
              </p>
            </div>
            
            {/* Benefit 3 */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-subtle hover:shadow-md transition-all">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <ListChecks className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-center">Set Meaningful Milestones</h4>
              <p className="text-foreground/70 text-center">
                Break down daunting goals into achievable steps that make sense for your timeline and resources.
              </p>
            </div>
            
            {/* Benefit 4 */}
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-subtle hover:shadow-md transition-all">
              <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <BarChart className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-center">Track Your Progress, Effortlessly</h4>
              <p className="text-foreground/70 text-center">
                See how far you've come and what's next. WayToPoint keeps you focused, adapting as your life evolves.
              </p>
            </div>
          </div>
        </div>
        
        {/* Reinforcement Statement */}
        <div className="mt-16 max-w-3xl mx-auto">
          <p className="text-xl text-center text-foreground/80 italic">
            Imagine feeling confident about your financial future. Picture unlocking the door to your new home. 
            Envision enjoying retirement without worry. WayToPoint isn't just another planning tool; 
            it's your partner in turning those visions into reality, powered by smart technology designed for <em>your</em> success.
          </p>
        </div>
        
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hidden md:block">
          <button onClick={scrollToFeatures} aria-label="Scroll down" className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-subtle hover:shadow-md transition-all">
            <ArrowDown className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>
    </section>;
};
export default Hero;