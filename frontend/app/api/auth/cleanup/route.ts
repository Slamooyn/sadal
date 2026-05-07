import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("authjs.session-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("authjs.callback-url", "", { path: "/", maxAge: 0 });
  response.cookies.set("authjs.csrf-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("__Secure-authjs.session-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("fashai_token", "", { path: "/", maxAge: 0 });

  return response;
}
