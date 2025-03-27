
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useImageLoader } from '@/hooks/useImageLoader';

interface GoalCardImageProps {
  imageUrl: string | null;
  title: string;
  goalId: string;
  isLoading: boolean;
  forceRefresh?: boolean;
}

const GoalCardImage = ({ imageUrl, title, goalId, isLoading, forceRefresh }: GoalCardImageProps) => {
  const [shouldForceRefresh, setShouldForceRefresh] = useState(false);
  
  // Detect when to force refresh based on URL or props
  useEffect(() => {
    if (forceRefresh || (imageUrl && imageUrl.includes('force='))) {
      console.log(`Forcing refresh for goal image: ${goalId}`);
      setShouldForceRefresh(true);
      
      // Reset after a moment to avoid constant refreshing
      const timer = setTimeout(() => {
        setShouldForceRefresh(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl, goalId, forceRefresh]);

  const { 
    displayImageUrl, 
    isLoading: imageLoading, 
    hasError, 
    retryLoading 
  } = useImageLoader({
    imageUrl,
    title,
    isInitiallyLoading: isLoading,
    forceRefresh: shouldForceRefresh
  });

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Manually retrying image for goal: ${goalId}`);
    retryLoading();
  };

  return (
    <div className="relative w-full h-24 bg-slate-100">
      {isLoading || imageLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div 
          className="relative w-full h-24 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${displayImageUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
          
          <img 
            src={displayImageUrl}
            alt=""
            className="hidden"
            onError={() => true}
          />
          
          {hasError && imageUrl?.includes('replicate.delivery') && (
            <Button 
              variant="secondary" 
              size="icon"
              onClick={handleRetryClick}
              className="absolute top-2 right-2 h-6 w-6 bg-white/80 backdrop-blur-sm"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalCardImage;
