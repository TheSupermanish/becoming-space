'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';

interface BlurredContentProps {
  children: React.ReactNode;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

export const BlurredContent: React.FC<BlurredContentProps> = ({
  children,
  reason,
  severity = 'medium',
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const severityStyles = {
    low: 'border-gold/30 bg-gold/5',
    medium: 'border-earth/30 bg-blur-bg',
    high: 'border-red-300/50 bg-red-50',
  };

  const severityText = {
    low: 'May contain sensitive language',
    medium: 'Contains potentially triggering content',
    high: 'Contains sensitive content',
  };

  if (isRevealed) {
    return <>{children}</>;
  }

  return (
    <div className={`relative rounded-2xl p-4 border ${severityStyles[severity]}`}>
      {/* Blurred content preview */}
      <div className="blur-md select-none pointer-events-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream/80 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 text-stone mb-2">
          <AlertTriangle size={18} className="text-earth" />
          <span className="font-medium text-sm">Sensitive Content</span>
        </div>
        
        <p className="text-xs text-stone/70 mb-4 text-center max-w-[200px]">
          {reason || severityText[severity]}
        </p>

        <button
          onClick={() => setIsRevealed(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-bark border border-sand hover:bg-sand/30 transition-colors"
        >
          <Eye size={14} />
          Click to reveal
        </button>
      </div>
    </div>
  );
};



