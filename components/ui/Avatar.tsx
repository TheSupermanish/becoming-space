'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  className = '',
  showOnline = false,
}) => {
  const initial = name.charAt(0).toUpperCase();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  const onlineSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  // Generate a consistent color based on the name
  const colors = [
    'from-earth/30 to-gold/30',
    'from-sage/30 to-earth/20',
    'from-gold/30 to-earth/20',
    'from-earth/20 to-sage/30',
    'from-sage/20 to-gold/30',
  ];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizes[size]}
          rounded-full bg-gradient-to-br ${colors[colorIndex]}
          flex items-center justify-center
          font-bold text-bark
          border-2 border-white shadow-soft
          ${className}
        `}
      >
        {initial}
      </div>
      {showOnline && (
        <div
          className={`
            absolute bottom-0 right-0
            ${onlineSizes[size]}
            bg-sage rounded-full
            border-2 border-white
          `}
        />
      )}
    </div>
  );
};

