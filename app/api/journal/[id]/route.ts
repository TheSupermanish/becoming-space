import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JournalEntry from '@/lib/models/JournalEntry';
import { getCurrentUser } from '@/lib/session';

// PATCH /api/journal/[id] - Update journal entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { content, mood } = await request.json();

    await dbConnect();

    const entry = await JournalEntry.findById(id);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.userTag !== user.fullTag) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (content) entry.content = content.trim();
    if (mood !== undefined) entry.mood = mood;

    await entry.save();

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Update journal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/journal/[id] - Delete journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const entry = await JournalEntry.findById(id);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.userTag !== user.fullTag) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    await entry.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Entry deleted',
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}


