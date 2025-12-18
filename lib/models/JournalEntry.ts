import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IJournalEntry } from '@/lib/types';

export interface JournalEntryDocument extends Omit<IJournalEntry, '_id'>, Document {}

const JournalEntrySchema = new Schema<JournalEntryDocument>(
  {
    userTag: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    prompt: {
      type: String,
      default: null,
    },
    spaceResponse: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's journal entries
JournalEntrySchema.index({ userTag: 1, createdAt: -1 });

// Prevent model recompilation in development
const JournalEntry: Model<JournalEntryDocument> =
  (mongoose.models.JournalEntry as Model<JournalEntryDocument>) ||
  mongoose.model<JournalEntryDocument>('JournalEntry', JournalEntrySchema);

export default JournalEntry;

