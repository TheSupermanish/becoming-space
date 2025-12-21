'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PenSquare, Calendar, Clock, Eye, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SessionUser, IBlog } from '@/lib/types';

export default function BlogListPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role === 'admin') {
        params.set('includeUnpublished', 'true');
      }
      
      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50/30 to-cream">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bark mb-1">Blog</h1>
            <p className="text-stone text-sm">Insights & stories from our community</p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push('/blog/new')}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <PenSquare size={18} />
              Write
            </Button>
          )}
        </div>

        {/* Blog List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 bg-sand/50 rounded w-3/4 mb-3" />
                <div className="h-4 bg-sand/30 rounded w-full mb-2" />
                <div className="h-4 bg-sand/30 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <Card className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold text-bark mb-2">No blogs yet</h3>
            <p className="text-stone text-sm">
              {isAdmin
                ? 'Start writing your first blog post!'
                : 'Check back soon for new content.'}
            </p>
            {isAdmin && (
              <Button
                onClick={() => router.push('/blog/new')}
                className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500"
              >
                <PenSquare size={18} />
                Write your first post
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Link key={blog._id.toString()} href={`/blog/${blog.slug}`}>
                <Card className="group hover:shadow-warm transition-all cursor-pointer overflow-hidden p-0">
                  {/* Cover Image */}
                  {blog.coverImage && (
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-5">
                    {/* Draft Badge */}
                    {!blog.isPublished && (
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full mb-3">
                        Draft
                      </span>
                    )}
                    
                    {/* Title */}
                    <h2 className="text-lg font-serif font-bold text-bark mb-2 group-hover:text-amber-600 transition-colors">
                      {blog.title}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-stone text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-stone/70">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(blog.publishedAt || blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {blog.readTime} min read
                      </span>
                      {blog.isPublished && (
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {blog.views}
                        </span>
                      )}
                      <span className="flex-1" />
                      <ChevronRight size={16} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  
                    {/* Tags */}
                    {blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-sand/30">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

