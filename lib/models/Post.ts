import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IPost, IComment, ModerationResult, PostReactions } from '@/lib/types';

export interface PostDocument extends Omit<IPost, '_id'>, Document {}

const ModerationSchema = new Schema<ModerationResult>(
  {
    isBlurred: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none',
    },
  },
  { _id: false }
);

const ReactionsSchema = new Schema<PostReactions>(
  {
    hugs: {
      type: Number,
      default: 0,
    },
    huggedBy: {
      type: [String],
      default: [],
    },
    highFives: {
      type: Number,
      default: 0,
    },
    highFivedBy: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    authorTag: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    moderation: {
      type: ModerationSchema,
      default: () => ({ isBlurred: false, severity: 'none' }),
    },
  },
  {
    timestamps: true,
  }
);

const PostSchema = new Schema<PostDocument>(
  {
    authorTag: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    postType: {
      type: String,
      enum: ['vent', 'flex'],
      default: 'vent',
      index: true,
    },
    tags: {
      type: [String],
      default: ['General'],
      index: true,
    },
    reactions: {
      type: ReactionsSchema,
      default: () => ({ hugs: 0, huggedBy: [], highFives: 0, highFivedBy: [] }),
    },
    moderation: {
      type: ModerationSchema,
      default: () => ({ isBlurred: false, severity: 'none' }),
    },
    athenaResponse: {
      type: String,
      default: null,
    },
    isAthenaThinking: {
      type: Boolean,
      default: true,
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for feed queries (sorted by newest first)
PostSchema.index({ createdAt: -1 });

// Compound index for type + date filtering
PostSchema.index({ postType: 1, createdAt: -1 });

// Compound index for tag filtering
PostSchema.index({ tags: 1, createdAt: -1 });

// Prevent model recompilation in development
const Post: Model<PostDocument> =
  (mongoose.models.Post as Model<PostDocument>) ||
  mongoose.model<PostDocument>('Post', PostSchema);

export default Post;
