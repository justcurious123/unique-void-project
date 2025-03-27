
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useImageLoader } from '@/hooks/useImageLoader';
import { Skeleton } from "@/components/ui/skeleton";

interface GoalCardImageProps {
  imageUrl: string | null;
  title: string;
  goalId: string;
  isLoading: boolean;
  forceRefresh?: boolean;
}

const GoalCardImage = ({ imageUrl, title, goalId, isLoading, forceRefresh }: GoalCardImageProps) => {
  const { 
    displayImageUrl, 
    isLoading: imageLoading, 
    hasError,
    retryLoading,
    hasLoaded 
  } = useImageLoader({
    imageUrl,
    title,
    isInitiallyLoading: isLoading,
    forceRefresh
  });

  // Only show loader when initially loading or during active loading
  const showLoader = isLoading || (imageLoading && !hasLoaded);

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Manually retrying image for goal: ${goalId}`);
    retryLoading();
  };

  // Log when we detect a force refresh
  useEffect(() => {
    if (forceRefresh) {
      console.log(`Force refreshing image for goal: ${goalId}`);
    }
  }, [forceRefresh, goalId]);

  return (
    <div className="relative w-full h-24 bg-slate-100">
      {showLoader ? (
        <Skeleton className="absolute inset-0 w-full h-24" />
      ) : (
        <div 
          className="relative w-full h-24 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${displayImageUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
          
          {hasError && !imageUrl?.startsWith('/lovable-uploads/') && (
            <Button 
              variant="secondary" 
              size="icon"
              onClick={handleRetryClick}
              className="absolute top-2 right-2 h-6 w-6 bg-white/80 backdrop-blur-sm"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          
          {imageLoading && (
            <div className="absolute top-2 left-2">
              <Loader2 className="h-4 w-4 animate-spin text-white drop-shadow-md" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalCardImage;
