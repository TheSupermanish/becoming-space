import { Types } from 'mongoose';

// WebAuthn credential
export interface WebAuthnCredential {
  credentialId: Buffer;
  publicKey: Buffer;
  counter: number;
  transports?: AuthenticatorTransport[];
}

// User streak data
export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
}

// User roles
export type UserRole = 'user' | 'admin';

// User - Anonymous with passkey
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  discriminator: string;
  fullTag: string;
  role: UserRole;
  credentials: WebAuthnCredential[];
  currentChallenge?: string;
  streak: UserStreak;
  createdAt: Date;
}

// Moderation result from AI
export interface ModerationResult {
  isBlurred: boolean;
  reason?: string;
  severity: 'none' | 'low' | 'medium' | 'high';
}

// Post type - vent or flex
export type PostType = 'vent' | 'flex';

// Reactions for posts
export interface PostReactions {
  hugs: number;
  huggedBy: string[];
  highFives: number;
  highFivedBy: string[];
}

// Comment (embedded in Post)
export interface IComment {
  _id: Types.ObjectId;
  authorTag: string;
  content: string;
  likes: number;
  likedBy: string[];
  moderation: ModerationResult;
  createdAt: Date;
}

// Post
export interface IPost {
  _id: Types.ObjectId;
  authorTag: string;
  content: string;
  postType: PostType;
  tags: string[];
  reactions: PostReactions;
  moderation: ModerationResult;
  spaceResponse?: string;
  isSpaceThinking: boolean;
  comments: IComment[];
  createdAt: Date;
  updatedAt?: Date;
}

// Mood Entry for daily check-ins
export interface IMoodEntry {
  _id: Types.ObjectId;
  userTag: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: Date;
}

// Journal Entry for private journaling
export interface IJournalEntry {
  _id: Types.ObjectId;
  userTag: string;
  content: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  prompt?: string;
  spaceResponse?: string; // AI companion response
  createdAt: Date;
  updatedAt?: Date;
}

// Session user data
export interface SessionUser {
  fullTag: string;
  username: string;
  role: UserRole;
}

// Blog post (admin-only creation)
export interface IBlog {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string; // Markdown/HTML content
  excerpt: string;
  coverImage?: string;
  authorTag: string;
  authorName: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  readTime: number; // in minutes
  views: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types for WebAuthn
export interface RegisterOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout: number;
  attestation: AttestationConveyancePreference;
  authenticatorSelection: AuthenticatorSelectionCriteria;
}

export interface LoginOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: {
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }[];
  userVerification: UserVerificationRequirement;
}

// Tags for vent posts
export const VENT_TAGS = [
  'Anxiety',
  'Depression',
  'Stress',
  'Loneliness',
  'Relationship',
  'Work',
  'School',
  'Family',
  'Health',
  'Overwhelmed',
] as const;

// Tags for flex posts
export const FLEX_TAGS = [
  'Win',
  'Gratitude',
  'Progress',
  'Milestone',
  'Self-Care',
  'Growth',
  'Achievement',
  'Kindness',
  'Recovery',
  'Joy',
] as const;

export type VentTag = typeof VENT_TAGS[number];
export type FlexTag = typeof FLEX_TAGS[number];

// Mood emojis for check-in
export const MOOD_EMOJIS = {
  1: { emoji: '😢', label: 'Struggling', color: 'text-indigo-400' },
  2: { emoji: '😔', label: 'Low', color: 'text-blue-400' },
  3: { emoji: '😐', label: 'Okay', color: 'text-stone' },
  4: { emoji: '🙂', label: 'Good', color: 'text-sage' },
  5: { emoji: '😊', label: 'Great', color: 'text-gold' },
} as const;

// Journal prompts
export const JOURNAL_PROMPTS = [
  "What's one thing you're grateful for today?",
  "How did you take care of yourself today?",
  "What's something that made you smile recently?",
  "What's a challenge you overcame this week?",
  "Describe a moment of peace you experienced.",
  "What would you tell your past self?",
  "What are you looking forward to?",
  "What's something you learned about yourself?",
  "Describe a kind act you witnessed or did.",
  "What's one thing you want to let go of?",
] as const;
