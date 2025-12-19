import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuthResponse, base64urlToBuffer } from '@/lib/webauthn';
import { getChallenge, clearChallenge, setSessionUser } from '@/lib/session';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

export async function POST(request: NextRequest) {
  try {
    const { response } = await request.json();

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Missing authentication response' },
        { status: 400 }
      );
    }

    // Get the challenge from session
    const expectedChallenge = await getChallenge();
    if (!expectedChallenge) {
      return NextResponse.json(
        { success: false, error: 'Login session expired. Please try again.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by credential ID from the response
    const authResponse = response as AuthenticationResponseJSON;
    const credentialId = base64urlToBuffer(authResponse.id);
    
    // Search for user with this credential
    const user = await User.findOne({
      'credentials.credentialId': credentialId,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Passkey not recognized. Please register first.' },
        { status: 404 }
      );
    }

    // Find the matching credential
    const credential = user.credentials.find(
      (c) => c.credentialId.equals(credentialId)
    );

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential not found' },
        { status: 400 }
      );
    }

    // Verify the authentication response
    const verification = await verifyAuthResponse(
      authResponse,
      expectedChallenge,
      {
        credentialId: credential.credentialId,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      }
    );

    if (!verification.verified) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 400 }
      );
    }

    // Update counter
    credential.counter = verification.authenticationInfo.newCounter;
    await user.save();

    // Clear the challenge
    await clearChallenge();

    // Set user session
    await setSessionUser({
      fullTag: user.fullTag,
      username: user.username,
    });

    return NextResponse.json({
      success: true,
      data: {
        fullTag: user.fullTag,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
