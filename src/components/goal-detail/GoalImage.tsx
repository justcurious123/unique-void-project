
import React from 'react';
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

  // Only show loader during initial loading phase
  const showLoader = (isLoading || imageLoading) && !hasLoaded;
  
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
