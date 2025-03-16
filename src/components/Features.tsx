
import React, { useEffect, useRef } from "react";
import { Layers, Shield, Zap, Sparkles } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  const featureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }, delay);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (featureRef.current) {
      observer.observe(featureRef.current);
    }

    return () => {
      if (featureRef.current) {
        observer.unobserve(featureRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={featureRef}
      className="glass-card rounded-2xl p-6 transition-all duration-700 opacity-0 translate-y-10"
    >
      <div className="p-3 bg-primary/10 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Layers className="h-6 w-6 text-primary" />,
      title: "Thoughtful Design",
      description: "Every element has been crafted with attention to detail and purpose.",
      delay: 0,
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Strong Foundation",
      description: "Built on a solid foundation that ensures stability and reliability.",
      delay: 100,
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Lightning Fast",
      description: "Optimized performance that provides a smooth and responsive experience.",
      delay: 200,
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Refined Experience",
      description: "Meticulously crafted interactions that delight at every step.",
      delay: 300,
    },
  ];

  return (
    <section id="features" className="py-24 px-6 relative" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <div 
          ref={titleRef} 
          className="text-center mb-16 transition-all duration-700 opacity-0 translate-y-10"
        >
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-secondary text-foreground/80 text-xs font-medium tracking-wide">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
            Designed with purpose
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Every feature has been thoughtfully considered, from the subtle animations to the intuitive interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
