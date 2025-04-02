
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Check admin status if user is logged in
        if (currentSession?.user) {
          // Use setTimeout to avoid deadlocks with Supabase auth state
          setTimeout(async () => {
            try {
              const { data: hasRoleData, error } = await (supabase.rpc as any)('has_role', {
                _role: 'admin'
              });
              setIsAdmin(hasRoleData === true && !error);
            } catch (err) {
              console.error("Error checking admin role:", err);
              setIsAdmin(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Check admin status if user is logged in
        if (data.session?.user) {
          try {
            const { data: hasRoleData, error } = await (supabase.rpc as any)('has_role', {
              _role: 'admin'
            });
            setIsAdmin(hasRoleData === true && !error);
          } catch (err) {
            console.error("Error checking admin role:", err);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out"
      });
      
      // Force navigation to root
      navigate('/', { replace: true });
      
      // Force reload after a brief delay to clear any cached states
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
