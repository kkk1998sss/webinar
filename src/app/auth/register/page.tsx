'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    function formatPhoneNumber(phoneNumber: string): string {
      const cleaned = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters

      if (cleaned.length === 10) {
        return `+91${cleaned}`; // Add country code for India
      }

      if (cleaned.length > 10 && !cleaned.startsWith('+')) {
        return `+${cleaned}`;
      }

      return cleaned; // Return formatted number
    }
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: formattedPhoneNumber,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        router.push('/auth/login');
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-center text-2xl font-semibold">Sign Up</h2>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>

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
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
