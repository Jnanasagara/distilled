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
    maxAge: 7 * 24 * 60 * 60,
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
        const isAdmin = (user as any).role === "ADMIN";
        const rememberMe = !isAdmin && (user as any).rememberMe !== false;
        const expiry = isAdmin ? 8 * 60 * 60 : rememberMe ? 365 * 24 * 60 * 60 : 24 * 60 * 60;
        token.exp = Math.floor(Date.now() / 1000) + expiry;
      }
      if (token.id && trigger !== "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isBanned: true, role: true, mustChangePassword: true, onboarded: true, avatarSeed: true },
        });
        if (!dbUser || dbUser.isBanned) {
          return { ...token, banned: true };
        }
        token.role = dbUser.role;
        token.mustChangePassword = dbUser.mustChangePassword;
        token.onboarded = dbUser.onboarded;
        token.avatarSeed = dbUser.avatarSeed ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if ((token as any).banned) {
        return { ...session, user: undefined as any };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        session.user.onboarded = token.onboarded as boolean;
        session.user.avatarSeed = (token.avatarSeed as string | null) ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/auth", error: "/auth" },
  secret: process.env.NEXTAUTH_SECRET,
};
