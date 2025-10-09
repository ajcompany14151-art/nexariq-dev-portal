import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    strategy: "jwt",
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
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback - url:", url, "baseUrl:", baseUrl);
      // Force redirect to /dashboard for internal paths
      if (url.startsWith(baseUrl) || url.includes("/auth/signin")) {
        const target = url.includes("callbackUrl=/dashboard") ? "/dashboard" : new URL(url).searchParams.get("callbackUrl") || "/dashboard";
        const redirectUrl = `${baseUrl}${target}`;
        console.log("Redirecting to:", redirectUrl);
        return redirectUrl;
      }
      return url;
    },
  },
  pages: {
    signIn: "/", // Set root as sign-in page
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
