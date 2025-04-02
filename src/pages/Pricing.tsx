
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan, updateSubscription, isLoading } = useSubscription();

  const handleSelectPlan = async (planId: 'free' | 'monthly' | 'annual') => {
    if (!user) {
      toast.info("Please sign in to select a plan");
      navigate("/auth", { state: { redirectTo: "/pricing" } });
      return;
    }

    // For a real app, this would integrate with Stripe or another payment processor
    // For this demo, we'll just update the subscription in the database
    if (await updateSubscription(planId)) {
      toast.success(`Successfully updated to ${planId} plan!`);
    }
  };

  return (
    <div className="min-h-screen">
      <main>
        <section className="py-24 px-6 bg-gradient-to-b from-white to-primary/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
                Pricing Plans
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
                Choose the plan that's right for you
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                WayToPoint offers flexible options to support your goal achievement journey, from free to premium plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Free Plan */}
              <Card className={`border flex flex-col ${currentPlan?.plan === 'free' ? 'border-primary shadow-md' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-2xl font-semibold">Free</CardTitle>
                    {currentPlan?.plan === 'free' && <Badge variant="outline" className="bg-primary/20 text-primary">Current Plan</Badge>}
                  </div>
                  <div>
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-foreground/60 ml-1">/forever</span>
                  </div>
                  <p className="text-foreground/60 mt-3">Get started with the basics</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>1 active goal</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>5 daily chat messages</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Goal progress tracking</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>AI-generated tasks</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-foreground/50">Multiple goals</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={currentPlan?.plan === 'free' ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleSelectPlan('free')}
                    disabled={currentPlan?.plan === 'free' || isLoading}
                  >
                    {currentPlan?.plan === 'free' ? 'Current Plan' : 'Select Free Plan'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Monthly Plan */}
              <Card className={`border flex flex-col ${currentPlan?.plan === 'monthly' ? 'border-primary shadow-md' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-2xl font-semibold">Monthly</CardTitle>
                    {currentPlan?.plan === 'monthly' && <Badge variant="outline" className="bg-primary/20 text-primary">Current Plan</Badge>}
                  </div>
                  <div>
                    <span className="text-3xl font-bold">$1</span>
                    <span className="text-foreground/60 ml-1">/month</span>
                  </div>
                  <p className="text-foreground/60 mt-3">Perfect for focused goal-setters</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>5</strong> active goals</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>25</strong> daily chat messages</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Detailed progress analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Enhanced AI guidance</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={currentPlan?.plan === 'monthly' ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleSelectPlan('monthly')}
                    disabled={currentPlan?.plan === 'monthly' || isLoading}
                  >
                    {currentPlan?.plan === 'monthly' ? 'Current Plan' : 'Select Monthly Plan'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Annual Plan */}
              <Card className={`border flex flex-col ${currentPlan?.plan === 'annual' ? 'border-primary shadow-md' : 'border-primary/40'}`}>
                <CardHeader className="bg-primary/5 rounded-t-lg">
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-2xl font-semibold text-primary">Annual</CardTitle>
                    <Badge className="bg-primary text-white">Best Value</Badge>
                    {currentPlan?.plan === 'annual' && <Badge variant="outline" className="bg-primary/20 text-primary ml-2">Current Plan</Badge>}
                  </div>
                  <div>
                    <span className="text-3xl font-bold">$10</span>
                    <span className="text-foreground/60 ml-1">/year</span>
                  </div>
                  <p className="text-foreground/60 mt-3">For ambitious achievers</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>Unlimited</strong> goals</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>Unlimited</strong> daily chat messages</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Advanced progress analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Premium AI features</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Priority support & updates</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={currentPlan?.plan === 'annual' ? "outline" : "default"}
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleSelectPlan('annual')}
                    disabled={currentPlan?.plan === 'annual' || isLoading}
                  >
                    {currentPlan?.plan === 'annual' ? 'Current Plan' : 'Select Annual Plan'}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-foreground/60 max-w-2xl mx-auto">
                All plans include access to our AI-powered guidance system. You can upgrade, downgrade, or cancel your plan at any time. For more details, contact our support team.
              </p>
            </div>

            <div className="flex justify-center mt-12">
              <Button variant="ghost" className="flex items-center" onClick={() => navigate('/')}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
