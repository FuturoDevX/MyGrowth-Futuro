import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
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
        (session.user as any).centreRoles = token.centreRoles;
      }
      return session;
    }
  }
});
