'use client';

import React from 'react';

interface TagPillProps {
  tag: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const TagPill: React.FC<TagPillProps> = ({
  tag,
  isActive = false,
  onClick,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full font-medium
        transition-all duration-200
        ${sizes[size]}
        ${
          isActive
            ? 'bg-earth text-white shadow-warm'
            : 'bg-sand/60 text-stone border border-sand hover:bg-sand'
        }
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      #{tag}
    </Component>
  );
};




