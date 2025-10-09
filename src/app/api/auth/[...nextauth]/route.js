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
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback:", { user, account, profile });
      if (account.provider === "google") {
        console.log("Google profile:", profile);
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        if (account?.provider === "google") {
          token.googleProfile = profile;
        }
      }
      console.log("jwt callback:", token);
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      console.log("session callback:", session);
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("redirect callback:", { url, baseUrl });
      // Prioritize callbackUrl from signIn
      if (url.includes("callbackUrl")) {
        const callbackUrl = new URL(url).searchParams.get("callbackUrl") || "/dashboard";
        console.log("Using callbackUrl:", callbackUrl);
        return callbackUrl.startsWith("http") ? callbackUrl : `${baseUrl}${callbackUrl}`;
      }
      // Fallback to relative URL
      if (url.startsWith("/")) {
        console.log("Using relative URL:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // Default to /dashboard
      console.log("Default redirect to:", `${baseUrl}/dashboard`);
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth } = NextAuth(authOptions);

export { handlers as GET, handlers as POST };
