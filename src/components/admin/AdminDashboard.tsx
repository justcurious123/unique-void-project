
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, CheckCircle, Award } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Admin Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">--</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">--</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">--</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">--</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrative Information</CardTitle>
          <CardDescription>This dashboard is currently in development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future updates will include detailed analytics, user metrics, and administrative controls for managing the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
