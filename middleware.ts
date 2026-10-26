import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect editor routes
  if (pathname.startsWith("/editor")) {
    // Check for auth cookie or session
    const token = request.cookies.get("sb-access-token") || 
                  request.cookies.get("supabase-auth-token") ||
                  request.cookies.get("supabase-auth-token-0")
    
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/editor/:path*"],
}