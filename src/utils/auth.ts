import { NextRequest } from "next/server";
import * as jose from "jose";

// Centralized JWT secret to ensure consistency across the application
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "WARNING: JWT_SECRET not set in environment variables. Using default secret (insecure)"
    );
    return "default-secret-change-in-production";
  }
  return secret;
};

// Define proper JWT payload type
export interface JWTPayload {
  username: string;
  [key: string]: unknown;
}

// Function to create JWT tokens
export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(getJwtSecret());
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

// Function to verify JWT tokens
export async function verifyToken(
  token: string
): Promise<{ payload: JWTPayload | null; isValid: boolean }> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jose.jwtVerify(token, secret);
    return { payload: payload as JWTPayload, isValid: true };
  } catch (error) {
    console.error(
      "JWT verification error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return { payload: null, isValid: false };
  }
}

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

    // Verify JWT using jose
    const { payload, isValid } = await verifyToken(token);

    if (!isValid || !payload) {
      return {
        isAuthenticated: false,
        error: "Invalid token",
      };
    }

    return {
      isAuthenticated: true,
      username: payload.username as string,
    };
  } catch (error) {
    console.error(
      "Authentication error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      isAuthenticated: false,
      error: "Invalid or expired token",
    };
  }
}
