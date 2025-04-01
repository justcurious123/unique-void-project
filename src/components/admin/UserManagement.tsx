
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRole } from "./UserRole";
import { Search, UserPlus, Shield, User as UserIcon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type User = {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('add_role_to_user', {
        target_user_id: userId,
        target_role: 'admin'
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Admin role added successfully"
      });
      
      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error("Error adding admin role:", error);
      toast({
        title: "Error",
        description: "Failed to add admin role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('remove_role_from_user', {
        target_user_id: userId,
        target_role: 'admin'
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Admin role removed successfully"
      });
      
      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error("Error removing admin role:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin role. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <span>User Management</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.includes('admin') ? (
                          <Badge variant="default" className="bg-primary flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            User
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline">No role</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'PPP')}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRole 
                      user={user}
                      onAddAdmin={() => handleAddAdmin(user.id)}
                      onRemoveAdmin={() => handleRemoveAdmin(user.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
