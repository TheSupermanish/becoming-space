'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wind, Play, Pause, RotateCcw, Eye, Hand, Ear, Flower2, Coffee, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { SessionUser } from '@/lib/types';

type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'rest';
type Exercise = 'breathing' | 'grounding';

const BREATH_TIMING = {
  inhale: 4,
  holdIn: 4,
  exhale: 6,
  holdOut: 2,
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
  const [prevPhase, setPrevPhase] = useState<BreathPhase>('rest'); // Track previous phase for hold
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
    setPrevPhase('rest');
    setPhase('inhale');
    setCountdown(BREATH_TIMING.inhale);
  }, []);

  const stopBreathing = useCallback(() => {
    setIsBreathing(false);
    setPhase('rest');
    setPrevPhase('rest');
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
            setPrevPhase(currentPhase); // Track what phase we came from
            switch (currentPhase) {
              case 'inhale':
                setCountdown(BREATH_TIMING.holdIn);
                return 'holdIn';
              case 'holdIn':
                setCountdown(BREATH_TIMING.exhale);
                return 'exhale';
              case 'exhale':
                setCountdown(BREATH_TIMING.holdOut);
                return 'holdOut';
              case 'holdOut':
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
      case 'holdIn': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      case 'holdOut': return 'Hold...';
      default: return 'Ready?';
    }
  };

  const getCircleScale = () => {
    if (!isBreathing) return 0.7;
    switch (phase) {
      case 'inhale': return 1;      // Growing to full
      case 'holdIn': return 1;      // Stay full after inhale
      case 'exhale': return 0.7;    // Shrinking to small
      case 'holdOut': return 0.7;   // Stay small after exhale
      default: return 0.7;
    }
  };

  const getTransitionDuration = () => {
    if (!isBreathing) return '0.5s';
    switch (phase) {
      case 'inhale': return `${BREATH_TIMING.inhale}s`;
      case 'holdIn': return '0s';   // No animation - stay big
      case 'exhale': return `${BREATH_TIMING.exhale}s`;
      case 'holdOut': return '0s';  // No animation - stay small
      default: return '0.5s';
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
    <div className="min-h-screen pb-24 bg-cream">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-200/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
            <Wind size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-bark mb-2">
            Calm Your Mind
          </h1>
          <p className="text-stone">Take a moment to breathe and ground yourself</p>
        </div>

        {/* Exercise Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-soft border border-sand/30 inline-flex gap-1">
            <button
              onClick={() => setExercise('breathing')}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                exercise === 'breathing'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md'
                  : 'text-stone hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Breathing
            </button>
            <button
              onClick={() => setExercise('grounding')}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
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
          <Card className="text-center bg-white/80 backdrop-blur-xl border border-sand/30">
            {/* Breathing Circle */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              {/* Outer glow ring */}
              <div 
                className={`absolute inset-0 rounded-full ${
                  isBreathing ? 'opacity-100' : 'opacity-30'
                }`}
                style={{
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                  transitionProperty: 'transform, opacity',
                  transitionDuration: getTransitionDuration(),
                  transform: `scale(${getCircleScale() * 1.15})`,
                }}
              />
              
              {/* Background ring */}
              <div className="absolute inset-4 rounded-full border-[3px] border-blue-200/30" />
              
              {/* Animated breathing circle */}
              <div
                className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 flex items-center justify-center shadow-xl ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform: `scale(${getCircleScale()})`,
                  transitionProperty: 'transform, box-shadow',
                  transitionDuration: getTransitionDuration(),
                  transitionTimingFunction: (phase === 'holdIn' || phase === 'holdOut') ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isBreathing && (phase === 'inhale' || phase === 'holdIn') 
                    ? '0 0 60px rgba(56, 189, 248, 0.5), 0 0 100px rgba(34, 211, 238, 0.3)' 
                    : '0 10px 40px rgba(56, 189, 248, 0.3)',
                }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />
                
                <div className="text-center text-white relative z-10">
                  <div className="text-6xl font-bold mb-2 drop-shadow-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {isBreathing ? countdown : '∞'}
                  </div>
                  <div className="text-sm font-semibold tracking-wide uppercase opacity-90">
                    {getBreathingText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
              {!isBreathing ? (
                <Button
                  onClick={startBreathing}
                  leftIcon={<Play size={18} />}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-200/50 px-8"
                >
                  Begin
                </Button>
              ) : (
                <Button
                  onClick={stopBreathing}
                  leftIcon={<Pause size={18} />}
                  variant="secondary"
                  className="px-8"
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
            <div className="flex justify-center gap-10 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{cycles}</div>
                <div className="text-stone text-xs uppercase tracking-wider mt-1">Cycles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  {Math.floor(cycles * 16 / 60)}:{String(cycles * 16 % 60).padStart(2, '0')}
                </div>
                <div className="text-stone text-xs uppercase tracking-wider mt-1">Time</div>
              </div>
            </div>

            {/* Pattern Guide */}
            <div className="mt-8 pt-6 border-t border-sand/30">
              <div className="flex flex-wrap justify-center items-center gap-2 text-xs">
                <span className={`px-3 py-1.5 rounded-full transition-all ${phase === 'inhale' ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-stone'}`}>
                  4s in
                </span>
                <span className="text-stone/30">→</span>
                <span className={`px-3 py-1.5 rounded-full transition-all ${phase === 'holdIn' ? 'bg-cyan-100 text-cyan-600 font-semibold' : 'text-stone'}`}>
                  4s hold
                </span>
                <span className="text-stone/30">→</span>
                <span className={`px-3 py-1.5 rounded-full transition-all ${phase === 'exhale' ? 'bg-teal-100 text-teal-600 font-semibold' : 'text-stone'}`}>
                  6s out
                </span>
                <span className="text-stone/30">→</span>
                <span className={`px-3 py-1.5 rounded-full transition-all ${phase === 'holdOut' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-stone'}`}>
                  2s hold
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-xl border border-sand/30">
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
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-sand/20">
          <p className="text-xs text-stone text-center leading-relaxed">
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

