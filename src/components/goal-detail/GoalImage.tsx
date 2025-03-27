
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
  
  // Reset loading state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      // Clear previous error state
      setImageError(false);
      
      // For local images, don't show loading state
      if (imageUrl.startsWith('/lovable-uploads/')) {
        setImageLoading(false);
      } else {
        // For remote images, start in loading state
        setImageLoading(true);
      }
    } else {
      // No image URL means we're not loading
      setImageLoading(false);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    console.log(`Image failed to load in GoalDetail: ${imageUrl}`);
    setImageError(true);
    setImageLoading(false);
    return true; // Let the component know we're handling the error
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
              src={imageUrl || ''}
              alt=""
              className="hidden"
              onLoad={() => setImageLoading(false)}
              onError={handleImageError}
            />
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
