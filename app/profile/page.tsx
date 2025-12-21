'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Flame,
  Heart,
  Sparkles,
  BookOpen,
  MessageSquare,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/features/PostCard';
import { MOOD_EMOJIS } from '@/lib/types';
import type { SessionUser, IPost, IMoodEntry, IJournalEntry } from '@/lib/types';

type TabType = 'posts' | 'journal' | 'moods';

interface ProfileStats {
  totalPosts: number;
  totalHugs: number;
  totalHighFives: number;
  totalJournalEntries: number;
  totalMoodCheckins: number;
  averageMood: string | null;
  currentStreak: number;
  longestStreak: number;
}

interface ProfileData {
  user: SessionUser & { createdAt?: string };
  posts: IPost[];
  moodEntries: IMoodEntry[];
  journalEntries: IJournalEntry[];
  stats: ProfileStats;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success) {
        setProfileData(data.data);
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading profile...</div>
      </div>
    );
  }

  const { user, posts, moodEntries, journalEntries, stats } = profileData;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-earth/5 to-cream">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Profile Header */}
        <Card className="mb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-earth/10 via-transparent to-sage/10 pointer-events-none" />
          
          <div className="relative">
            {/* Avatar & Name */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-earth to-earth-dark rounded-2xl flex items-center justify-center shadow-warm">
                <User size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-serif font-bold text-bark">
                  {user.username}
                </h1>
                <p className="text-stone text-sm">{user.fullTag}</p>
                {user.createdAt && (
                  <p className="text-stone/60 text-xs mt-1">
                    Joined {formatDate(user.createdAt)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-stone hover:text-red-500"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-earth mb-1">
                  <Flame size={16} />
                </div>
                <div className="text-xl font-bold text-bark">{stats.currentStreak}</div>
                <div className="text-[10px] text-stone">Day Streak</div>
              </div>
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
                  <Heart size={16} />
                </div>
                <div className="text-xl font-bold text-bark">{stats.totalHugs}</div>
                <div className="text-[10px] text-stone">Hugs</div>
              </div>
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Sparkles size={16} />
                </div>
                <div className="text-xl font-bold text-bark">{stats.totalHighFives}</div>
                <div className="text-[10px] text-stone">High-Fives</div>
              </div>
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-sage mb-1">
                  <MessageSquare size={16} />
                </div>
                <div className="text-xl font-bold text-bark">{stats.totalPosts}</div>
                <div className="text-[10px] text-stone">Posts</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-soft">
          {[
            { id: 'posts' as TabType, label: 'Posts', icon: MessageSquare, count: posts.length },
            { id: 'journal' as TabType, label: 'Journal', icon: BookOpen, count: journalEntries.length },
            { id: 'moods' as TabType, label: 'Moods', icon: Sparkles, count: moodEntries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-earth text-white shadow-sm'
                  : 'text-stone hover:bg-cream'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-sand'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <MessageSquare size={48} className="mx-auto text-stone/30 mb-4" />
                <h3 className="font-semibold text-bark mb-2">No posts yet</h3>
                <p className="text-stone text-sm mb-4">
                  Share your thoughts with the community
                </p>
                <Button onClick={() => router.push('/feed')}>
                  Go to Feed
                </Button>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id.toString()}
                  post={post}
                  currentUserTag={user.fullTag}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-3">
            {journalEntries.length === 0 ? (
              <Card className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-stone/30 mb-4" />
                <h3 className="font-semibold text-bark mb-2">No journal entries</h3>
                <p className="text-stone text-sm mb-4">
                  Start journaling to track your thoughts
                </p>
                <Button onClick={() => router.push('/journal')}>
                  Start Journaling
                </Button>
              </Card>
            ) : (
              journalEntries.map((entry) => {
                const isExpanded = expandedJournal === entry._id.toString();
                const preview = entry.content.slice(0, 150);
                const hasMore = entry.content.length > 150;

                return (
                  <Card key={entry._id.toString()} className="group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {entry.mood ? (
                          <span className="text-xl">
                            {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS].emoji}
                          </span>
                        ) : (
                          <BookOpen size={18} className="text-rose-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-stone">
                            {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
                          </span>
                        </div>
                        {entry.prompt && (
                          <p className="text-sm text-rose-500 italic mb-2">
                            "{entry.prompt}"
                          </p>
                        )}
                        <p className="text-bark text-sm whitespace-pre-wrap">
                          {isExpanded ? entry.content : preview}
                          {!isExpanded && hasMore && '...'}
                        </p>
                        {hasMore && (
                          <button
                            onClick={() => setExpandedJournal(isExpanded ? null : entry._id.toString())}
                            className="text-rose-500 text-xs font-medium mt-2 flex items-center gap-1 hover:underline"
                          >
                            {isExpanded ? (
                              <>Show less <ChevronUp size={12} /></>
                            ) : (
                              <>Read more <ChevronDown size={12} /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'moods' && (
          <div>
            {/* Mood Overview */}
            {moodEntries.length > 0 && (
              <Card className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-purple-500" />
                  <h3 className="font-semibold text-bark">Last 30 Days</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageMood || '-'}
                    </div>
                    <div className="text-xs text-stone">Average Mood</div>
                  </div>
                  <div className="bg-sage/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-sage">
                      {stats.totalMoodCheckins}
                    </div>
                    <div className="text-xs text-stone">Check-ins</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Mood List */}
            <div className="space-y-2">
              {moodEntries.length === 0 ? (
                <Card className="text-center py-12">
                  <Sparkles size={48} className="mx-auto text-stone/30 mb-4" />
                  <h3 className="font-semibold text-bark mb-2">No mood check-ins</h3>
                  <p className="text-stone text-sm mb-4">
                    Track your daily mood to see patterns
                  </p>
                  <Button onClick={() => router.push('/checkin')}>
                    Check In Now
                  </Button>
                </Card>
              ) : (
                moodEntries.map((entry) => (
                  <Card key={entry._id.toString()} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">
                          {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS].emoji}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-bark">
                          {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS].label}
                        </div>
                        <div className="text-xs text-stone">
                          {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
                        </div>
                      </div>
                      {entry.note && (
                        <p className="text-stone text-sm max-w-[200px] truncate">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

