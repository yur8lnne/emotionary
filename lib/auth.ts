import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  connectionLimit: 5
})
const prisma = new PrismaClient({ adapter });

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId },
        });

        if (!user) return null;
        if (user.password !== credentials.password) return null;

        return {
          id: String(user.id),
          userId: user.userId,
          name: user.userId,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = user.userId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          userId: token.userId,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
