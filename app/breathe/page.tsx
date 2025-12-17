'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wind, Play, Pause, RotateCcw, Eye, Hand, Ear, Flower2, Coffee, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { SessionUser } from '@/lib/types';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';
type Exercise = 'breathing' | 'grounding';

const BREATH_TIMING = {
  inhale: 4,
  hold: 4,
  exhale: 6,
  rest: 2,
};

const GROUNDING_STEPS = [
  { count: 5, sense: 'SEE', icon: Eye, color: 'from-blue-400 to-cyan-400', items: [] as string[] },
  { count: 4, sense: 'TOUCH', icon: Hand, color: 'from-purple-400 to-pink-400', items: [] as string[] },
  { count: 3, sense: 'HEAR', icon: Ear, color: 'from-amber-400 to-orange-400', items: [] as string[] },
  { count: 2, sense: 'SMELL', icon: Flower2, color: 'from-green-400 to-emerald-400', items: [] as string[] },
  { count: 1, sense: 'TASTE', icon: Coffee, color: 'from-rose-400 to-red-400', items: [] as string[] },
];

export default function BreathePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [exercise, setExercise] = useState<Exercise>('breathing');
  
  // Breathing state
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('rest');
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingItems, setGroundingItems] = useState<string[][]>(GROUNDING_STEPS.map(() => []));
  const [groundingComplete, setGroundingComplete] = useState(false);

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

  const startBreathing = useCallback(() => {
    setIsBreathing(true);
    setPhase('inhale');
    setCountdown(BREATH_TIMING.inhale);
  }, []);

  const stopBreathing = useCallback(() => {
    setIsBreathing(false);
    setPhase('rest');
    setCountdown(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resetBreathing = useCallback(() => {
    stopBreathing();
    setCycles(0);
  }, [stopBreathing]);

  useEffect(() => {
    if (!isBreathing) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'inhale':
                setCountdown(BREATH_TIMING.hold);
                return 'hold';
              case 'hold':
                setCountdown(BREATH_TIMING.exhale);
                return 'exhale';
              case 'exhale':
                setCycles((c) => c + 1);
                setCountdown(BREATH_TIMING.inhale);
                return 'inhale';
              default:
                return currentPhase;
            }
          });
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBreathing]);

  const getBreathingText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      default: return 'Ready?';
    }
  };

  const getCircleSize = () => {
    if (!isBreathing) return 'scale-75';
    switch (phase) {
      case 'inhale': return 'scale-100';
      case 'hold': return 'scale-100';
      case 'exhale': return 'scale-75';
      default: return 'scale-75';
    }
  };

  const addGroundingItem = (item: string) => {
    if (!item.trim()) return;
    const current = groundingItems[groundingStep];
    if (current.length < GROUNDING_STEPS[groundingStep].count) {
      const newItems = [...groundingItems];
      newItems[groundingStep] = [...current, item.trim()];
      setGroundingItems(newItems);
      
      // Auto-advance if step is complete
      if (newItems[groundingStep].length >= GROUNDING_STEPS[groundingStep].count) {
        if (groundingStep < GROUNDING_STEPS.length - 1) {
          setTimeout(() => setGroundingStep(groundingStep + 1), 500);
        } else {
          setGroundingComplete(true);
        }
      }
    }
  };

  const resetGrounding = () => {
    setGroundingStep(0);
    setGroundingItems(GROUNDING_STEPS.map(() => []));
    setGroundingComplete(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  const currentStep = GROUNDING_STEPS[groundingStep];
  const StepIcon = currentStep?.icon || Eye;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-blue-50/50 to-cream">
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
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Wind size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-bark mb-2">
            Calm Your Mind
          </h1>
          <p className="text-stone">Take a moment to breathe and ground yourself</p>
        </div>

        {/* Exercise Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1.5 shadow-soft inline-flex gap-1">
            <button
              onClick={() => setExercise('breathing')}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                exercise === 'breathing'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md'
                  : 'text-stone hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Breathing
            </button>
            <button
              onClick={() => setExercise('grounding')}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                exercise === 'grounding'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
                  : 'text-stone hover:text-purple-500 hover:bg-purple-50'
              }`}
            >
              5-4-3-2-1
            </button>
          </div>
        </div>

        {exercise === 'breathing' ? (
          <Card className="text-center">
            {/* Breathing Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Background ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              
              {/* Animated circle */}
              <div
                className={`absolute inset-4 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 transition-transform duration-1000 ease-in-out flex items-center justify-center ${getCircleSize()}`}
                style={{
                  transitionDuration: isBreathing ? `${BREATH_TIMING[phase]}s` : '0.3s',
                }}
              >
                <div className="text-center text-white">
                  <div className="text-5xl font-bold mb-1">
                    {isBreathing ? countdown : '•'}
                  </div>
                  <div className="text-sm font-medium opacity-90">
                    {getBreathingText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 mb-6">
              {!isBreathing ? (
                <Button
                  onClick={startBreathing}
                  leftIcon={<Play size={18} />}
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
                >
                  Start
                </Button>
              ) : (
                <Button
                  onClick={stopBreathing}
                  leftIcon={<Pause size={18} />}
                  variant="secondary"
                >
                  Pause
                </Button>
              )}
              <Button
                onClick={resetBreathing}
                leftIcon={<RotateCcw size={18} />}
                variant="ghost"
              >
                Reset
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{cycles}</div>
                <div className="text-stone">Cycles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">
                  {Math.floor(cycles * 16 / 60)}:{String(cycles * 16 % 60).padStart(2, '0')}
                </div>
                <div className="text-stone">Time</div>
              </div>
            </div>

            {/* Pattern Guide */}
            <div className="mt-6 pt-6 border-t border-sand/50">
              <p className="text-xs text-stone">
                Pattern: <span className="font-medium">4s inhale</span> → <span className="font-medium">4s hold</span> → <span className="font-medium">6s exhale</span>
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            {groundingComplete ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-scale-in">
                  <Check size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-bark mb-2">You did it! 🎉</h2>
                <p className="text-stone mb-6">You're grounded and present. Take a deep breath.</p>
                <Button
                  onClick={resetGrounding}
                  leftIcon={<RotateCcw size={16} />}
                  variant="secondary"
                >
                  Do Again
                </Button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="flex justify-center gap-2 mb-6">
                  {GROUNDING_STEPS.map((step, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx < groundingStep
                          ? 'bg-green-400'
                          : idx === groundingStep
                          ? 'bg-purple-400 scale-125'
                          : 'bg-sand'
                      }`}
                    />
                  ))}
                </div>

                {/* Current Step */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${currentStep.color} rounded-2xl flex items-center justify-center`}>
                    <StepIcon size={32} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-bark mb-1">
                    {currentStep.count} things you can {currentStep.sense}
                  </h2>
                  <p className="text-sm text-stone">
                    {groundingItems[groundingStep].length} of {currentStep.count} found
                  </p>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[48px]">
                  {groundingItems[groundingStep].map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 bg-gradient-to-r ${currentStep.color} text-white text-sm rounded-full animate-scale-in`}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Input */}
                <GroundingInput
                  onSubmit={addGroundingItem}
                  placeholder={`Name something you can ${currentStep.sense.toLowerCase()}...`}
                  color={currentStep.color}
                />

                {/* Skip */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      if (groundingStep < GROUNDING_STEPS.length - 1) {
                        setGroundingStep(groundingStep + 1);
                      } else {
                        setGroundingComplete(true);
                      }
                    }}
                    className="text-xs text-stone hover:text-bark underline"
                  >
                    Skip this step
                  </button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-stone text-center">
            {exercise === 'breathing'
              ? '💡 Try 3-5 cycles when you feel anxious. Deep breathing activates your parasympathetic nervous system.'
              : '💡 This technique helps ground you in the present moment when you feel overwhelmed or anxious.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Grounding Input Component
function GroundingInput({ 
  onSubmit, 
  placeholder, 
  color 
}: { 
  onSubmit: (item: string) => void; 
  placeholder: string;
  color: string;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-cream rounded-xl px-4 py-3 text-bark placeholder-stone/40 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className={`px-4 py-3 bg-gradient-to-r ${color} text-white rounded-xl disabled:opacity-50 transition-all hover:shadow-lg`}
      >
        <Check size={18} />
      </button>
    </form>
  );
}

