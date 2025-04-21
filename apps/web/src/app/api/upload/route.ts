// src/app/api/upload/route.ts
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_AUDIO = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/m4a", // Added to support mobile audio format
  "audio/x-m4a", // Another possible mobile format
];
const ALLOWED_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export async function POST(request: NextRequest) {
  try {
    console.log("📤 Upload API - Request received");
    console.log("📤 Content-Type:", request.headers.get("content-type"));

    // 1️⃣ Authentication check
    // Get JWT token from headers for mobile requests
    const authHeader = request.headers.get("authorization");
    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Mobile flow with JWT token
      const token = authHeader.substring(7);

      try {
        const adminClient = createAdminClient();

        // Verify the JWT token and get the user
        const { data: userData, error: jwtError } =
          await adminClient.auth.getUser(token);

        if (jwtError || !userData.user) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        user = userData.user;
        console.log(
          `✅ Upload API - Mobile request authenticated with JWT for user: ${user.id}`
        );
      } catch (error) {
        console.error("JWT validation failed", error);
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }
    } else {
      // Web flow authentication
      const supabase = await createServerClient();
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      user = authUser;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for user ID in header (used by mobile app when sending direct blobs)
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId && headerUserId !== user.id) {
      console.warn(`📤 User ID mismatch: ${headerUserId} vs ${user.id}`);
      // Allow it to proceed, but log the discrepancy
    }

    // 2️⃣ Handle the file upload
    // For non-FormData requests (React Native sometimes sends raw binary)
    const contentType = request.headers.get("content-type") || "";

    let file;
    let fileType = contentType;

    // Special handling for direct blob uploads from mobile
    if (contentType.includes("audio/") || contentType.includes("video/")) {
      console.log("📤 Direct blob upload detected");
      try {
        // Get the file content as an ArrayBuffer
        const arrayBuffer = await request.arrayBuffer();
        console.log(
          `📤 Received blob with size: ${arrayBuffer.byteLength} bytes`
        );

        // Create a File object
        file = new File([arrayBuffer], `mobile-upload-${Date.now()}.m4a`, {
          type: contentType,
        });

        console.log(`📤 Created File object: ${file.size} bytes`);
      } catch (error) {
        console.error("📤 Error processing blob:", error);
        return NextResponse.json(
          {
            error: "Failed to process audio blob",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 400 }
        );
      }
    }
    // Handle multipart/form-data uploads (web app)
    else if (contentType.includes("multipart/form-data")) {
      try {
        console.log("📤 Parsing FormData request");
        const formData = await request.formData();

        // Log available entries in formData for debugging
        const entries = Array.from(formData.entries());
        console.log(
          "📤 FormData entries:",
          entries.map(([key]) => key).join(", ")
        );

        // Handle both file formats for web and mobile
        const fileEntry = formData.get("file") || formData.get("audio");
        if (!fileEntry) {
          return NextResponse.json(
            { error: "No file uploaded" },
            { status: 400 }
          );
        }

        console.log("📤 File entry type:", typeof fileEntry);

        // Ensure we have a File object
        file = fileEntry as File;
        fileType = file.type;

        console.log(
          `📤 File found: ${file.name}, ${file.type}, ${file.size} bytes`
        );
      } catch (error) {
        console.error("📤 Error parsing FormData:", error);
        return NextResponse.json(
          {
            error: "Failed to parse form data",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 400 }
        );
      }
    } else {
      // Unknown content type
      console.error(`📤 Unsupported content type: ${contentType}`);
      return NextResponse.json(
        {
          error: "Unsupported content type",
          details: `Expected multipart/form-data or audio/*, received: ${contentType}`,
        },
        { status: 415 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file found in request" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // More permissive file type checking - just check if it contains audio/ or video/
    const isAudioOrVideo =
      fileType.includes("audio/") ||
      fileType.includes("video/") ||
      ALLOWED_AUDIO.includes(fileType) ||
      ALLOWED_VIDEO.includes(fileType);

    if (!isAudioOrVideo) {
      console.error(`📤 Unsupported file type: ${fileType}`);
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 415 }
      );
    }

    // 3️⃣ Stream directly into AssemblyAI
    const apiKey = process.env.ASSEMBLYAI_API_KEY!;
    console.log("📤 Uploading to AssemblyAI...");

    try {
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "content-type": "application/octet-stream",
        },
        body: file.stream(),
        duplex: "half", // ← required by Edge to allow streaming bodies
      } as RequestInit);

      if (!uploadRes.ok) {
        const e = await uploadRes.json().catch(() => ({}));
        console.error("📤 AssemblyAI upload failed:", e);
        return NextResponse.json(
          { error: e.error ?? "Upstream upload failed" },
          { status: uploadRes.status }
        );
      }

      const { upload_url } = await uploadRes.json();
      console.log("📤 AssemblyAI upload successful");

      const filename = `recording_${Date.now()}`;
      return NextResponse.json({
        uploadUrl: upload_url,
        filename: filename,
      });
    } catch (error) {
      console.error("📤 Error during AssemblyAI upload:", error);
      return NextResponse.json(
        {
          error: "Failed to upload to transcription service",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("📤 Unhandled error in upload route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
