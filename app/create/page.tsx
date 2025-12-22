'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CloudRain, Sparkles, Shield, Wind, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagPill } from '@/components/ui/TagPill';
import { VENT_TAGS, FLEX_TAGS, PostType } from '@/lib/types';
import type { SessionUser } from '@/lib/types';

export default function CreatePostPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [postType, setPostType] = useState<PostType>('vent');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check authentication
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

  const tags = postType === 'vent' ? VENT_TAGS : FLEX_TAGS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTypeChange = (type: PostType) => {
    setPostType(type);
    setSelectedTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write something to share');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          tags: selectedTags.length > 0 ? selectedTags : ['General'],
          postType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/feed');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVent = postType === 'vent';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-8 transition-colors duration-500 ${
      isVent ? 'bg-gradient-to-b from-dusk-50/50 to-cream' : 'bg-gradient-to-b from-amber-50/50 to-cream'
    }`}>
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Feed
        </button>

        {/* Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1.5 shadow-soft inline-flex gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('vent')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                isVent
                  ? 'bg-gradient-to-r from-dusk-500 to-dusk-600 text-white shadow-lg shadow-dusk-200'
                  : 'text-stone hover:text-dusk-600 hover:bg-dusk-50'
              }`}
            >
              <Wind size={18} />
              Vent
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('flex')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                !isVent
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200'
                  : 'text-stone hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Flame size={18} />
              Flex
            </button>
          </div>
        </div>

        <Card className={`animate-slide-up transition-all duration-300 ${
          isVent ? 'border-dusk-100' : 'border-amber-100'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${isVent ? 'bg-dusk-100' : 'bg-amber-100'}`}>
              {isVent ? (
                <CloudRain size={24} className="text-dusk-500" />
              ) : (
                <Sparkles size={24} className="text-amber-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-bark">
                {isVent ? 'Unburden Your Mind' : 'Celebrate Your Win'}
              </h1>
              <p className="text-stone text-sm">
                {isVent ? 'This is a safe space to release what weighs on you' : 'Share something you\'re proud of!'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isVent 
                  ? "What's weighing on you? Let it out..." 
                  : "What's something amazing that happened? Share your win! 🎉"
                }
                className={`w-full h-48 border-0 rounded-2xl p-5 placeholder-stone/40 resize-none focus:outline-none focus:ring-2 text-lg leading-relaxed transition-colors ${
                  isVent 
                    ? 'bg-dusk-50/50 text-bark focus:ring-dusk-200' 
                    : 'bg-amber-50/50 text-bark focus:ring-amber-200'
                }`}
                maxLength={5000}
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs ${content.length > 4500 ? 'text-earth' : 'text-stone/50'}`}>
                  {content.length}/5000
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-bark mb-3">
                {isVent ? 'What are you feeling?' : 'What kind of win?'}
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    isActive={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>

            {/* Athena Info */}
            <div className={`rounded-2xl p-4 mb-6 ${isVent ? 'bg-dusk-50' : 'bg-amber-50'}`}>
              <div className="flex items-start gap-3">
                <Sparkles className={isVent ? 'text-dusk-500' : 'text-amber-500'} size={20} />
                <div>
                  <p className="font-medium text-bark text-sm">Athena will respond</p>
                  <p className="text-xs text-stone mt-1">
                    {isVent 
                      ? 'Athena will provide supportive guidance and gentle coping strategies.' 
                      : 'Athena will celebrate with you and help you appreciate your growth!'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-sand/50">
              <div className="flex items-center gap-2 text-stone/60">
                <Shield size={14} />
                <span className="text-xs">Anonymous & Safe</span>
              </div>
              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                disabled={!content.trim()}
                className={isVent ? '' : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500'}
              >
                {isVent ? 'Share & Get Support' : 'Share Your Win! 🎉'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
