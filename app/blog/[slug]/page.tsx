'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, Edit, Trash2, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SessionUser, IBlog } from '@/lib/types';

export default function BlogReadPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [user, setUser] = useState<SessionUser | null>(null);
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${slug}`);
      const data = await res.json();
      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.error || 'Blog not found');
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      setError('Failed to load blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const res = await fetch(`/api/blogs/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/blog');
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete blog');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: blog?.title,
        text: blog?.excerpt,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50/30 to-cream">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="animate-pulse">
            <div className="h-8 bg-sand/50 rounded w-3/4 mb-4" />
            <div className="h-4 bg-sand/30 rounded w-1/2 mb-8" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-sand/30 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50/30 to-cream">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <Link
            href="/blog"
            className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
          <Card className="text-center py-12">
            <h2 className="text-xl font-serif font-bold text-bark mb-2">
              {error || 'Blog not found'}
            </h2>
            <p className="text-stone mb-4">
              This blog post may have been removed or doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push('/blog')}>
              Browse all posts
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50/30 to-cream">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Back Button */}
        <Link
          href="/blog"
          className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Blog
        </Link>

        {/* Draft Badge */}
        {!blog.isPublished && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-600 text-sm font-medium rounded-full">
              Draft - Only visible to admins
            </span>
          </div>
        )}

        {/* Article */}
        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-bark mb-4 leading-tight">
              {blog.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone mb-4">
              <span className="font-medium text-bark">{blog.authorName}</span>
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
                  {blog.views} views
                </span>
              )}
            </div>

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-bark max-w-none blog-content
              [&_h1]:text-2xl [&_h1]:font-serif [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8
              [&_h2]:text-xl [&_h2]:font-serif [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5
              [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-bark
              [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone [&_blockquote]:my-6 [&_blockquote]:bg-amber-50/50 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-bark
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-bark
              [&_li]:mb-2
              [&_pre]:bg-bark [&_pre]:text-cream [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-6
              [&_code]:font-mono [&_code]:text-sm
              [&_a]:text-amber-600 [&_a]:underline [&_a]:hover:text-amber-700
              [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-6
              [&_hr]:border-sand [&_hr]:my-8
              [&_strong]:font-semibold [&_strong]:text-bark"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-sand flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 size={18} />
            Share
          </Button>
          
          {isAdmin && (
            <>
              <Button
                variant="secondary"
                onClick={() => router.push(`/blog/edit/${blog.slug}`)}
              >
                <Edit size={18} />
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



