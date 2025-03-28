
import React, { useEffect, useState } from 'react';
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
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  
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
    forceRefresh,
    skipPlaceholder: true
  });

  // Use a stable approach to show/hide the loader
  useEffect(() => {
    if (hasLoaded && showPlaceholder) {
      // Add a small delay before hiding the placeholder to prevent flickering
      const timeout = setTimeout(() => {
        setShowPlaceholder(false);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [hasLoaded, showPlaceholder]);
  
  // When image URL changes, show placeholder again
  useEffect(() => {
    if (imageUrl) {
      setShowPlaceholder(true);
    }
  }, [imageUrl]);
  
  // Only show loader during initial loading phase and hide once loaded
  const showLoader = (isLoading || (imageLoading && !hasLoaded)) && showPlaceholder;
  
  return (
    <div className="relative">
      {showLoader ? (
        <ImageLoader />
      ) : displayImageUrl ? (
        <div 
          className="w-full h-48 sm:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${displayImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          
          {/* Show retry button if there was an error */}
          {hasError && imageUrl && !imageUrl.startsWith('/lovable-uploads/') && (
            <ImageRetryButton onRetry={retryLoading} />
          )}
        </div>
      ) : (
        <div className="w-full h-48 sm:h-64 bg-slate-100 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
      )}
      
      <ImageHeader />
    </div>
  );
};

export default GoalImage;
