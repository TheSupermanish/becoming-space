import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/lib/types';

export interface SessionData {
  user?: SessionUser;
  challenge?: string; // WebAuthn challenge for registration/login
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_iron_session',
  cookieName: 'athena_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user || null;
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const session = await getSession();
  session.user = user;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

export async function setChallenge(challenge: string): Promise<void> {
  const session = await getSession();
  session.challenge = challenge;
  await session.save();
}

export async function getChallenge(): Promise<string | undefined> {
  const session = await getSession();
  return session.challenge;
}

export async function clearChallenge(): Promise<void> {
  const session = await getSession();
  session.challenge = undefined;
  await session.save();
}

