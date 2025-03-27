
import React from 'react';
import { Button } from '@/components/ui/button';

interface ImageRetryButtonProps {
  onRetry: () => void;
}

const ImageRetryButton = ({ onRetry }: ImageRetryButtonProps) => {
  return (
    <Button 
      variant="secondary" 
      onClick={onRetry} 
      className="absolute top-12 right-3 h-8 text-xs bg-white/70 backdrop-blur-sm"
    >
      Retry Image
    </Button>
  );
};

export default ImageRetryButton;
