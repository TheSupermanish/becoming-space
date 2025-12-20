'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Trophy, X } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  nextMilestone: number | null;
  progressToNext: number;
}

interface StreakBadgeProps {
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ className = '' }) => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [celebration, setCelebration] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/streak')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStreak(data.data);
        }
      });
  }, []);

  if (!streak) return null;

  const getStreakEmoji = (count: number) => {
    if (count >= 100) return '🏆';
    if (count >= 30) return '⭐';
    if (count >= 7) return '🔥';
    return '🌱';
  };

  const getMilestoneMessage = (days: number) => {
    if (days >= 365) return "A whole year! You're incredible!";
    if (days >= 100) return "100 days! Legendary!";
    if (days >= 60) return "2 months strong!";
    if (days >= 30) return "One month! Amazing!";
    if (days >= 14) return "Two weeks! Keep going!";
    if (days >= 7) return "One week! Great start!";
    return "You're doing great!";
  };

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className={`flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full hover:from-orange-200 hover:to-amber-200 transition-all ${className}`}
      >
        <Flame 
          size={14} 
          className={`${streak.currentStreak > 0 ? 'text-orange-500' : 'text-stone/40'} ${streak.isActive ? 'animate-pulse' : ''}`}
        />
        <span className={`text-xs font-bold ${streak.currentStreak > 0 ? 'text-orange-600' : 'text-stone/60'}`}>
          {streak.currentStreak}
        </span>
      </button>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-scale-in shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-bark">Your Streak</h3>
              <button onClick={() => setShowDetails(false)} className="text-stone hover:text-bark">
                <X size={20} />
              </button>
            </div>

            {/* Current Streak */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{getStreakEmoji(streak.currentStreak)}</div>
              <div className="text-4xl font-bold text-orange-500 mb-1">
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </div>
              <div className="text-stone text-sm">
                {streak.isActive 
                  ? getMilestoneMessage(streak.currentStreak)
                  : streak.currentStreak === 0 
                    ? "Start your streak today!"
                    : "Welcome back! Starting fresh 🌱"
                }
              </div>
            </div>

            {/* Progress to Next Milestone */}
            {streak.nextMilestone && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-stone mb-1">
                  <span>Progress to {streak.nextMilestone} days</span>
                  <span>{streak.progressToNext}%</span>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all"
                    style={{ width: `${streak.progressToNext}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
                <Flame size={20} className="text-orange-500 mx-auto mb-1" />
                <div className="text-xl font-bold text-orange-600">{streak.currentStreak}</div>
                <div className="text-xs text-stone">Current</div>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
                <div className="text-xl font-bold text-amber-600">{streak.longestStreak}</div>
                <div className="text-xs text-stone">Best</div>
              </div>
            </div>

            <p className="text-xs text-stone text-center mt-4">
              Post, check in, or journal daily to maintain your streak!
            </p>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {celebration && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-bark mb-2">
              {celebration} Day Streak!
            </h2>
            <p className="text-stone mb-6">{getMilestoneMessage(celebration)}</p>
            <button
              onClick={() => setCelebration(null)}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-500 transition-all"
            >
              Keep Going! 💪
            </button>
          </div>
        </div>
      )}
    </>
  );
};

