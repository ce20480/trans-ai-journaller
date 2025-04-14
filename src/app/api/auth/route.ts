import { NextRequest, NextResponse } from "next/server";
import { createToken, JWTPayload } from "@/utils/auth";

// Log environment status on first load
console.log("Auth API Environment Check:", {
  JWT_SECRET_SET: !!process.env.JWT_SECRET,
  AUTH_USERNAME_SET: !!process.env.AUTH_USERNAME,
  AUTH_PASSWORD_SET: !!process.env.AUTH_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
});

const USERS = [
  {
    username: process.env.AUTH_USERNAME || "admin",
    password: process.env.AUTH_PASSWORD || "password",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check credentials
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token using jose
    const payload: JWTPayload = { username: user.username };
    const token = await createToken(payload);

    console.log("Token generated for user:", user.username);

    // Set HTTP-only cookie with the token
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    console.log("Cookie set:", {
      name: "auth_token",
      value: token.substring(0, 10) + "...",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
