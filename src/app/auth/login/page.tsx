'use client';

import { useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('response', res);

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        const session = await getSession();
        console.log('session', session);

        if (session?.user?.isAdmin) {
          router.push('/admin/users');
        } else {
          router.push('/users/live-webinar');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Something went wrong. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      if (!data.user?.email || !data.user?.password) {
        throw new Error('Missing email or password in response.');
      }

      const signInRes = await signIn('credentials', {
        redirect: false,
        email: data.user.email,
        password: data.user.password,
      });

      if (signInRes?.error) {
        setError('Login failed. Please try again.');
      } else {
        router.push('/admin/users');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-center text-2xl font-semibold">Sign In</h2>

      {error && <p className="mb-2 text-center text-red-500">{error}</p>}

      {/* Toggle Between Email & Phone Login */}
      <div className="mb-4 flex justify-center space-x-4">
        <button
          className={`rounded-md px-4 py-2 ${
            loginMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setLoginMethod('email')}
        >
          Email Login
        </button>
        <button
          className={`rounded-md px-4 py-2 ${
            loginMethod === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setLoginMethod('phone')}
        >
          Phone Login
        </button>
      </div>

      {/* Email & Password Login Form */}
      {loginMethod === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-200 text-blue-700 hover:bg-blue-500 hover:text-white"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      )}

      {/* Phone Number + OTP Login */}
      {loginMethod === 'phone' && (
        <form onSubmit={handlePhoneLogin} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="text"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          {!otpSent ? (
            <Button
              type="button"
              onClick={handleRequestOTP}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          ) : (
            <>
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Verifying OTP...' : 'Verify & Login'}
              </Button>
            </>
          )}
        </form>
      )}

      <div className="my-4 text-center">
        <span className="text-sm">Or sign in with</span>
      </div>

      <div className="flex justify-center space-x-3">
        <Button variant="outline" onClick={() => signIn('github')}>
          <Icons.github className="mr-2 size-4" /> GitHub
        </Button>
        <Button variant="outline" onClick={() => signIn('google')}>
          <Icons.google className="mr-2 size-4" /> Google
        </Button>
        <Button variant="outline" onClick={() => signIn('twitter')}>
          <Icons.twitter className="mr-2 size-4" /> Twitter
        </Button>
      </div>

      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-blue-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
