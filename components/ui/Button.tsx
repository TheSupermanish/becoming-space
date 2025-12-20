'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
    transition-all duration-200 transform active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: `
      bg-earth text-white
      hover:bg-earth-dark
      focus:ring-earth/30
      shadow-warm hover:shadow-glow
    `,
    secondary: `
      bg-sand text-bark
      hover:bg-sand-dark
      border border-stone/10
      focus:ring-stone/20
    `,
    ghost: `
      bg-transparent text-stone
      hover:bg-bark/5 hover:text-bark
      focus:ring-bark/10
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600
      focus:ring-red-300
      shadow-lg shadow-red-500/20
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

