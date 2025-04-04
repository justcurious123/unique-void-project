
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = 24 
}) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 
        className="animate-spin text-primary" 
        size={size} 
      />
    </div>
  );
};
