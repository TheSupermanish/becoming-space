import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IUser, WebAuthnCredential, UserStreak } from '@/lib/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  updateStreak(): Promise<UserDocument>;
}

const WebAuthnCredentialSchema = new Schema<WebAuthnCredential>(
  {
    credentialId: {
      type: Buffer,
      required: true,
    },
    publicKey: {
      type: Buffer,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    transports: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const StreakSchema = new Schema<UserStreak>(
  {
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    discriminator: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    fullTag: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    credentials: {
      type: [WebAuthnCredentialSchema],
      default: [],
    },
    currentChallenge: {
      type: String,
      default: null,
    },
    streak: {
      type: StreakSchema,
      default: () => ({ currentStreak: 0, longestStreak: 0 }),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for username + discriminator uniqueness
UserSchema.index({ username: 1, discriminator: 1 }, { unique: true });

// Generate a unique discriminator for a username
UserSchema.statics.generateUniqueTag = async function (
  username: string
): Promise<{ discriminator: string; fullTag: string }> {
  const maxAttempts = 100;
  
  for (let i = 0; i < maxAttempts; i++) {
    const discriminator = Math.floor(1000 + Math.random() * 9000).toString();
    const fullTag = `${username}#${discriminator}`;
    
    const existing = await this.findOne({ fullTag });
    if (!existing) {
      return { discriminator, fullTag };
    }
  }
  
  throw new Error('Unable to generate unique tag. Try a different username.');
};

// Static method to find by full tag
UserSchema.statics.findByTag = function (fullTag: string) {
  return this.findOne({ fullTag });
};

// Method to update streak
UserSchema.methods.updateStreak = async function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = this.streak.lastActiveDate 
    ? new Date(this.streak.lastActiveDate.getFullYear(), this.streak.lastActiveDate.getMonth(), this.streak.lastActiveDate.getDate())
    : null;

  if (!lastActive) {
    // First activity ever
    this.streak.currentStreak = 1;
    this.streak.longestStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no change
      return this;
    } else if (diffDays === 1) {
      // Consecutive day
      this.streak.currentStreak += 1;
      if (this.streak.currentStreak > this.streak.longestStreak) {
        this.streak.longestStreak = this.streak.currentStreak;
      }
    } else {
      // Streak broken
      this.streak.currentStreak = 1;
    }
  }

  this.streak.lastActiveDate = now;
  return this.save();
};

// Prevent model recompilation in development
const User: Model<UserDocument> & {
  generateUniqueTag: (username: string) => Promise<{ discriminator: string; fullTag: string }>;
  findByTag: (fullTag: string) => Promise<UserDocument | null>;
} = (mongoose.models.User as typeof User) || mongoose.model<UserDocument>('User', UserSchema);

export default User;
