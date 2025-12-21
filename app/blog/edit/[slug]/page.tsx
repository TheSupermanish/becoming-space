'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, EyeOff, X, Plus, Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BlogEditor } from '@/components/features/BlogEditor';
import type { SessionUser, IBlog } from '@/lib/types';

const BLOG_TAGS = [
  'Mental Health',
  'Self-Care',
  'Wellness',
  'Mindfulness',
  'Growth',
  'Community',
  'Tips',
  'Stories',
  'Resources',
  'Motivation',
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [user, setUser] = useState<SessionUser | null>(null);
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.replace('/login');
        } else if (data.data.role !== 'admin') {
          router.replace('/blog');
        } else {
          setUser(data.data);
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (user && slug) {
      fetchBlog();
    }
  }, [user, slug]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${slug}`);
      const data = await res.json();
      if (data.success) {
        const blogData = data.data;
        setBlog(blogData);
        setTitle(blogData.title);
        setContent(blogData.content);
        setExcerpt(blogData.excerpt || '');
        setCoverImage(blogData.coverImage || '');
        setSelectedTags(blogData.tags || []);
        setIsPublished(blogData.isPublished);
      } else {
        router.push('/blog');
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (data: { title: string; content: string }) => {
    setTitle(data.title);
    setContent(data.content);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
      setShowTagInput(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }
    if (!content.trim()) {
      alert('Please add some content');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage.trim() || null,
          tags: selectedTags,
          isPublished: publish !== undefined ? publish : isPublished,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (publish !== undefined) {
          setIsPublished(publish);
        }
        // Navigate to the new slug if title changed
        if (data.data.slug !== slug) {
          router.push(`/blog/${data.data.slug}`);
        }
        alert('Saved successfully!');
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog? This cannot be undone.')) return;
    
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
      alert('Failed to delete');
    }
  };

  if (isLoading || !user || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-amber-50/30 to-cream">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push(`/blog/${slug}`)}
            className="text-stone hover:text-bark flex items-center gap-2 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              <Save size={18} />
              Save
            </Button>
            {isPublished ? (
              <Button
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                <EyeOff size={18} />
                Unpublish
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                isLoading={isSaving}
                className="bg-gradient-to-r from-amber-500 to-orange-500"
              >
                <Eye size={18} />
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
            isPublished
              ? 'bg-sage/20 text-sage'
              : 'bg-amber-100 text-amber-600'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Editor */}
        <div className="mb-6">
          <BlogEditor
            initialTitle={title}
            initialContent={content}
            onChange={handleEditorChange}
            placeholder="Start writing your blog post..."
          />
        </div>

        {/* Meta Settings */}
        <Card className="mb-6">
          <h3 className="font-semibold text-bark mb-4">Post Settings</h3>
          
          {/* Excerpt */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone mb-2">
              Excerpt (optional)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of your post..."
              className="w-full h-20 bg-cream border-0 rounded-xl p-3 text-bark placeholder-stone/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
              maxLength={500}
            />
          </div>

          {/* Cover Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone mb-2">
              Cover Image URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-cream border-0 rounded-xl px-3 py-2 text-bark placeholder-stone/40 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <Button variant="secondary" className="px-3">
                <Image size={18} />
              </Button>
            </div>
            {coverImage && (
              <div className="mt-2 relative">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {BLOG_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-amber-500 text-white'
                      : 'bg-cream text-stone hover:bg-amber-100 hover:text-amber-600'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTags
                .filter((t) => !BLOG_TAGS.includes(t))
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-sm bg-amber-500 text-white flex items-center gap-1"
                  >
                    #{tag}
                    <X size={14} />
                  </button>
                ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                    placeholder="Custom tag"
                    className="w-24 bg-cream border border-sand rounded-full px-3 py-1 text-sm focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="p-1 text-amber-500"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(false)}
                    className="p-1 text-stone"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="px-3 py-1.5 rounded-full text-sm border border-dashed border-stone/30 text-stone hover:border-amber-400 hover:text-amber-600 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add tag
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

