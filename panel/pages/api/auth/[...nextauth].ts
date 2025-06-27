import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";

interface CredentialsAuth {
  id: string;
  name: string;
  email: string;
  image: string;
  role: 'user' | 'global_admin';
}

declare module "next-auth" {
  interface Session {
    user: CredentialsAuth;
  }
  interface User extends CredentialsAuth {}
}

declare module "next-auth/providers/credentials" {
  interface CredentialsAuth {
    id: string;
    name: string;
    email: string;
    image: string;
    role: 'user' | 'global_admin';
  }
}

export default NextAuth({
  providers: [
    process.env.GOOGLE_CLIENT_ID && GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    process.env.FACEBOOK_CLIENT_ID && FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    process.env.APPLE_CLIENT_ID && AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    process.env.TWITTER_CLIENT_ID && TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    process.env.LINKEDIN_CLIENT_ID && LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === 'test@example.com' && credentials?.password === 'test123') {
          return {
            id: 'test-user',
            name: 'Test User',
            email: credentials?.email as string,
            image: 'https://ui-avatars.com/api/?name=Test+User&background=random',
            role: 'global_admin'
          };
        }
        return null;
      },
    }),
  ].filter(Boolean) as any[],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'global_admin';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  // Remove deprecated 'jwt' config and use 'secret' at the root level
  secret: process.env.JWT_SECRET,
  events: {
    async signIn({ user, account, profile, isNewUser }) {
    },
    async signOut({ token }) {
    },
    async createUser({ user }) {
    },
    async linkAccount({ account }) {
    },
  },
});
