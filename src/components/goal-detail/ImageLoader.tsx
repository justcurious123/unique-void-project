
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImageLoaderProps {
  className?: string;
}

const ImageLoader = ({ className = "h-8 w-8" }: ImageLoaderProps) => {
  return (
    <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-slate-100">
      <Loader2 className={`animate-spin text-muted-foreground ${className}`} />
    </div>
  );
};

export default ImageLoader;
