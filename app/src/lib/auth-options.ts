import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Email and password are required");
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error("No account found with this email");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");
        if (!user.emailVerified) throw new Error("Please verify your email before logging in. Check your inbox.");
        if (user.isBanned) throw new Error("Your account has been suspended. Please contact support.");
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          onboarded: user.onboarded,
          rememberMe: credentials.rememberMe !== "false",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (default is 30 — shorter window limits exposure)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword;
        token.onboarded = (user as any).onboarded;
        const rememberMe = (user as any).rememberMe !== false;
        // 30 days if remembered, 1 day if not
        token.exp = Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60);
      }
      // Re-fetch user on every session check to catch bans and role changes
      if (token.id && trigger !== "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isBanned: true, role: true, mustChangePassword: true, onboarded: true },
        });
        if (!dbUser || dbUser.isBanned) {
          // Invalidate token for banned/deleted users
          return { ...token, banned: true };
        }
        token.role = dbUser.role;
        token.mustChangePassword = dbUser.mustChangePassword;
        token.onboarded = dbUser.onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as any).banned) {
        // Return empty session to force logout
        return { ...session, user: undefined as any };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
  pages: { signIn: "/auth", error: "/auth" },
  secret: process.env.NEXTAUTH_SECRET,
};
