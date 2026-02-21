import { CentreRole, GlobalRole } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      globalRole?: GlobalRole;
      centreRoles: { centreId: string; role: CentreRole }[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    globalRole?: GlobalRole;
    centreRoles?: { centreId: string; role: CentreRole }[];
  }
}
