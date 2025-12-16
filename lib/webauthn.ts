import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type { 
  RegistrationResponseJSON, 
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/types';

// WebAuthn Relying Party configuration
const rpName = process.env.WEBAUTHN_RP_NAME || 'Athena Forum';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export interface StoredCredential {
  credentialId: Buffer;
  publicKey: Buffer;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
}

/**
 * Convert Buffer to base64url string
 */
export function bufferToBase64url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

/**
 * Convert base64url string to Buffer
 */
export function base64urlToBuffer(base64url: string): Buffer {
  return Buffer.from(base64url, 'base64url');
}

/**
 * Generate options for WebAuthn registration
 */
export async function generateRegOptions(
  userId: string,
  username: string,
  existingCredentials: StoredCredential[] = []
) {
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName: username,
    userDisplayName: username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    excludeCredentials: existingCredentials.map((cred) => ({
      id: bufferToBase64url(cred.credentialId),
      transports: cred.transports,
    })),
    timeout: 60000,
  });

  return options;
}

/**
 * Verify a WebAuthn registration response
 */
export async function verifyRegResponse(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });
}

/**
 * Generate options for WebAuthn authentication (login)
 * Uses discoverable credentials - no username needed
 */
export async function generateAuthOptions() {
  const options = await generateAuthenticationOptions({
    rpID,
    // Empty allowCredentials enables discoverable credential flow
    allowCredentials: [],
    userVerification: 'preferred',
    timeout: 60000,
  });

  return options;
}

/**
 * Verify a WebAuthn authentication response
 */
export async function verifyAuthResponse(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: StoredCredential
): Promise<VerifiedAuthenticationResponse> {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: bufferToBase64url(credential.credentialId),
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports,
    },
    requireUserVerification: false,
  });
}
