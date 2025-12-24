import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IBlog } from '@/lib/types';

export interface BlogDocument extends Omit<IBlog, '_id'>, Document {}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },
    coverImage: {
      type: String,
      default: null,
    },
    authorTag: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readTime: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching published blogs
BlogSchema.index({ isPublished: 1, publishedAt: -1 });

// Static method to generate slug
BlogSchema.statics.generateSlug = function (title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) + '-' + Date.now().toString(36);
};

// Calculate read time based on content
BlogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  next();
});

const Blog: Model<BlogDocument> & {
  generateSlug: (title: string) => string;
} = (mongoose.models.Blog as typeof Blog) || mongoose.model<BlogDocument>('Blog', BlogSchema);

export default Blog;




