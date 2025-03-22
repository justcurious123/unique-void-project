
import React, { useEffect } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  useEffect(() => {
    // Add a class for custom background pattern
    document.body.classList.add("bg-pattern");
    return () => {
      document.body.classList.remove("bg-pattern");
    };
  }, []);

  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Features />
        
        {/* Gallery Section Placeholder */}
        <section id="gallery" className="py-24 px-6 bg-secondary/50">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
              Gallery
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
              See it in action
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-12">
              Explore our showcase of beautiful, minimal designs that demonstrate our attention to detail.
            </p>
            
            {/* Gallery grid placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={item}
                  className="aspect-video bg-white/80 rounded-lg shadow-subtle overflow-hidden"
                >
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                    <span className="text-foreground/40">Gallery Item {item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
                  About Us
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
                  Our philosophy
                </h2>
                <p className="text-lg text-foreground/70 mb-6">
                  We believe that great design is not just about how something looks, but how it works. Every detail matters, from the subtle animations to the thoughtful interactions.
                </p>
                <p className="text-lg text-foreground/70 mb-6">
                  Our approach is guided by the principles of simplicity, clarity, and efficiency. We strip away the unnecessary to focus on what truly matters—creating experiences that feel intuitive and natural.
                </p>
                <button className="px-6 py-2.5 rounded-full bg-secondary text-foreground font-medium transition-all hover:bg-secondary/80">
                  Learn More
                </button>
              </div>
              
              <div className="bg-primary/5 rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-foreground/40">About Image Placeholder</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-24 px-6 bg-secondary/50">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
              Get in touch
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-10">
              Have a question or want to learn more? We'd love to hear from you.
            </p>
            
            <form className="glass-card rounded-2xl p-8 space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your message"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-8 py-3 rounded-lg bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
