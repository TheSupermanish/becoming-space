import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JournalEntry from '@/lib/models/JournalEntry';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/session';
import { JOURNAL_PROMPTS, MOOD_EMOJIS } from '@/lib/types';
import { geminiService } from '@/lib/gemini';

// Generate companion response in background
async function generateCompanionResponse(
  entryId: string,
  content: string,
  prompt: string | null,
  mood: number | null
) {
  try {
    const moodText = mood ? MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]?.label : 'unspecified';
    
    const response = await geminiService.generateJournalResponse(content, prompt, moodText);
    
    await dbConnect();
    await JournalEntry.findByIdAndUpdate(entryId, {
      spaceResponse: response,
    });
  } catch (error) {
    console.error('Failed to generate companion response:', error);
  }
}

// GET /api/journal - Get journal entries
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    await dbConnect();

    const entries = await JournalEntry.find({ userTag: user.fullTag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JournalEntry.countDocuments({ userTag: user.fullTag });

    // Get today's entry if exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = await JournalEntry.findOne({
      userTag: user.fullTag,
      createdAt: { $gte: today },
    }).lean();

    // Get a random prompt
    const randomPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];

    return NextResponse.json({
      success: true,
      data: {
        entries,
        total,
        hasMore: skip + entries.length < total,
        todayEntry,
        suggestedPrompt: randomPrompt,
      },
    });
  } catch (error) {
    console.error('Get journal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST /api/journal - Create journal entry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content, mood, prompt } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Content is too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create entry first
    const entry = await JournalEntry.create({
      userTag: user.fullTag,
      content: content.trim(),
      mood: mood || null,
      prompt: prompt || null,
    });

    // Generate AI companion response in background
    generateCompanionResponse(entry._id.toString(), content.trim(), prompt, mood);

    // Update user streak
    const userDoc = await User.findOne({ fullTag: user.fullTag });
    if (userDoc && typeof userDoc.updateStreak === 'function') {
      await userDoc.updateStreak();
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Create journal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

