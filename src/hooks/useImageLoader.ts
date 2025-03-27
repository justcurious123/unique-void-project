
import { useState, useEffect } from 'react';
import { validateImageUrl, getDefaultImage } from '@/utils/goalImages';

interface UseImageLoaderProps {
  imageUrl: string | null;
  title: string;
  isInitiallyLoading?: boolean;
  forceRefresh?: boolean;
  skipPlaceholder?: boolean; // Add option to skip using placeholder
}

export const useImageLoader = ({
  imageUrl,
  title,
  isInitiallyLoading = false,
  forceRefresh = false,
  skipPlaceholder = false
}: UseImageLoaderProps) => {
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isInitiallyLoading);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Function to load and validate the image
  const loadImage = async (url: string | null) => {
    if (!url) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // For local images from our public directory, just use them directly
    if (url.startsWith('/lovable-uploads/')) {
      setDisplayImageUrl(url);
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
      return;
    }

    // For remote URLs, actually check if they load
    try {
      setIsLoading(true);
      
      const img = new Image();
      
      img.onload = () => {
        setDisplayImageUrl(url);
        setIsLoading(false);
        setHasError(false);
        setHasLoaded(true);
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        setIsLoading(false);
        setHasError(true);
        
        // Only use a default image if we're not skipping placeholders
        if (!skipPlaceholder) {
          setDisplayImageUrl(getDefaultImage(title));
        } else {
          setDisplayImageUrl(null);
        }
      };
      
      // Start loading the image
      img.src = url;
    } catch (error) {
      console.error('Error loading image:', error);
      setIsLoading(false);
      setHasError(true);
      
      // Only use a default image if we're not skipping placeholders
      if (!skipPlaceholder) {
        setDisplayImageUrl(getDefaultImage(title));
      } else {
        setDisplayImageUrl(null);
      }
    }
  };

  // Retry loading the image
  const retryLoading = () => {
    if (imageUrl) {
      loadImage(imageUrl);
    }
  };

  // Effect to load the image when the URL changes or force refresh is triggered
  useEffect(() => {
    // If we have a URL, load it
    if (imageUrl) {
      loadImage(imageUrl);
    } 
    // If we don't have a URL but aren't skipping placeholders, use default
    else if (!skipPlaceholder) {
      setDisplayImageUrl(getDefaultImage(title));
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
    } 
    // If we're skipping placeholders and don't have a URL, show nothing
    else {
      setDisplayImageUrl(null);
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(false);
    }
  }, [imageUrl, forceRefresh]);

  return {
    displayImageUrl,
    isLoading,
    hasError,
    retryLoading,
    hasLoaded
  };
};
