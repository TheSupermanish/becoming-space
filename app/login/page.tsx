'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Leaf, Fingerprint, ArrowRight, User, Sparkles, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

type Mode = 'welcome' | 'register' | 'login';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('welcome');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTag, setGeneratedTag] = useState('');

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.replace('/feed');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Get registration options
      const optionsRes = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const optionsData = await optionsRes.json();
      if (!optionsData.success) {
        throw new Error(optionsData.error || 'Failed to start registration');
      }

      setGeneratedTag(optionsData.data.fullTag);

      // Step 2: Start WebAuthn registration
      const registration = await startRegistration({ optionsJSON: optionsData.data.options });

      // Step 3: Verify registration
      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: registration,
          username: optionsData.data.username,
          discriminator: optionsData.data.discriminator,
          fullTag: optionsData.data.fullTag,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Registration failed');
      }

      // Success! Redirect to feed
      router.push('/feed');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Get login options (no username needed)
      const optionsRes = await fetch('/api/auth/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const optionsData = await optionsRes.json();
      if (!optionsData.success) {
        throw new Error(optionsData.error || 'Failed to start login');
      }

      // Step 2: Start WebAuthn authentication (passkey identifies the user)
      const authentication = await startAuthentication({ optionsJSON: optionsData.data.options });

      // Step 3: Verify authentication
      const verifyRes = await fetch('/api/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authentication }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Login failed');
      }

      // Success! Redirect to feed
      router.push('/feed');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration - pointer-events-none so they don't block clicks */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-earth/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sage/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Welcome Mode */}
      {mode === 'welcome' && (
        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-earth to-earth-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-warm rotate-3">
              <Leaf size={36} className="text-white -rotate-3" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-bark mb-3">Athena</h1>
            <p className="text-stone text-lg">A safe space for your mind</p>
          </div>

          <Card className="text-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-sage/10 rounded-2xl text-left">
                <Sparkles className="text-sage flex-shrink-0" size={24} />
                <div>
                  <p className="font-medium text-bark">AI-Powered Support</p>
                  <p className="text-sm text-stone">Athena listens without judgment</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-earth/10 rounded-2xl text-left">
                <Fingerprint className="text-earth flex-shrink-0" size={24} />
                <div>
                  <p className="font-medium text-bark">Truly Anonymous</p>
                  <p className="text-sm text-stone">Passkey auth - no passwords or usernames to remember</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => setMode('register')}
                className="w-full"
                rightIcon={<ArrowRight size={18} />}
              >
                Create Account
              </Button>
              <Button
                variant="secondary"
                onClick={() => setMode('login')}
                className="w-full"
              >
                I have an account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Register Mode */}
      {mode === 'register' && (
        <div className="w-full max-w-md animate-slide-up relative z-10">
          <button
            type="button"
            onClick={() => { setMode('welcome'); setError(''); setGeneratedTag(''); }}
            className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors cursor-pointer"
          >
            ← Back
          </button>

          <Card>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-earth/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-earth" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-bark">Choose Your Identity</h2>
              <p className="text-stone mt-2">Pick a display name for the community</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <Input
                label="Display Name"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g., wanderer"
                maxLength={20}
                hint={generatedTag ? `Your identity: ${generatedTag}` : 'Letters, numbers, underscores only'}
                leftIcon={<User size={18} />}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-sage/10 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Fingerprint className="text-sage flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-bark text-sm">Passkey Authentication</p>
                    <p className="text-xs text-stone mt-1">
                      Your passkey is your identity. Use Face ID, Touch ID, or PIN to sign in instantly - no passwords needed!
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <Fingerprint size={18} />
                Create with Passkey
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Login Mode - Simplified! */}
      {mode === 'login' && (
        <div className="w-full max-w-md animate-slide-up relative z-10">
          <button
            type="button"
            onClick={() => { setMode('welcome'); setError(''); }}
            className="text-stone hover:text-bark mb-6 flex items-center gap-2 transition-colors cursor-pointer"
          >
            ← Back
          </button>

          <Card>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-earth/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <KeyRound size={28} className="text-earth" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-bark">Welcome Back</h2>
              <p className="text-stone mt-2">Your passkey remembers you</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-cream p-6 rounded-2xl text-center">
                <Fingerprint size={48} className="text-earth mx-auto mb-4" />
                <p className="text-bark font-medium mb-1">Use your device to sign in</p>
                <p className="text-stone text-sm">Face ID, Touch ID, or PIN</p>
              </div>

              <Button onClick={handleLogin} className="w-full" isLoading={isLoading}>
                <Fingerprint size={18} />
                Sign in with Passkey
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-sand text-center">
              <p className="text-sm text-stone">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-earth font-medium hover:underline"
                >
                  Create one
                </button>
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
