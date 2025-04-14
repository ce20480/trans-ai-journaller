import { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

export interface AuthResult {
  isAuthenticated: boolean;
  username?: string;
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get the token from cookies
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        isAuthenticated: false,
        error: "No authentication token provided",
      };
    }

    // Verify JWT
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "default-secret-change-in-production"
    ) as { username: string };

    return {
      isAuthenticated: true,
      username: decoded.username,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      isAuthenticated: false,
      error: "Invalid or expired token",
    };
  }
}
