import { NextResponse } from "next/server";
// export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl;
  if (token) {
    if (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up") || url.pathname.startsWith("/verify") || url.pathname.startsWith("/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};
