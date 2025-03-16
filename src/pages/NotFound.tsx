
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-primary/10">
          <span className="text-4xl font-medium text-primary">404</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
          Page not found
        </h1>
        
        <p className="text-foreground/70 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-white font-medium transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
