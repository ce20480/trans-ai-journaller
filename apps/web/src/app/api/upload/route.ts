// src/app/api/upload/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  console.log("📤 Upload API - Request received");
  try {
    console.log("📤 Content-Type:", request.headers.get("content-type"));

    // 1️⃣ Authentication check
    const authHeader = request.headers.get("authorization");
    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
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
      // Web flow authentication via session cookie
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

    // 2️⃣ Handle the file upload (Raw stream or multipart/form-data)
    const contentType = request.headers.get("content-type") || "";
    let file: File;
    let fileType = contentType;

    if (contentType.includes("audio/") || contentType.includes("video/")) {
      console.log("📤 Direct binary upload detected");
      try {
        const buffer = await request.arrayBuffer();
        file = new File([buffer], `upload-${Date.now()}`, {
          type: contentType,
        });
        console.log(`📤 Buffer size: ${buffer.byteLength} bytes`);
      } catch (err) {
        console.error("📤 Error processing binary body:", err);
        return NextResponse.json(
          { error: "Failed to process binary upload" },
          { status: 400 }
        );
      }
    } else if (contentType.startsWith("multipart/form-data")) {
      console.log("📤 Parsing FormData request");
      try {
        const formData = await request.formData();
        const entry = formData.get("file") || formData.get("audio");
        if (!entry) {
          return NextResponse.json(
            { error: "No file uploaded" },
            { status: 400 }
          );
        }
        file = entry as File;
        fileType = file.type;
        console.log(`📤 File entry: ${file.name}, ${file.size} bytes`);
      } catch (err) {
        console.error("📤 Error parsing FormData:", err);
        return NextResponse.json(
          { error: "Failed to parse form data" },
          { status: 400 }
        );
      }
    } else {
      console.error(`📤 Unsupported content type: ${contentType}`);
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 415 }
      );
    }

    // 3️⃣ Validate file
    if (!file) {
      return NextResponse.json(
        { error: "No file found in request" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }
    const isAudioOrVideo =
      fileType.includes("audio/") || fileType.includes("video/");
    if (!isAudioOrVideo) {
      console.error(`📤 Unsupported file type: ${fileType}`);
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 415 }
      );
    }

    // 4️⃣ Stream to AssemblyAI
    console.log("📤 Uploading to AssemblyAI...");
    const apiKey = process.env.ASSEMBLYAI_API_KEY!;
    try {
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "content-type": "application/octet-stream",
        },
        body: file.stream(),
        duplex: "half",
      } as RequestInit);
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        console.error("📤 AssemblyAI upload failed:", err);
        return NextResponse.json(
          { error: err.error ?? "Upstream upload failed" },
          { status: uploadRes.status }
        );
      }
      const { upload_url } = await uploadRes.json();
      console.log("📤 AssemblyAI upload successful");
      const filename = `recording_${Date.now()}`;
      return NextResponse.json({ filename, uploadUrl: upload_url });
    } catch (err) {
      console.error("📤 Error during AssemblyAI upload:", err);
      return NextResponse.json(
        { error: "Failed to upload to transcription service" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("📤 Unhandled error in upload route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
