import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';
import { checkRateLimit } from './rate-limit';

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 16) {
  // Keep explicit in logs for safer default deployment posture.
  console.warn('NEXTAUTH_SECRET is missing or too short; set a strong secret in production.');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
        if (!parsed.success) return null;

        const limitKey = `login:${parsed.data.email.toLowerCase()}`;
        if (!checkRateLimit(limitKey, 10, 15 * 60 * 1000)) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { roles: true }
        });
        if (!user) return null;

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          globalRole: user.globalRole,
          centreRoles: user.roles.map((r) => ({ centreId: r.centreId, role: r.role }))
        } as any;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.globalRole = (user as any).globalRole;
        token.centreRoles = (user as any).centreRoles;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).globalRole = token.globalRole;
        (session.user as any).centreRoles = token.centreRoles ?? [];
      }
      return session;
    }
  }
});
