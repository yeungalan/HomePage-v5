import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LotteryTextProps {
  elements: React.ReactNode[];
  className?: string;
}

export const LotteryText: React.FC<LotteryTextProps> = ({ elements, className = '' }) => {
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
    <span
      className={`inline-block cursor-pointer ${className}`}
      onMouseEnter={handleHover}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentIndex}
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 50,
              damping: 20,
              mass: 2
            }
          }}
          exit={{ 
            y: 50, 
            opacity: 0,
            transition: {
              duration: 0.5,
              ease: 'easeIn'
            }
          }}
          style={{
            display: 'inline-block'
          }}
        >
          {elements[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};