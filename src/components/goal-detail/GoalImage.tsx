
import React, { useState, useEffect } from 'react';
import { useImageLoader } from '@/hooks/useImageLoader';
import ImageHeader from './ImageHeader';
import ImageLoader from './ImageLoader';
import ImageRetryButton from './ImageRetryButton';

interface GoalImageProps {
  imageUrl: string | null;
  title: string;
  isLoading: boolean;
  forceRefresh?: boolean;
}

const GoalImage = ({ imageUrl, title, isLoading, forceRefresh }: GoalImageProps) => {
  const [shouldForceRefresh, setShouldForceRefresh] = useState(false);
  
  // Detect when to force refresh based on URL or props
  useEffect(() => {
    if (forceRefresh || (imageUrl && imageUrl.includes('force='))) {
      console.log(`Forcing refresh for goal detail image`);
      setShouldForceRefresh(true);
      
      // Reset after a moment to avoid constant refreshing
      const timer = setTimeout(() => {
        setShouldForceRefresh(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl, forceRefresh]);

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

  const showLoader = isLoading || (imageLoading && !imageUrl?.startsWith('/lovable-uploads/'));
  
  return (
    <div className="relative">
      {showLoader ? (
        <ImageLoader />
      ) : (
        <div 
          className="w-full h-48 sm:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${displayImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          
          {/* Hidden image to detect load/error events */}
          {!imageUrl?.startsWith('/lovable-uploads/') && (
            <img 
              src={displayImageUrl}
              alt=""
              className="hidden"
              onError={() => true}
            />
          )}
          
          {/* Show retry button if there was an error */}
          {hasError && imageUrl && !imageUrl.startsWith('/lovable-uploads/') && (
            <ImageRetryButton onRetry={retryLoading} />
          )}
        </div>
      )}
      
      <ImageHeader />
    </div>
  );
};

export default GoalImage;
