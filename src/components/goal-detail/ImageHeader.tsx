
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ImageHeaderProps {
  onBackClick?: () => void;
}

const ImageHeader = ({ onBackClick }: ImageHeaderProps) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleBackClick} 
      className="absolute top-3 left-3 h-8 sm:h-10 text-sm sm:text-base bg-white/50 backdrop-blur-sm"
    >
      <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Back to Dashboard
    </Button>
  );
};

export default ImageHeader;
