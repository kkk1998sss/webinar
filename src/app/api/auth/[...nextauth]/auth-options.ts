import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';

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

    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }
        const email = String(credentials.email);
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const decryptedPassword = decryptPassword(user.password);

        if (password !== decryptedPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id ?? undefined,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image || null,
          isActive: user.isActive,
          stripeCustomerId: user.stripeCustomerId ?? '',
        };
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
        token.email = user.email;
        token.image = user.image;
        token.isActive = user.isActive;
        token.stripeCustomerId = user.stripeCustomerId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id ?? undefined, // Convert null to undefined
          email: token.email,
          name: token.name,
          image: token.picture || null,
          stripeCustomerId: token.stripeCustomerId ?? undefined,
          isActive: token.isActive,
        };
      }
      return session;
    },
  },

  pages: { signIn: '/login' },

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
