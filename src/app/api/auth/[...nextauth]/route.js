import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Dummy user object for testing (no MongoDB needed)
const dummyUser = {
  id: "123",
  userName: "Test User",
  email: "test@example.com",
  imageUrl: "",
  isVerified: true,
};

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        // Skip database, just return a dummy user
        const { email, password } = credentials;
        // Optional: you can add basic check here
        if (email && password) {
          return { ...dummyUser, email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/",
  },
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.JWT_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      // Skip MongoDB, just allow Google sign-in
      if (account.provider === "google") {
        return {
          id: profile.id || "google_dummy_id",
          userName: profile.name,
          email: profile.email,
          imageUrl: profile.picture,
          isVerified: profile.email_verified,
        };
      }
      return true;
    },
    async session({ session }) {
      // Add dummy user info to session
      session.user = { ...dummyUser, email: session.user.email };
      return session;
    },
  },
};

const handler = (req, res) => NextAuth(req, res, options);
export { handler as GET, handler as POST };
