import { NextResponse } from 'next/server';
import { generateAuthOptions } from '@/lib/webauthn';
import { setChallenge } from '@/lib/session';

export async function POST() {
  try {
    // Generate authentication options for discoverable credentials
    // No username needed - the passkey identifies the user
    const options = await generateAuthOptions();

    // Store challenge in session for verification
    await setChallenge(options.challenge);

    return NextResponse.json({
      success: true,
      data: { options },
    });
  } catch (error) {
    console.error('Login options error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate login options' },
      { status: 500 }
    );
  }
}
