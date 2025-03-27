
import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDefaultImage } from '@/utils/goalImages';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalImageProps {
  imageUrl: string | null;
  title: string;
  isLoading: boolean;
}

const GoalImage = ({ imageUrl, title, isLoading }: GoalImageProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  
  // Reset loading state when imageUrl changes or when a new attempt is made
  useEffect(() => {
    if (imageUrl) {
      // Clear previous error state
      setImageError(false);
      
      // For local images, don't show loading state
      if (imageUrl.startsWith('/lovable-uploads/')) {
        setImageLoading(false);
      } else if (imageUrl.includes('replicate.delivery')) {
        // For Replicate images, show loading state and try to load
        setImageLoading(true);
        
        // Create an image element to test loading
        const img = new Image();
        
        // Set up a timeout to prevent infinite waiting
        const timeoutId = setTimeout(() => {
          console.log(`Image load timeout for: ${imageUrl}`);
          setImageError(true);
          setImageLoading(false);
        }, 10000); // 10 second timeout
        
        img.onload = () => {
          clearTimeout(timeoutId);
          console.log(`Image loaded successfully: ${imageUrl}`);
          setImageLoading(false);
          setImageError(false);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`Error loading image: ${imageUrl}`);
          setImageError(true);
          setImageLoading(false);
        };
        
        // Add a cache-busting parameter
        img.src = `${imageUrl}?t=${Date.now()}`;
      } else {
        // For other remote images
        setImageLoading(true);
      }
    } else {
      // No image URL means we're not loading
      setImageLoading(false);
    }
  }, [imageUrl, attempts]);

  const handleImageError = () => {
    console.log(`Image failed to load: ${imageUrl}`);
    setImageError(true);
    setImageLoading(false);
    return true; // Let the component know we're handling the error
  };

  const retryLoading = () => {
    if (imageUrl) {
      setAttempts(prev => prev + 1);
    }
  };

  // Get the final image URL to display (either the provided one or a default)
  const displayImageUrl = imageError || !imageUrl 
    ? getDefaultImage(title) 
    : imageUrl;

  return (
    <div className="relative">
      {/* Show loader when loading or when we don't have an image yet */}
      {(isLoading || (imageLoading && !imageUrl?.startsWith('/lovable-uploads/'))) ? (
        <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div 
          className="w-full h-48 sm:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${displayImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          
          {/* Hidden image to detect load/error events */}
          {!imageUrl?.startsWith('/lovable-uploads/') && (
            <img 
              src={imageUrl ? `${imageUrl}?t=${Date.now()}` : ''}
              alt=""
              className="hidden"
              onLoad={() => setImageLoading(false)}
              onError={handleImageError}
            />
          )}
          
          {/* Show retry button if there was an error */}
          {imageError && imageUrl && !imageUrl.startsWith('/lovable-uploads/') && (
            <Button 
              variant="secondary" 
              onClick={retryLoading} 
              className="absolute top-12 right-3 h-8 text-xs bg-white/70 backdrop-blur-sm"
            >
              Retry Image
            </Button>
          )}
        </div>
      )}
      
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')} 
        className="absolute top-3 left-3 h-8 sm:h-10 text-sm sm:text-base bg-white/50 backdrop-blur-sm"
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Back to Dashboard
      </Button>
    </div>
  );
};

export default GoalImage;
