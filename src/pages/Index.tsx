
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // Add a class for custom background pattern
    document.body.classList.add("bg-pattern");

    // Check if user is logged in and redirect to dashboard if they are
    if (!isLoading && user) {
      navigate("/dashboard");
    }
    
    return () => {
      document.body.classList.remove("bg-pattern");
    };
  }, [navigate, user, isLoading]);

  // Show landing page only for non-authenticated users
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg text-foreground/60">Loading...</p>
      </div>
    </div>;
  }

  if (user) {
    // This should be temporary during navigation
    return null;
  }

  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        
        {/* How It Works Section */}
        <section id="features" className="py-24 px-6 relative bg-gradient-to-b from-white to-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
                How It Works
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
                Your Journey to Achievement
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                WayToPoint makes goal achievement simple with a powerful three-step process, supported by AI-powered insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-primary text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">Define Your Goal</h3>
                <p className="text-foreground/70 text-center">
                  Use our guided process to clarify what you truly want to achieve, whether it's financial freedom, a career move, or personal growth.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-primary text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">Generate Your Plan</h3>
                <p className="text-foreground/70 text-center">
                  Our AI analyzes your goal and creates a personalized roadmap with specific tasks, milestones, and resources tailored to your situation.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="relative">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-primary text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">Take Action & Track Progress</h3>
                <p className="text-foreground/70 text-center">
                  Work through your customized plan with confidence, tracking your progress and adjusting as needed with ongoing AI guidance.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonial/Use Cases Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
                Success Stories
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
                What You Can Achieve
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                WayToPoint helps people reach diverse goals, from financial milestones to personal growth.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Use Case 1 */}
              <div className="glass-card p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Home Ownership</h3>
                <p className="text-foreground/70 mb-4">
                  "WayToPoint broke down the intimidating process of buying my first home into manageable steps. From saving for a down payment to navigating mortgage options, I always knew what to do next."
                </p>
                <p className="text-primary font-medium">- Sarah T.</p>
              </div>
              
              {/* Use Case 2 */}
              <div className="glass-card p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Debt Freedom</h3>
                <p className="text-foreground/70 mb-4">
                  "I was drowning in student debt until WayToPoint helped me create a realistic payment plan. The progress tracking kept me motivated, and I'm now completely debt-free!"
                </p>
                <p className="text-primary font-medium">- Michael R.</p>
              </div>
              
              {/* Use Case 3 */}
              <div className="glass-card p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Career Transition</h3>
                <p className="text-foreground/70 mb-4">
                  "Changing careers at 40 seemed impossible until WayToPoint helped me break it down. With structured steps for skills development and networking, I made a successful transition."
                </p>
                <p className="text-primary font-medium">- David L.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
              Ready to Chart Your Course?
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-10">
              Don't just dream about your future. Start building it today with WayToPoint's powerful goal navigation system.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-base rounded-full bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#features">
                
              </Link>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
