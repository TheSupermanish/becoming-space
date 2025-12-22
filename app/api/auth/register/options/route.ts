import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateRegOptions } from '@/lib/webauthn';
import { setChallenge } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Username must be 2-20 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { success: false, error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique discriminator
    const { discriminator, fullTag } = await User.generateUniqueTag(cleanUsername);

    // Generate WebAuthn registration options
    const options = await generateRegOptions(fullTag, cleanUsername);

    // Store challenge in session for verification
    await setChallenge(options.challenge);

    return NextResponse.json({
      success: true,
      data: {
        options,
        username: cleanUsername,
        discriminator,
        fullTag,
      },
    });
  } catch (error) {
    console.error('Registration options error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}


