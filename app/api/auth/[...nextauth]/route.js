import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { requireEnv } from "../../../../lib/env";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "LogicEye Admin",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        let adminUsername = "";
        let adminPassword = "";

        try {
          adminUsername = requireEnv("ADMIN_USERNAME");
          adminPassword = requireEnv("ADMIN_PASSWORD");
        } catch (error) {
          console.error("[NextAuth Config Error]", error);
          return null;
        }

        const isValidUser = safeEqual(credentials.username, adminUsername);
        const isValidPassword = safeEqual(credentials.password, adminPassword);

        if (!isValidUser || !isValidPassword) {
          return null;
        }

        return {
          id: "logiceye-admin",
          name: "LogicEye Admin",
          username: adminUsername,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name || session.user.name;
        session.user.username = token.username;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
