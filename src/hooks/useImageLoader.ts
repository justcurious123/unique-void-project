
import { useState, useEffect } from 'react';
import { getDefaultImage } from '@/utils/goalImages';

interface UseImageLoaderProps {
  imageUrl: string | null;
  title?: string;
  isInitiallyLoading?: boolean;
  forceRefresh?: boolean; // Add new prop to force refresh
}

interface UseImageLoaderResult {
  displayImageUrl: string;
  isLoading: boolean;
  hasError: boolean;
  retryLoading: () => void;
}

export function useImageLoader({
  imageUrl, 
  title = '', 
  isInitiallyLoading = false,
  forceRefresh = false
}: UseImageLoaderProps): UseImageLoaderResult {
  const [isLoading, setIsLoading] = useState<boolean>(isInitiallyLoading);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [cacheKey, setCacheKey] = useState<string>(`${Date.now()}`);
  
  // Reset cache key when forceRefresh is true
  useEffect(() => {
    if (forceRefresh) {
      setCacheKey(`${Date.now()}-refresh-${Math.random()}`);
    }
  }, [forceRefresh]);
  
  // Reset states when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setHasError(false);
      
      // For local images, don't show loading state
      if (imageUrl.startsWith('/lovable-uploads/')) {
        setIsLoading(false);
      } else if (imageUrl.includes('replicate.delivery')) {
        // For Replicate images, show loading state and try to load
        setIsLoading(true);
        
        // Create an image element to test loading
        const img = new Image();
        
        // Set up a timeout to prevent infinite waiting
        const timeoutId = setTimeout(() => {
          console.log(`Image load timeout for: ${imageUrl}`);
          setHasError(true);
          setIsLoading(false);
        }, 10000); // 10 second timeout
        
        img.onload = () => {
          clearTimeout(timeoutId);
          console.log(`Image loaded successfully: ${imageUrl}`);
          setIsLoading(false);
          setHasError(false);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Error loading image: ${imageUrl}`);
          setHasError(true);
          setIsLoading(false);
        };
        
        // Add a cache-busting parameter
        img.src = `${imageUrl}?t=${cacheKey}`;
      } else {
        // For other remote images
        setIsLoading(isInitiallyLoading);
      }
    } else {
      // No image URL means we're not loading
      setIsLoading(false);
    }
  }, [imageUrl, cacheKey, isInitiallyLoading]);

  const retryLoading = () => {
    if (imageUrl) {
      console.log('Retrying image load...');
      setAttempts(prev => prev + 1);
      setCacheKey(`${Date.now()}-retry-${attempts}`);
      setHasError(false);
      setIsLoading(true);
    }
  };

  // Get the final image URL to display
  const displayImageUrl = hasError || !imageUrl 
    ? (title ? getDefaultImage(title) : '')
    : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${cacheKey}`;

  return {
    displayImageUrl,
    isLoading,
    hasError,
    retryLoading
  };
}
