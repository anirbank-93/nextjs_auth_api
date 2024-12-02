import { NextResponse } from "next/server";
import authMiddleware from "./middlewares/api/authMiddleware";
import logMiddleware from "./middlewares/api/logMiddleware";

export const config = {
  matcher: "/api/:path",
};

export default function middleware(request: Request) {
  const authResult = authMiddleware(request);

  if (!authResult?.isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (request.url.includes("/api/blogs")) {
    const logResult = logMiddleware(request);
    console.log(logResult.response);
    
  }
  return NextResponse.next();
}
