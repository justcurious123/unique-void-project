
import { useState, useEffect, useRef } from 'react';
import { getDefaultImage } from '@/utils/goalImages';

interface UseImageLoaderProps {
  imageUrl: string | null;
  title?: string;
  isInitiallyLoading?: boolean;
  forceRefresh?: boolean;
}

interface UseImageLoaderResult {
  displayImageUrl: string;
  isLoading: boolean;
  hasError: boolean;
  retryLoading: () => void;
  hasLoaded: boolean; // New property to track successful loads
}

export function useImageLoader({
  imageUrl, 
  title = '', 
  isInitiallyLoading = false,
  forceRefresh = false
}: UseImageLoaderProps): UseImageLoaderResult {
  const [isLoading, setIsLoading] = useState<boolean>(isInitiallyLoading);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false); // Track successful loads
  const [attempts, setAttempts] = useState<number>(0);
  const [cacheKey, setCacheKey] = useState<string>(`${Date.now()}`);
  const previousImageUrl = useRef<string | null>(null);
  
  // Reset cache key when forceRefresh is true but only if we haven't loaded yet
  useEffect(() => {
    if (forceRefresh && !hasLoaded) {
      setCacheKey(`${Date.now()}-refresh-${Math.random()}`);
    }
  }, [forceRefresh, hasLoaded]);
  
  // Reset states when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    // Skip reloading if we already successfully loaded this exact URL
    if (imageUrl === previousImageUrl.current && hasLoaded && !forceRefresh) {
      return;
    }
    
    previousImageUrl.current = imageUrl;
    
    // For local images, don't show loading state
    if (imageUrl.startsWith('/lovable-uploads/')) {
      setIsLoading(false);
      setHasLoaded(true);
    } else if (imageUrl.includes('replicate.delivery')) {
      // Only reset loading state if we haven't loaded yet or if forced
      if (!hasLoaded || forceRefresh) {
        setHasError(false);
        setIsLoading(true);
        setHasLoaded(false);
        
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
          setHasLoaded(true); // Mark as successfully loaded
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Error loading image: ${imageUrl}`);
          setHasError(true);
          setIsLoading(false);
        };
        
        // Add a cache-busting parameter
        img.src = `${imageUrl}?t=${cacheKey}`;
      }
    } else {
      // For other remote images
      if (!hasLoaded || forceRefresh) {
        setIsLoading(isInitiallyLoading);
      }
    }
  }, [imageUrl, cacheKey, isInitiallyLoading, forceRefresh, hasLoaded]);

  const retryLoading = () => {
    if (imageUrl) {
      console.log('Retrying image load...');
      setAttempts(prev => prev + 1);
      setCacheKey(`${Date.now()}-retry-${attempts}`);
      setHasError(false);
      setIsLoading(true);
      setHasLoaded(false); // Reset loaded state on retry
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
    retryLoading,
    hasLoaded
  };
}
