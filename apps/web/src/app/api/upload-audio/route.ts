export const runtime = "nodejs"; // Use Node.js runtime instead of Edge for better binary handling

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  console.log("📱 Upload-Audio API - Request received");

  try {
    // 1️⃣ Authentication check
    const authHeader = request.headers.get("authorization");
    const userId = request.headers.get("x-user-id");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the token
    const adminClient = createAdminClient();
    const { data: userData, error: jwtError } =
      await adminClient.auth.getUser(token);

    if (jwtError || !userData.user) {
      console.error("JWT validation failed", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // If userId header is provided, verify it matches
    if (userId && userId !== userData.user.id) {
      console.warn(`⚠️ User ID mismatch: ${userId} vs ${userData.user.id}`);
    }

    console.log(
      `✅ Upload-Audio API - Authenticated user: ${userData.user.id}`
    );

    // 2️⃣ Get the audio content from the request body
    console.log("📱 Getting audio data from request...");
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("audio/")) {
      return NextResponse.json(
        {
          error: "Invalid content type",
          details: `Expected audio/* but got ${contentType}`,
        },
        { status: 415 }
      );
    }

    const audioArrayBuffer = await request.arrayBuffer();
    console.log(
      `📱 Received ${audioArrayBuffer.byteLength} bytes of audio data`
    );

    // 3️⃣ Upload to AssemblyAI
    console.log("📱 Uploading to AssemblyAI...");
    const apiKey = process.env.ASSEMBLYAI_API_KEY!;

    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/octet-stream",
      },
      body: audioArrayBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error("📱 AssemblyAI upload failed:", errorData);
      return NextResponse.json(
        {
          error: "Failed to upload to AssemblyAI",
          details: errorData.error || uploadResponse.statusText,
        },
        { status: uploadResponse.status }
      );
    }

    const { upload_url } = await uploadResponse.json();
    console.log(
      "📱 AssemblyAI upload success:",
      upload_url.substring(0, 40) + "..."
    );

    // Generate a filename and return
    const filename = `mobile_${userData.user.id.substring(0, 8)}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      filename,
      uploadUrl: upload_url,
    });
  } catch (error) {
    console.error("📱 Error processing upload:", error);
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
