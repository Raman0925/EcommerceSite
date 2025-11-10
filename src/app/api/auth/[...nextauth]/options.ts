import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/UserModel";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.email },
              { username: credentials.email },
            ],
          });
          if (!user) {
            throw new Error("Invalid email or username");
          }
          if (!user.isVerified) {
            throw new Error("please verify your account");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordCorrect) {
            throw new Error("Invalid password");
          }
          return user;
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  Callbacks : {
    async jwt({ token, user}) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMassages = user.isAcceptingMassages;
        token.username = user.username;
      }
        return token ;
    },
    async session({ session, token}) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified ;
        session.user.isAcceptingMassages = token.isAcceptingMassages ;
        session.user.username = token.username;
      }
        return session ;
    }
  },
  Pages: {
    signIn: "/sign-in",
  },
  Session: {
    strategy: "jwt",
  },
  Secret : process.env.NEXTAUTH_SECRET,
};
