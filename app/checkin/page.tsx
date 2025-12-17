'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MOOD_EMOJIS, IMoodEntry } from '@/lib/types';
import type { SessionUser } from '@/lib/types';

export default function CheckinPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [moodHistory, setMoodHistory] = useState<IMoodEntry[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.replace('/login');
        } else {
          setUser(data.data);
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch('/api/mood?days=7')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMoodHistory(data.data.entries);
            setHasCheckedIn(data.data.hasCheckedInToday);
            if (data.data.todayEntry) {
              setSelectedMood(data.data.todayEntry.mood);
              setNote(data.data.todayEntry.note || '');
            }
          }
        });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, note: note.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setHasCheckedIn(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return moodHistory.find(
      (entry) => new Date(entry.createdAt).toDateString() === dateStr
    );
  };

  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, e) => sum + e.mood, 0) / moodHistory.length).toFixed(1)
    : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-50/30 to-cream">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/feed')}
          className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-bark mb-2">
            Daily Check-in
          </h1>
          <p className="text-stone">How are you feeling today?</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-sage/20 border border-sage/30 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
            <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-bark">Check-in recorded!</p>
              <p className="text-sm text-stone">Keep showing up for yourself 💚</p>
            </div>
          </div>
        )}

        {/* Mood Selector */}
        <Card className="mb-6">
          <h2 className="font-semibold text-bark mb-4 text-center">
            {hasCheckedIn ? 'Update your mood' : 'Select your mood'}
          </h2>
          
          <div className="flex justify-center gap-3 mb-6">
            {([1, 2, 3, 4, 5] as const).map((mood) => {
              const { emoji, label } = MOOD_EMOJIS[mood];
              const isSelected = selectedMood === mood;
              
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-purple-100 scale-110 shadow-lg shadow-purple-100'
                      : 'hover:bg-sand/50 hover:scale-105'
                  }`}
                >
                  <span className={`text-4xl transition-transform ${isSelected ? 'animate-bounce-gentle' : ''}`}>
                    {emoji}
                  </span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-purple-600' : 'text-stone'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone mb-2">
              What's on your mind? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A quick thought about how you're feeling..."
              className="w-full h-24 bg-cream border-0 rounded-xl p-4 text-bark placeholder-stone/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
              maxLength={500}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            isLoading={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            {hasCheckedIn ? 'Update Check-in' : 'Record Check-in'}
          </Button>
        </Card>

        {/* Weekly Overview */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-purple-500" />
            <h3 className="font-semibold text-bark">This Week</h3>
          </div>
          
          <div className="flex justify-between items-end gap-2">
            {getLast7Days().map((date, idx) => {
              const entry = getMoodForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      entry
                        ? 'bg-purple-100'
                        : isToday
                        ? 'bg-sand border-2 border-dashed border-purple-300'
                        : 'bg-sand/50'
                    }`}
                  >
                    {entry ? (
                      <span className="text-xl">{MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS].emoji}</span>
                    ) : isToday ? (
                      <span className="text-stone/40 text-lg">?</span>
                    ) : (
                      <span className="text-stone/20">-</span>
                    )}
                  </div>
                  <span className={`text-xs ${isToday ? 'font-bold text-purple-600' : 'text-stone'}`}>
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stats */}
        {moodHistory.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-purple-500" />
              <h3 className="font-semibold text-bark">Your Insights</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{averageMood}</div>
                <div className="text-xs text-stone">Average Mood</div>
              </div>
              <div className="bg-sage/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sage">{moodHistory.length}</div>
                <div className="text-xs text-stone">Check-ins</div>
              </div>
            </div>

            {parseFloat(averageMood || '0') >= 3.5 && (
              <div className="mt-4 p-3 bg-gold/10 rounded-xl">
                <p className="text-sm text-bark text-center">
                  ✨ You've been doing well this week! Keep it up!
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

