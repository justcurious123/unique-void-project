
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Shield } from "lucide-react";

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsLoading(true);
      
      // First check if the user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to access this page",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      // Then check if the user has admin role
      const { error } = await supabase.rpc('has_role', {
        _role: 'admin'
      });
      
      if (error) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }
      
      setIsAdmin(true);
      setIsLoading(false);
    };
    
    checkAdminAccess();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl text-center">
          <div className="animate-pulse flex flex-col items-center">
            <Shield className="h-12 w-12 opacity-50 mb-4" />
            <h2 className="text-2xl font-semibold">Verifying access...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // We're redirecting anyway, so just render nothing
  }

  return (
    <div className="min-h-screen bg-pattern py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto glass-card p-4 sm:p-8 rounded-2xl">
        <header className="mb-6 flex items-center gap-3">
          <Shield className="h-7 w-7" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="users">
              User Management
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              Admin Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-4">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
