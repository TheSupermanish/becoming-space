import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IMoodEntry } from '@/lib/types';

export interface MoodEntryDocument extends Omit<IMoodEntry, '_id'>, Document {}

const MoodEntrySchema = new Schema<MoodEntryDocument>(
  {
    userTag: {
      type: String,
      required: true,
      index: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    note: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's mood history
MoodEntrySchema.index({ userTag: 1, createdAt: -1 });

// Index for finding today's entry
MoodEntrySchema.index({ userTag: 1, createdAt: 1 });

// Prevent model recompilation in development
const MoodEntry: Model<MoodEntryDocument> =
  (mongoose.models.MoodEntry as Model<MoodEntryDocument>) ||
  mongoose.model<MoodEntryDocument>('MoodEntry', MoodEntrySchema);

export default MoodEntry;




