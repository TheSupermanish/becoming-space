import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MoodEntry from '@/lib/models/MoodEntry';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/session';

// GET /api/mood - Get mood history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const entries = await MoodEntry.find({
      userTag: user.fullTag,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Check if user has checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = await MoodEntry.findOne({
      userTag: user.fullTag,
      createdAt: { $gte: today },
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        entries,
        hasCheckedInToday: !!todayEntry,
        todayEntry,
      },
    });
  } catch (error) {
    console.error('Get mood error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mood history' },
      { status: 500 }
    );
  }
}

// POST /api/mood - Create mood entry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { mood, note } = await request.json();

    if (!mood || typeof mood !== 'number' || mood < 1 || mood > 5) {
      return NextResponse.json(
        { success: false, error: 'Valid mood (1-5) is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingEntry = await MoodEntry.findOne({
      userTag: user.fullTag,
      createdAt: { $gte: today },
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.mood = mood as 1 | 2 | 3 | 4 | 5;
      existingEntry.note = note || null;
      await existingEntry.save();

      return NextResponse.json({
        success: true,
        data: existingEntry,
        message: 'Mood updated',
      });
    }

    // Create new entry
    const entry = await MoodEntry.create({
      userTag: user.fullTag,
      mood,
      note: note || null,
    });

    // Update user streak
    const userDoc = await User.findOne({ fullTag: user.fullTag });
    if (userDoc && typeof userDoc.updateStreak === 'function') {
      await userDoc.updateStreak();
    }

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Mood recorded',
    });
  } catch (error) {
    console.error('Create mood error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record mood' },
      { status: 500 }
    );
  }
}

