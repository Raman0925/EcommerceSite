import NextAuth from "next-auth/next"
import { authOptions } from "./options"
const handlers = NextAuth(authOptions)
export const { GET, POST } = handlers