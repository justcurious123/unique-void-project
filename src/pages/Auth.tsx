
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, [navigate]);

  // Set up auth state listener for session changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        console.log("Login successful:", data.session);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate("/dashboard");
      } else {
        console.log("Attempting to sign up with:", email);
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        console.log("Signup response:", data);
        
        if (data.user && !data.session) {
          // Email confirmation required
          toast({
            title: "Registration successful",
            description: "Please check your email to confirm your account",
          });
        } else if (data.session) {
          // Auto-confirmed, redirect to dashboard
          toast({
            title: "Registration successful",
            description: "Welcome to WayToPoint!",
          });
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error.message);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a timeout to reset loading state after 8 seconds
  // This prevents the UI from being stuck if there's a network issue
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
        toast({
          title: "Connection issue",
          description: "There might be a problem with your connection. Please try again.",
          variant: "destructive",
        });
      }, 8000);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-pattern">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-2xl font-medium tracking-tight">
            {isLogin ? "Login to your account" : "Create an account"}
          </h1>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="bg-white/50"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-white/50"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : isLogin ? (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
