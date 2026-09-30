import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import Credentials from "@auth/express/providers/credentials";
import clientPromise, { getDb } from "./mongodb";
import bcrypt from "bcryptjs";

const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID || "690565829553-djd1b5gbf82r95nfo3mjqdcc13uspn70.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET || "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";
const AUTH_SECRET = process.env.AUTH_SECRET || "8f9a2b4c6e8d1f3a5b7c9e0d2f4a6b8c";

export const authConfig = {
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const db = await getDb();
          const user = await db.collection("users").findOne({ 
            email: (credentials.email as string).toLowerCase().trim() 
          });

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
            if (isPasswordValid) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role || 'FORENSIC_INVESTIGATOR',
                badgeId: user.badgeId || 'FIP-AGENT-01',
              };
            }
          }
        } catch (err) {
          console.error("Auth authorize error:", err);
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'FORENSIC_INVESTIGATOR';
        token.badgeId = (user as any).badgeId || 'FIP-AGENT-01';
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).badgeId = token.badgeId;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
  trustHost: true,
};

export const auth = ExpressAuth(authConfig);

