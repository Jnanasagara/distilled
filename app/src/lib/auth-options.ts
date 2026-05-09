import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { AVATAR_SEEDS } from "@/lib/avatars";
import bcrypt from "bcrypt";

function randomAvatarSeed(): string {
  return AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { prompt: "select_account" } },
    }),
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existing = await prisma.user.findUnique({ where: { email: user.email } });

        if (existing) {
          if (existing.isBanned) return false;
          // Mark email as verified if it wasn't already (e.g. they signed up with password but never verified)
          if (!existing.emailVerified) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { emailVerified: new Date() },
            });
          }
        } else {
          // New user via Google — create account, send straight to onboarding
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? null,
              emailVerified: new Date(),
              avatarSeed: randomAvatarSeed(),
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // OAuth sign-in — look up DB user by email
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, mustChangePassword: true, onboarded: true, avatarSeed: true, isBanned: true },
        });
        if (!dbUser || dbUser.isBanned) return { ...token, banned: true };
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.mustChangePassword = false;
        token.onboarded = dbUser.onboarded;
        token.avatarSeed = dbUser.avatarSeed ?? null;
        token.exp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
        return token;
      }

      // Credentials sign-in
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

      // Subsequent requests — refresh from DB
      if (token.id && trigger !== "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isBanned: true, role: true, mustChangePassword: true, onboarded: true, avatarSeed: true },
        });
        if (!dbUser || dbUser.isBanned) return { ...token, banned: true };
        token.role = dbUser.role;
        token.mustChangePassword = dbUser.mustChangePassword;
        token.onboarded = dbUser.onboarded;
        token.avatarSeed = dbUser.avatarSeed ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if ((token as any).banned) return { ...session, user: undefined as any };
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
