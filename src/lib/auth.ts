// src/lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "./env";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback:", { user, account, profile });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id || user.email; // Fallback for ID
        token.name = user.name;
        token.email = user.email;
        if (account?.provider === "google") {
          token.googleProfile = profile;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback - url:", url, "baseUrl:", baseUrl);
      // If the url is within the site, redirect to it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Otherwise redirect to the home page
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin", // Update to use the single signin page
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
