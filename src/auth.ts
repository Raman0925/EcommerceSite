import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const creds = credentials as { email?: string; password?: string };
        if (!creds?.email || !creds?.password) {
          return null;
        }

        await dbConnect();

        const user = await UserModel.findOne({
          email: creds.email,
        }).select("+password");
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(creds.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!user) return token;
      const u = user as Partial<{ id: string; role: string }>;
      const nextToken = {
        ...token,
        userId: u.id ?? token.userId,
        role: u.role ?? token.role ?? "user",
      };
      return nextToken;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      const nextSession = {
        ...session,
        user: {
          ...session.user,
          id: (token.userId as string | undefined) ?? session.user.id,
          role:
            (token.role as string | undefined) ?? session.user.role ?? "user",
        },
      };
      return nextSession;
    },
  },
});
