import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { env } from '@/env.mjs';
import { decryptPassword } from '@/lib/encryption';
import prisma from '@/lib/prisma';
import { stripeServer } from '@/lib/stripe';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing email or password');
          }
          const email = String(credentials.email);
          const password = String(credentials.password);
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          // Try decryption first
          try {
            const decryptedPassword = decryptPassword(user.password);
            if (
              decryptedPassword !== 'DECRYPTION_FAILED' &&
              password === decryptedPassword
            ) {
              return {
                id: user.id ?? undefined,
                email: user.email ?? undefined,
                name: user.name ?? undefined,
                image: user.image || null,
                isActive: user.isActive,
                stripeCustomerId: user.stripeCustomerId ?? '',
              };
            }
          } catch (error) {
            console.error('Decryption attempt failed:', error);
          }

          // If decryption fails or password doesn't match, try bcrypt
          try {
            const isValidBcrypt = await bcrypt.compare(password, user.password);
            if (isValidBcrypt) {
              return {
                id: user.id ?? undefined,
                email: user.email ?? undefined,
                name: user.name ?? undefined,
                image: user.image || null,
                isActive: user.isActive,
                stripeCustomerId: user.stripeCustomerId ?? '',
              };
            }
          } catch (error) {
            console.error('Bcrypt comparison failed:', error);
          }

          throw new Error('Invalid email or password');
        } catch (error) {
          // Ensure the error message is properly propagated
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email ?? undefined;
        token.image = user.image;
        token.isActive = user.isActive;
        token.stripeCustomerId = user.stripeCustomerId ?? null;

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          select: { isAdmin: true },
        });
        token.isAdmin = dbUser?.isAdmin || false;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id ?? undefined,
        email: token.email,
        name: token.name,
        image: token.picture || null,
        stripeCustomerId: token.stripeCustomerId ?? undefined,
        isActive: token.isActive,
        isAdmin: token.isAdmin,
      };
      return session;
    },
  },

  pages: { signIn: '/auth/login' },

  events: {
    createUser: async ({ user }) => {
      if (!user.email || !user.name) return;

      await stripeServer.customers
        .create({
          email: user.email,
          name: user.name,
        })
        .then(async (customer) => {
          return prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id },
          });
        });
    },
  },
});
