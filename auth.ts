import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Sendgrid from "next-auth/providers/sendgrid";

import prisma from "./lib/prisma";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal db role. */
      role: string;
      hostId: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    Google,
    Sendgrid({
      from: "no-reply@atmareserve.com",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, hostUsers: true },
        });

        if (!dbUser) {
          console.error(`No database user found for id: ${user.id}`);
          return session;
        }

        // Set basic user properties
        session.user.id = dbUser.id;
        session.user.role = dbUser.role || "user"; // Default role if none set

        // Only proceed with host-related logic for host/admin roles
        if (dbUser.role === "host" || dbUser.role === "admin") {
          if (dbUser.hostUsers && dbUser.hostUsers.length > 0) {
            session.user.hostId = dbUser.hostUsers[0]?.hostId;
          } else {
            // Fallback to System host
            const systemHost = await prisma.host.findFirst({
              where: { name: "System" },
            });

            if (!systemHost) {
              console.error("System host not found");
              throw new Error("System host not found");
            }

            session.user.hostId = systemHost.id;
          }
        } else {
          // For non-host/admin users, set a default or null hostId
          session.user.hostId = "";
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        // Return session without modifications if there's an error
        return session;
      }
    },
  },
});
