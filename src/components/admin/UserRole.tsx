
import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, UserMinus } from "lucide-react";
import { User } from "./UserManagement";

interface UserRoleProps {
  user: User;
  onAddAdmin: () => void;
  onRemoveAdmin: () => void;
}

export const UserRole: React.FC<UserRoleProps> = ({ 
  user, 
  onAddAdmin,
  onRemoveAdmin
}) => {
  const isAdmin = user.roles && user.roles.includes('admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open menu</span>
          {isAdmin ? (
            <Shield className="h-4 w-4 text-primary" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <DropdownMenuItem onClick={onRemoveAdmin} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
            <UserMinus className="h-4 w-4" />
            Remove Admin Role
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onAddAdmin} className="flex items-center gap-2 cursor-pointer text-primary focus:text-primary">
            <Shield className="h-4 w-4" />
            Make Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
