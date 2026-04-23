import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Solo proteger admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const adminSession = request.cookies.get("admin-session")?.value

  if (adminSession === "ok") {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin-login", request.url)
  loginUrl.searchParams.set("from", pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*"],
}