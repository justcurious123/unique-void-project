
import React, { useState } from 'react';
import { Loader2, ImageOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDefaultImage } from '@/utils/goalImages';
import { useNavigate } from 'react-router-dom';

interface GoalImageProps {
  imageUrl: string | null;
  title: string;
  isLoading: boolean;
}

const GoalImage = ({ imageUrl, title, isLoading }: GoalImageProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageRetry, setImageRetry] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.log("Image failed to load in GoalDetail");
    if (imageRetry < 2) {
      setImageRetry(prev => prev + 1);
    } else {
      const defaultImage = getDefaultImage(title);
      setImageError(false);
      setImageLoading(false);
      return defaultImage;
    }
  };

  return (
    <div className="relative">
      {!imageUrl || imageLoading || isLoading ? (
        <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div 
          className="w-full h-48 sm:h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          <img 
            src={imageUrl}
            alt=""
            className="hidden"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              const defaultImg = handleImageError();
              if (defaultImg) {
                // Force re-render with the default image
                const imgElement = document.createElement('img');
                imgElement.src = defaultImg;
              }
            }}
          />
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
