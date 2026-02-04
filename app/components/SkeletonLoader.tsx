import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SkeletonLoaderProps {
  src?: string;
  alt?: string;
  className?: string;
  reloadKey?: number;
  type?: 'image' | 'text';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  src, 
  alt = '', 
  className = '', 
  reloadKey = 0,
  type = 'image'
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setContentVisible(false);
    
    const timer = setTimeout(() => {
      setContentVisible(true);
      setTimeout(() => setIsAnimating(false), 200);
    }, 1200);

    return () => clearTimeout(timer);
  }, [reloadKey]);

  // 自然で落ち着いたトーンの色設定
  const bgColor = type === 'text' ? 'bg-[#f0f2f3]' : 'bg-[#f0f2f3]';
  const shimmerColor = 'via-white/30'; // 抑えめの輝き

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton Overlay */}
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            key={`skeleton-layer-${reloadKey}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 z-20 ${bgColor}`}
          >
            {/* 斜めのシマーエフェクト (落ち着いた速度と輝き) */}
            <motion.div
              className={`absolute inset-0 bg-linear-to-r from-transparent ${shimmerColor} to-transparent`}
              style={{ 
                width: '150%', 
                height: '100%',
                skewX: '-20deg',
              }}
              animate={{
                x: ['-100%', '150%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Rendering */}
      <div 
        className={`w-full h-full transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {type === 'image' && src && (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};
