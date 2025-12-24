import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Post from '@/lib/models/Post';
import MoodEntry from '@/lib/models/MoodEntry';
import JournalEntry from '@/lib/models/JournalEntry';
import { getCurrentUser } from '@/lib/session';

// GET /api/profile - Get current user's profile data
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user document for streak data
    const userDoc = await User.findOne({ fullTag: user.fullTag }).lean();

    // Get user's posts
    const posts = await Post.find({ authorTag: user.fullTag })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get mood entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const moodEntries = await MoodEntry.find({
      userTag: user.fullTag,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get journal entries (last 30)
    const journalEntries = await JournalEntry.find({ userTag: user.fullTag })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Calculate stats
    const stats = {
      totalPosts: posts.length,
      totalHugs: posts.reduce((sum, p) => sum + (p.reactions?.hugs || 0), 0),
      totalHighFives: posts.reduce((sum, p) => sum + (p.reactions?.highFives || 0), 0),
      totalJournalEntries: journalEntries.length,
      totalMoodCheckins: moodEntries.length,
      averageMood: moodEntries.length > 0
        ? (moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length).toFixed(1)
        : null,
      currentStreak: userDoc?.streak?.currentStreak || 0,
      longestStreak: userDoc?.streak?.longestStreak || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          fullTag: user.fullTag,
          username: user.username,
          role: user.role,
          createdAt: userDoc?.createdAt,
        },
        posts,
        moodEntries,
        journalEntries,
        stats,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}




