import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyRegResponse } from '@/lib/webauthn';
import { getChallenge, clearChallenge, setSessionUser } from '@/lib/session';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export async function POST(request: NextRequest) {
  try {
    const { response, username, discriminator, fullTag } = await request.json();

    if (!response || !username || !discriminator || !fullTag) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the challenge from session
    const expectedChallenge = await getChallenge();
    if (!expectedChallenge) {
      return NextResponse.json(
        { success: false, error: 'Registration session expired. Please try again.' },
        { status: 400 }
      );
    }

    // Verify the registration response
    const verification = await verifyRegResponse(
      response as RegistrationResponseJSON,
      expectedChallenge
    );

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { success: false, error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    await dbConnect();

    // Check if fullTag already exists (race condition check)
    const existingUser = await User.findByTag(fullTag);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This username tag is already taken. Please try again.' },
        { status: 409 }
      );
    }

    // Create the user
    const newUser = await User.create({
      username,
      discriminator,
      fullTag,
      credentials: [
        {
          credentialId: Buffer.from(credentialID, 'base64url'),
          publicKey: Buffer.from(credentialPublicKey),
          counter: counter,
          transports: response.response.transports || [],
        },
      ],
    });

    // Clear the challenge
    await clearChallenge();

    // Set user session
    await setSessionUser({
      fullTag: newUser.fullTag,
      username: newUser.username,
    });

    return NextResponse.json({
      success: true,
      data: {
        fullTag: newUser.fullTag,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('Registration verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

