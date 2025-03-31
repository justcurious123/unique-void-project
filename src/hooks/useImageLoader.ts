
import { useState, useEffect } from 'react';
import { getDefaultImage } from '@/utils/goalImages';

interface UseImageLoaderProps {
  imageUrl: string | null;
  title: string;
  isInitiallyLoading?: boolean;
  forceRefresh?: boolean;
  skipPlaceholder?: boolean;
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
      setHasError(false);
      setHasLoaded(false);
      setDisplayImageUrl(null);
      return;
    }

    // Skip validation for local uploads and Supabase storage images
    if (
      url.startsWith('/lovable-uploads/') || 
      url.includes('.supabase.co/storage/v1/object/public/goal_images/')
    ) {
      setDisplayImageUrl(url);
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
      return;
    }

    // For Replicate URLs, add a cache-busting parameter to ensure fresh content
    const imageUrlToLoad = url.includes('replicate.delivery') 
      ? `${url}?t=${new Date().getTime()}` 
      : url;

    // For remote URLs, actually check if they load
    try {
      setIsLoading(true);
      
      const img = new Image();
      
      img.onload = () => {
        console.log(`Image loaded successfully: ${url}`);
        setDisplayImageUrl(imageUrlToLoad);
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
          setHasLoaded(true);
        } else {
          setDisplayImageUrl(null);
          setHasLoaded(false);
        }
      };
      
      // Start loading the image
      img.src = imageUrlToLoad;
    } catch (error) {
      console.error('Error loading image:', error);
      setIsLoading(false);
      setHasError(true);
      
      // Only use a default image if we're not skipping placeholders
      if (!skipPlaceholder) {
        setDisplayImageUrl(getDefaultImage(title));
        setHasLoaded(true);
      } else {
        setDisplayImageUrl(null);
        setHasLoaded(false);
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
    if (imageUrl) {
      loadImage(imageUrl);
    } 
    else if (!skipPlaceholder) {
      setDisplayImageUrl(getDefaultImage(title));
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(true);
    } 
    else {
      setDisplayImageUrl(null);
      setIsLoading(false);
      setHasError(false);
      setHasLoaded(false);
    }
  }, [imageUrl, forceRefresh, title, skipPlaceholder]);

  return {
    displayImageUrl,
    isLoading,
    hasError,
    retryLoading,
    hasLoaded
  };
};
