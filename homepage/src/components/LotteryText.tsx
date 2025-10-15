
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LotteryTextProps {
  elements: React.ReactNode[];
  className?: string;
  initialDelay?: number;
}

export const LotteryText: React.FC<LotteryTextProps> = ({ 
  elements, 
  className = '',
  initialDelay = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    if (!isHovered) {
      setIsHovered(true);
      setCurrentIndex((prev) => (prev + 1) % elements.length);
      setTimeout(() => setIsHovered(false), 600);
    }
  };

  return (
    <motion.span
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={handleHover}
      initial={{ y: 10, opacity: 0.001 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 15,
          duration: 0.1,
          delay: initialDelay
        }
      }}
      style={{ verticalAlign: 'baseline' }}
    >
      <span className="invisible whitespace-nowrap">
        {elements[currentIndex]}
      </span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentIndex}
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 120,
              damping: 20,
              mass: 2
            }
          }}
          exit={{ 
            y: 50, 
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }}
          className="absolute top-0 left-0 whitespace-nowrap"
        >
          {elements[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
};