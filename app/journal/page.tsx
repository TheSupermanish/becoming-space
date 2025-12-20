'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, PenLine, Sparkles, Calendar, Lock, Trash2, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MOOD_EMOJIS, IJournalEntry } from '@/lib/types';
import type { SessionUser } from '@/lib/types';

export default function JournalPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [entries, setEntries] = useState<IJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data.entries);
        setCurrentPrompt(data.data.suggestedPrompt);
      }
    } catch (error) {
      console.error('Failed to fetch journal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          mood: selectedMood,
          prompt: currentPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries([data.data, ...entries]);
        setContent('');
        setSelectedMood(null);
        setIsWriting(false);
        // Refresh prompt
        const promptRes = await fetch('/api/journal');
        const promptData = await promptRes.json();
        if (promptData.success) {
          setCurrentPrompt(promptData.data.suggestedPrompt);
        }
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;

    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEntries(entries.filter((e) => e._id.toString() !== id));
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const refreshPrompt = async () => {
    const res = await fetch('/api/journal');
    const data = await res.json();
    if (data.success) {
      setCurrentPrompt(data.data.suggestedPrompt);
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

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return entries.filter(
      (entry) => new Date(entry.createdAt).toDateString() === dateStr
    );
  };

  const getEntryTitle = (entry: IJournalEntry) => {
    // Get first line or first 50 chars as title
    const firstLine = entry.content.split('\n')[0].trim();
    if (firstLine.length <= 60) return firstLine;
    return firstLine.slice(0, 57) + '...';
  };

  const filteredEntries = selectedDate
    ? getEntriesForDate(selectedDate)
    : entries;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-rose-50/30 to-cream">
      <div className="max-w-2xl mx-auto px-4 pt-6">
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-bark mb-2">
            Private Journal
          </h1>
          <div className="flex items-center justify-center gap-2 text-stone">
            <Lock size={14} />
            <span className="text-sm">Only you can see these entries</span>
          </div>
        </div>

        {/* Write New Entry */}
        {!isWriting ? (
          <Card className="mb-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
            <div className="text-center">
              <div className="mb-3">
                <Sparkles size={20} className="text-rose-400 mx-auto mb-2" />
                <p className="text-bark font-medium">{currentPrompt}</p>
                <button
                  onClick={refreshPrompt}
                  className="text-xs text-stone hover:text-rose-500 mt-2 flex items-center gap-1 mx-auto"
                >
                  <RefreshCw size={12} />
                  New prompt
                </button>
              </div>
              <Button
                onClick={() => setIsWriting(true)}
                leftIcon={<PenLine size={16} />}
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
              >
                Start Writing
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold text-bark">New Entry</h2>
              <button onClick={() => setIsWriting(false)} className="text-stone hover:text-bark">
                <X size={20} />
              </button>
            </div>

            {/* Prompt */}
            <div className="bg-rose-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-rose-600 font-medium">{currentPrompt}</p>
            </div>

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full h-48 bg-cream border-0 rounded-xl p-4 text-bark placeholder-stone/40 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 mb-4"
              maxLength={10000}
              autoFocus
            />

            {/* Mood */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone mb-2">
                How are you feeling? (optional)
              </label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map((mood) => {
                  const { emoji } = MOOD_EMOJIS[mood];
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                      className={`p-2 text-2xl rounded-xl transition-all ${
                        selectedMood === mood
                          ? 'bg-rose-100 scale-110'
                          : 'hover:bg-sand/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone">{content.length}/10000</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsWriting(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  isLoading={isSubmitting}
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
                >
                  Save Entry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* This Week Calendar */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-rose-500" />
            <h3 className="font-semibold text-bark">This Week</h3>
          </div>
          
          <div className="flex justify-between items-end gap-2">
            {getLast7Days().map((date, idx) => {
              const dayEntries = getEntriesForDate(date);
              const hasEntry = dayEntries.length > 0;
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className={`flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-110' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-rose-500 shadow-lg shadow-rose-200'
                        : hasEntry
                        ? 'bg-rose-100 hover:bg-rose-200'
                        : isToday
                        ? 'bg-sand border-2 border-dashed border-rose-300 hover:bg-rose-50'
                        : 'bg-sand/50 hover:bg-sand'
                    }`}
                  >
                    {hasEntry ? (
                      <span className={`text-lg ${isSelected ? '' : ''}`}>
                        {dayEntries[0].mood ? MOOD_EMOJIS[dayEntries[0].mood as keyof typeof MOOD_EMOJIS].emoji : '📝'}
                      </span>
                    ) : isToday ? (
                      <span className="text-stone/40 text-lg">?</span>
                    ) : (
                      <span className="text-stone/20">-</span>
                    )}
                  </div>
                  <span className={`text-xs ${isSelected ? 'font-bold text-rose-600' : isToday ? 'font-bold text-rose-500' : 'text-stone'}`}>
                    {dayName}
                  </span>
                  {hasEntry && dayEntries.length > 1 && (
                    <span className="text-[10px] text-rose-400 -mt-1">+{dayEntries.length - 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Entries */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-sand rounded-full" />
                  <div className="w-32 h-4 bg-sand rounded" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-sand rounded" />
                  <div className="w-3/4 h-4 bg-sand rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4 text-stone/30" />
            <p className="text-stone font-medium mb-2">
              {selectedDate ? `No entries for ${formatDate(selectedDate)}` : 'No journal entries yet'}
            </p>
            <p className="text-sm text-stone/60">
              {selectedDate ? 'Select another day or start writing' : 'Start writing to see your entries here'}
            </p>
            {selectedDate && (
              <Button
                variant="ghost"
                onClick={() => setSelectedDate(null)}
                className="mt-4"
              >
                Show all entries
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {selectedDate && (
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-stone">
                  Entries for {formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Show all
                </button>
              </div>
            )}
            {filteredEntries.map((entry) => {
              const isExpanded = expandedEntry === entry._id.toString();
              const preview = entry.content.slice(0, 200);
              const hasMore = entry.content.length > 200;
              const title = getEntryTitle(entry);

              return (
                <Card key={entry._id.toString()} className="group">
                  {/* Title & Actions */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif font-bold text-bark text-lg leading-snug flex-1 pr-4">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span className="text-xl">{MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS].emoji}</span>
                      )}
                      <button
                        onClick={() => handleDelete(entry._id.toString())}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="text-xs text-stone mb-3">
                    {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
                  </div>

                  {/* Prompt if exists */}
                  {entry.prompt && (
                    <div className="text-sm text-rose-500 italic mb-3 bg-rose-50 px-3 py-2 rounded-lg">
                      "{entry.prompt}"
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-bark whitespace-pre-wrap text-[15px] leading-relaxed">
                    {isExpanded ? entry.content : preview}
                    {!isExpanded && hasMore && '...'}
                  </p>

                  {hasMore && (
                    <button
                      onClick={() => setExpandedEntry(isExpanded ? null : entry._id.toString())}
                      className="text-rose-500 text-sm font-medium mt-3 flex items-center gap-1 hover:underline"
                    >
                      {isExpanded ? (
                        <>Show less <ChevronUp size={14} /></>
                      ) : (
                        <>Read more <ChevronDown size={14} /></>
                      )}
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

