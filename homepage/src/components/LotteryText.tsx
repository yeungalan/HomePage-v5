
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LotteryTextProps {
  elements: React.ReactNode[];
  className?: string;
}

export const LotteryText: React.FC<LotteryTextProps> = ({ elements, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const handleHover = () => {
    if (!isHovered) {
      setIsHovered(true);
      setCurrentIndex((prev) => (prev + 1) % elements.length);
      setTimeout(() => setIsHovered(false), 600);
    }
  };

  return (
    <span
      ref={containerRef}
      className={`relative inline-block cursor-pointer align-top ${className}`}
      onMouseEnter={handleHover}
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
    </span>
  );
};