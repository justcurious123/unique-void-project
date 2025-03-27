
import { useState, useEffect, useCallback } from 'react';
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
  hasLoaded: boolean;
}

export function useImageLoader({
  imageUrl, 
  title = '', 
  isInitiallyLoading = false,
  forceRefresh = false
}: UseImageLoaderProps): UseImageLoaderResult {
  const [isLoading, setIsLoading] = useState<boolean>(isInitiallyLoading);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [cacheKey, setCacheKey] = useState<string>(`${Date.now()}`);
  
  // Get default image if null or error
  const defaultImage = title ? getDefaultImage(title) : '';
  
  // Function to load and check image
  const loadImage = useCallback((url: string) => {
    // Skip if it's a local image from public directory
    if (url.startsWith('/lovable-uploads/')) {
      setIsLoading(false);
      setHasLoaded(true);
      setHasError(false);
      return;
    }
    
    // For remote URLs, test loading
    setIsLoading(true);
    
    const img = new Image();
    
    // Set up a timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      console.log(`Image load timeout for: ${url}`);
      setHasError(true);
      setIsLoading(false);
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      console.log(`Image loaded successfully: ${url}`);
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`Error loading image: ${url}`);
      setHasError(true);
      setIsLoading(false);
    };
    
    // Add a cache-busting parameter
    img.src = `${url}${url.includes('?') ? '&' : '?'}t=${cacheKey}`;
  }, [cacheKey]);
  
  // Handle initial load and URL changes
  useEffect(() => {
    // If no image URL, use default and skip loading
    if (!imageUrl) {
      setIsLoading(false);
      setHasError(false);
      return;
    }
    
    // If the image is a local image, mark as loaded immediately
    if (imageUrl.startsWith('/lovable-uploads/')) {
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
      return;
    }
    
    // Skip reloading if already loaded and not forced refresh
    if (hasLoaded && !forceRefresh) {
      return;
    }
    
    // Generate a new cache key for forced refreshes
    if (forceRefresh) {
      const newCacheKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setCacheKey(newCacheKey);
    }
    
    // Load remote images
    loadImage(imageUrl);
  }, [imageUrl, forceRefresh, loadImage, hasLoaded]);
  
  // Function to retry loading
  const retryLoading = useCallback(() => {
    if (!imageUrl) return;
    
    console.log('Retrying image load...');
    const newCacheKey = `${Date.now()}-retry-${Math.random().toString(36).substring(2, 9)}`;
    setCacheKey(newCacheKey);
    loadImage(imageUrl);
  }, [imageUrl, loadImage]);
  
  // Determine the final URL to display
  const displayImageUrl = hasError || !imageUrl 
    ? defaultImage
    : imageUrl.startsWith('/lovable-uploads/')
      ? imageUrl // Don't add cache key for local images
      : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${cacheKey}`;
  
  return {
    displayImageUrl,
    isLoading,
    hasError,
    retryLoading,
    hasLoaded
  };
}
