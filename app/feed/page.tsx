'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Leaf, MessageSquareHeart, Search, RefreshCw, Wind, Flame, X, Sparkles, Shield } from 'lucide-react';
import { PostCard, StreakBadge } from '@/components/features';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import type { IPost, SessionUser, PostType } from '@/lib/types';
import { VENT_TAGS, FLEX_TAGS } from '@/lib/types';

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<PostType | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Post composer state
  const [showComposer, setShowComposer] = useState(false);
  const [postType, setPostType] = useState<PostType>('vent');
  const [postContent, setPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

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

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.set('type', activeType);
      if (activeTag) params.set('tag', activeTag);
      
      const url = `/api/posts${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeType, activeTag]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasThinking = posts.some((p) => p.isAthenaThinking);
      if (hasThinking) {
        fetchPosts();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [posts, fetchPosts]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  const handleReact = async (postId: string, action: 'hug' | 'unhug' | 'highFive' | 'unhighFive') => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id.toString() === postId
              ? { ...p, reactions: data.data.reactions }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to react to post:', error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id.toString() === postId
              ? { ...p, comments: [...(p.comments || []), data.data] }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string, hasLiked: boolean) => {
    const action = hasLiked ? 'unlike' : 'like';
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id.toString() !== postId) return p;
            return {
              ...p,
              comments: (p.comments || []).map((c) =>
                c._id.toString() === commentId
                  ? {
                      ...c,
                      likes: data.data.likes,
                      likedBy: data.data.hasLiked
                        ? [...(c.likedBy || []), user?.fullTag || '']
                        : (c.likedBy || []).filter((t) => t !== user?.fullTag),
                    }
                  : c
              ),
            };
          })
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleEdit = async (postId: string, content: string, tags: string[]) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', content, tags }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id.toString() === postId ? { ...p, ...data.data } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to edit post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id.toString() !== postId));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;
    
    setIsPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          tags: selectedTags.length > 0 ? selectedTags : ['General'],
          postType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setPostContent('');
        setSelectedTags([]);
        setShowComposer(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const composerTags = postType === 'vent' ? VENT_TAGS : FLEX_TAGS;
  const sidebarTags = activeType === 'vent' ? VENT_TAGS : activeType === 'flex' ? FLEX_TAGS : [...new Set([...VENT_TAGS, ...FLEX_TAGS])];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream border-b border-sand/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-earth to-earth-dark rounded-xl flex items-center justify-center shadow-warm">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-bark">Space</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/chat')}
                className="p-2 text-stone hover:text-earth hover:bg-earth/5 rounded-xl transition-colors"
                title="Chat with Athena"
              >
                <MessageSquareHeart size={20} />
              </button>

              <StreakBadge />

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sand/50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-sage" />
                <span className="text-xs text-bark font-medium">{user.fullTag}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-stone hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-6">
          {/* Sidebar - Tags */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl p-4 shadow-soft border border-sand/50 mb-4">
                <h3 className="font-semibold text-bark mb-3">Filter by Type</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveType('all'); setActiveTag(null); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeType === 'all' ? 'bg-bark text-white' : 'text-stone hover:bg-sand/50'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={() => { setActiveType('vent'); setActiveTag(null); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeType === 'vent' ? 'bg-indigo-500 text-white' : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Wind size={16} /> Vents
                  </button>
                  <button
                    onClick={() => { setActiveType('flex'); setActiveTag(null); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeType === 'flex' ? 'bg-amber-500 text-white' : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Flame size={16} /> Flexes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-soft border border-sand/50">
                <h3 className="font-semibold text-bark mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {sidebarTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeTag === tag
                          ? 'bg-earth text-white'
                          : 'bg-sand/50 text-stone hover:bg-sand'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-2xl">
            {/* Post Composer Trigger */}
            <div 
              className="bg-white rounded-2xl p-4 shadow-soft border border-sand/50 mb-6 cursor-pointer hover:shadow-warm transition-shadow"
              onClick={() => setShowComposer(true)}
            >
              <div className="flex items-center gap-3">
                <Avatar name={user.fullTag} />
                <div className="flex-1 bg-cream rounded-full px-4 py-3 text-stone/50 text-sm">
                  What's on your mind? Vent or flex...
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-sand/30">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors text-sm font-medium">
                  <Wind size={18} /> Vent
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors text-sm font-medium">
                  <Flame size={18} /> Flex
                </button>
              </div>
            </div>

            {/* Mobile Type Filter */}
            <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => { setActiveType('all'); setActiveTag(null); }}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeType === 'all' ? 'bg-bark text-white' : 'bg-sand/50 text-stone'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setActiveType('vent'); setActiveTag(null); }}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeType === 'vent' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Wind size={14} /> Vents
              </button>
              <button
                onClick={() => { setActiveType('flex'); setActiveTag(null); }}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeType === 'flex' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Flame size={14} /> Flexes
              </button>
              <button
                onClick={handleRefresh}
                className={`p-2 text-stone hover:text-earth transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Posts */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-sand rounded-full" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-sand rounded" />
                        <div className="w-20 h-3 bg-sand rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-sand rounded" />
                      <div className="w-3/4 h-4 bg-sand rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-sand">
                <Search className="mx-auto mb-4 text-stone/30" size={48} />
                <p className="text-stone font-medium mb-2">No posts found</p>
                {(activeTag || activeType !== 'all') && (
                  <button
                    onClick={() => { setActiveTag(null); setActiveType('all'); }}
                    className="text-earth text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id.toString()}
                    post={post}
                    currentUserTag={user.fullTag}
                    onReact={handleReact}
                    onComment={handleComment}
                    onLikeComment={handleLikeComment}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Hidden on smaller screens */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl p-4 shadow-soft border border-sand/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-earth" />
                  <h3 className="font-semibold text-bark">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/checkin')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-stone hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    📊 Daily Check-in
                  </button>
                  <button
                    onClick={() => router.push('/breathe')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-stone hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    🫁 Breathing Exercise
                  </button>
                  <button
                    onClick={() => router.push('/journal')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-stone hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    📔 Private Journal
                  </button>
                  <button
                    onClick={() => router.push('/chat')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-stone hover:bg-earth/5 hover:text-earth transition-colors"
                  >
                    💬 Chat with Athena
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-[100] p-4 pt-20 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-down" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sand/50">
              <h2 className="font-semibold text-bark">Create Post</h2>
              <button onClick={() => setShowComposer(false)} className="p-1.5 text-stone hover:text-bark hover:bg-sand/50 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex p-2 gap-1 border-b border-sand/30">
              <button
                onClick={() => { setPostType('vent'); setSelectedTags([]); }}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  postType === 'vent'
                    ? 'bg-indigo-500 text-white'
                    : 'text-stone hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Wind size={18} /> Vent
              </button>
              <button
                onClick={() => { setPostType('flex'); setSelectedTags([]); }}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  postType === 'flex'
                    ? 'bg-amber-500 text-white'
                    : 'text-stone hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <Flame size={18} /> Flex
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <Avatar name={user.fullTag} />
                <div className="flex-1">
                  <div className="font-medium text-bark text-sm">{user.fullTag}</div>
                  <div className="text-xs text-stone/60">Posting publicly</div>
                </div>
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={postType === 'vent' ? "What's weighing on you?" : "What's something amazing that happened?"}
                className={`w-full h-32 border-0 rounded-xl p-3 text-bark placeholder-stone/40 resize-none focus:outline-none focus:ring-2 text-[15px] ${
                  postType === 'vent' ? 'bg-indigo-50/50 focus:ring-indigo-200' : 'bg-amber-50/50 focus:ring-amber-200'
                }`}
                autoFocus
              />

              {/* Tags */}
              <div className="mt-4">
                <div className="text-xs font-medium text-stone mb-2">Add tags (optional)</div>
                <div className="flex flex-wrap gap-2">
                  {composerTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? postType === 'vent' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
                          : 'bg-sand/50 text-stone hover:bg-sand'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-sand/30">
              <div className="flex items-center gap-2 text-stone/60">
                <Shield size={14} />
                <span className="text-xs">Anonymous & AI Moderated</span>
              </div>
              <Button
                onClick={handlePost}
                disabled={!postContent.trim()}
                isLoading={isPosting}
                className={postType === 'flex' ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500' : ''}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
