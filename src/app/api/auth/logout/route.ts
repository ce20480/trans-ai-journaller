import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });

    // Clear the auth token cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Setting maxAge to 0 removes the cookie
    });

    console.log("User logged out, auth_token cookie cleared");

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
