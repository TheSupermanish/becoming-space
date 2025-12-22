import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/session';

// GET /api/streak - Get user's streak info
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userDoc = await User.findOne({ fullTag: user.fullTag });
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate if streak is still active (within 24h grace period)
    const streak = userDoc.streak || { currentStreak: 0, longestStreak: 0 };
    let isActive = false;
    let daysInactive = 0;

    if (streak.lastActiveDate) {
      const now = new Date();
      const lastActive = new Date(streak.lastActiveDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      daysInactive = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));
      isActive = daysInactive <= 1;
    }

    // Check for milestones
    const milestones = [7, 14, 30, 60, 100, 365];
    const currentMilestone = milestones.filter(m => streak.currentStreak >= m).pop() || 0;
    const nextMilestone = milestones.find(m => m > streak.currentStreak) || null;

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: isActive ? streak.currentStreak : 0,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        isActive,
        daysInactive,
        currentMilestone,
        nextMilestone,
        progressToNext: nextMilestone 
          ? Math.round(((streak.currentStreak - (currentMilestone || 0)) / (nextMilestone - (currentMilestone || 0))) * 100)
          : 100,
      },
    });
  } catch (error) {
    console.error('Get streak error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}

// POST /api/streak - Update streak (called when user does an activity)
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userDoc = await User.findOne({ fullTag: user.fullTag });
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = userDoc.streak?.lastActiveDate 
      ? new Date(userDoc.streak.lastActiveDate.getFullYear(), userDoc.streak.lastActiveDate.getMonth(), userDoc.streak.lastActiveDate.getDate())
      : null;

    let newStreak = userDoc.streak?.currentStreak || 0;
    let celebrateMilestone = false;
    let milestone = 0;

    if (!lastActive) {
      // First activity ever
      newStreak = 1;
    } else {
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
        
        // Check for milestones
        const milestones = [7, 14, 30, 60, 100, 365];
        if (milestones.includes(newStreak)) {
          celebrateMilestone = true;
          milestone = newStreak;
        }
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    userDoc.streak = {
      currentStreak: newStreak,
      longestStreak: Math.max(userDoc.streak?.longestStreak || 0, newStreak),
      lastActiveDate: now,
    };

    await userDoc.save();

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: newStreak,
        longestStreak: userDoc.streak.longestStreak,
        celebrateMilestone,
        milestone,
      },
    });
  } catch (error) {
    console.error('Update streak error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}


