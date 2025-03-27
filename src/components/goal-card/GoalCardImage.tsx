
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { getDefaultImage } from "@/utils/goalImages";

interface GoalCardImageProps {
  imageUrl: string | null;
  title: string;
  goalId: string;
  isLoading: boolean;
}

const GoalCardImage = ({ imageUrl, title, goalId, isLoading }: GoalCardImageProps) => {
  const [imageRetries, setImageRetries] = useState<number>(0);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [cacheKey, setCacheKey] = useState<string>(`${Date.now()}`);
  const [localLoading, setLocalLoading] = useState<boolean>(isLoading);
  
  // Reset states when props change
  useEffect(() => {
    setImageRetries(0);
    setUseFallback(false);
    setLocalLoading(isLoading);
    setCacheKey(`${Date.now()}`);
  }, [goalId, isLoading]);

  // Handle Replicate images loading
  useEffect(() => {
    if (imageUrl?.includes('replicate.delivery')) {
      console.log(`Monitoring Replicate image for goal: ${goalId}`);
      
      if (localLoading) {
        const img = new Image();
        const newCacheKey = `${Date.now()}-${imageRetries}`;
        setCacheKey(newCacheKey);
        
        const timeoutId = setTimeout(() => {
          console.log(`Image load timeout for: ${goalId}`);
          setLocalLoading(false);
          
          // If we've tried a few times and it's still not working, use fallback
          if (imageRetries > 1) {
            setUseFallback(true);
          } else {
            // Try again
            setImageRetries(prev => prev + 1);
          }
        }, 5000);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          console.log(`Image loaded successfully for goal: ${goalId}`);
          setLocalLoading(false);
          setUseFallback(false);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Error loading image for goal: ${goalId}`);
          
          if (imageRetries < 2) {
            setImageRetries(prev => prev + 1);
          } else {
            setLocalLoading(false);
            setUseFallback(true);
          }
        };
        
        img.src = `${imageUrl}?t=${newCacheKey}`;
      }
    }
  }, [imageUrl, goalId, localLoading, imageRetries]);

  const handleImageError = () => {
    console.log(`Image failed to load for goal: ${goalId}`);
    
    if (imageRetries < 3) {
      setImageRetries(prev => prev + 1);
      setCacheKey(`${Date.now()}-${imageRetries}`);
    } else {
      setUseFallback(true);
    }
    return true;
  };

  const retryImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Manually retrying image for goal: ${goalId}`);
    setUseFallback(false);
    setImageRetries(prev => prev + 1);
    setLocalLoading(true);
    setCacheKey(`${Date.now()}-retry`);
  };

  const getImageUrl = () => {
    if (useFallback || !imageUrl) {
      return getDefaultImage(title);
    }
    
    if (imageUrl.includes('replicate.delivery')) {
      return `${imageUrl}?t=${cacheKey}`;
    }
    
    return imageUrl;
  };

  return (
    <div className="relative w-full h-24 bg-slate-100">
      {localLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div 
          className="relative w-full h-24 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${getImageUrl()})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
          
          <img 
            src={getImageUrl()}
            alt=""
            className="hidden"
            onError={handleImageError}
          />
          
          {useFallback && imageUrl?.includes('replicate.delivery') && (
            <Button 
              variant="secondary" 
              size="icon"
              onClick={retryImage}
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
