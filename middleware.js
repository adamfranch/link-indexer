
import { NextResponse } from "next/server";

export function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    return new NextResponse("Server authentication is not configured.", {
      status: 503
    });
  }

  const auth = request.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const separator = decoded.indexOf(":");

      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);

      if (
        separator !== -1 &&
        suppliedUser === user &&
        suppliedPassword === password
      ) {
        return NextResponse.next();
      }
    } catch {
      // Invalid authorization header
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Personal LinkIndexer"',
      "Cache-Control": "no-store"
    }
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
