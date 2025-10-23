import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/home", req.url));
}
export const config = {
  matcher: ['/sign-in', '/sign-up', '/', '/dashboard/:path*','/verify/:path*'],
};
