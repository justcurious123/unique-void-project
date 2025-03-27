
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface ImageLoaderProps {
  className?: string;
}

const ImageLoader = ({ className = "h-8 w-8" }: ImageLoaderProps) => {
  return (
    <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-slate-100">
      <div className="relative w-full h-full">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className={`animate-spin text-muted-foreground ${className}`} />
        </div>
      </div>
    </div>
  );
};

export default ImageLoader;
