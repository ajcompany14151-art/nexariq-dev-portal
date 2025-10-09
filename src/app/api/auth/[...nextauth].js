import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Optional: Add other providers (e.g., Credentials, Facebook) as needed
// import CredentialsProvider from "next-auth/providers/credentials";
// Optional: Database adapter for persistent user storage
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import prisma from "@/lib/prisma";

export default NextAuth({
  // Providers configuration
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent", // Forces Google to show the consent screen
          access_type: "offline", // Enables refresh tokens
          response_type: "code",
        },
      },
    }),
    // Optional: Add Credentials provider for email/password authentication
    /*
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Implement your own logic to validate credentials
        // Example: Check against a database
        const user = { id: "1", name: "User", email: credentials.email };
        if (user) {
          return user;
        }
        return null;
      },
    }),
    */
  ],

  // Optional: Database adapter for persistent storage
  /*
  adapter: PrismaAdapter(prisma),
  */

  // Session configuration
  session: {
    strategy: "jwt", // Use JWT for session management (default for no adapter)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Callbacks for customizing behavior
  callbacks: {
    // Handle sign-in logic
    async signIn({ user, account, profile }) {
      // Called when a user signs in
      // You can add custom logic here, e.g., save user to database
      // For Google, `profile` contains user data like email, name, etc.
      if (account.provider === "google") {
        // Example: Log user data or save to database
        console.log("Google profile:", profile);
        // Optionally check if user exists or create a new user in your database
        /*
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              // Add other fields as needed
            },
          });
        }
        */
        return true; // Return true to allow sign-in
      }
      return true; // Return true for other providers
    },

    // Add user data to JWT token
    async jwt({ token, user, account, profile }) {
      // Called when creating/updating JWT
      if (user) {
        // Initial sign-in: Add user data to token
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        // Add custom fields if needed
        if (account?.provider === "google") {
          token.googleProfile = profile; // Optional: Store Google profile data
        }
      }
      return token;
    },

    // Add user data to session
    async session({ session, token }) {
      // Called when creating/updating session
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      // Add custom fields if needed
      // session.user.googleProfile = token.googleProfile;
      return session;
    },

    // Customize redirect after sign-in
    async redirect({ url, baseUrl }) {
      // Redirect to /dashboard after successful sign-in
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.includes("callbackUrl")) {
        const callbackUrl = new URL(url).searchParams.get("callbackUrl");
        if (callbackUrl) {
          return callbackUrl;
        }
      }
      return baseUrl + "/dashboard";
    },
  },

  // Custom pages
  pages: {
    signIn: "/auth/signin", // Matches your provided component path
    // signOut: "/auth/signout",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/auth/new-user",
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Secret for signing JWTs
  secret: process.env.NEXTAUTH_SECRET,
});

// Export for Next.js 13+ App Router (if needed)
export const config = {
  api: {
    externalResolver: true,
  },
};