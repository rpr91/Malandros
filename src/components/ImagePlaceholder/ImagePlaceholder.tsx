import React from 'react';
import styles from './ImagePlaceholder.module.css';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  className?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  width = '100%', 
  height = '200px',
  className = ''
}) => {
  return (
    <div 
      className={`${styles.placeholder} ${className}`}
      style={{ width, height }}
    />
  );
};

export default ImagePlaceholder;