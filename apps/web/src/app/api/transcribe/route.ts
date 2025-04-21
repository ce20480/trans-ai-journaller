// file: app/api/transcribe/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import axios from "axios";

export async function POST(request: NextRequest) {
  // 1️⃣ Auth check
  let user = null;

  // Get JWT token from headers for mobile requests
  const authHeader = request.headers.get("authorization");

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
        `✅ Transcribe API - Mobile request authenticated with JWT for user: ${user.id}`
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

  // 2️⃣ Grab the request body
  const requestBody = await request.json();

  // Check for uploadUrl first (direct from AssemblyAI), then filename, then regular uploadUrl
  const uploadUrl = requestBody.uploadUrl;
  const filename = requestBody.filename;

  if (!uploadUrl && !filename) {
    return NextResponse.json(
      { error: "No uploadUrl or filename provided" },
      { status: 400 }
    );
  }

  console.log(`🎤 Transcribe API - Request details:
    - User: ${user.id}
    - uploadUrl: ${uploadUrl ? "provided" : "not provided"}
    - filename: ${filename || "not provided"}
  `);

  const apiKey = process.env.ASSEMBLYAI_API_KEY!;

  // If we have an uploadUrl, use it directly with AssemblyAI
  if (uploadUrl) {
    console.log("🎤 Using provided uploadUrl for transcription");
    try {
      // Kick off transcription
      const { data: kick } = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: uploadUrl },
        { headers: { authorization: apiKey } }
      );
      const transcriptId = kick.id;

      // Poll for completion
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const { data: poll } = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          { headers: { authorization: apiKey } }
        );
        if (poll.status === "completed") {
          console.log("🎤 Transcription completed successfully");
          return NextResponse.json({ transcription: poll.text });
        }
        if (poll.status === "error") {
          throw new Error(`Transcription failed: ${poll.error}`);
        }
        console.log(
          `🎤 Transcription in progress: ${poll.status} (attempt ${i + 1}/20)`
        );
      }
      return NextResponse.json(
        { error: "Transcription timed out" },
        { status: 504 }
      );
    } catch (error) {
      console.error("🎤 Error during transcription:", error);
      return NextResponse.json(
        {
          error: "Transcription failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  // Handle mobile case where we need to get recording from storage
  if (filename && !uploadUrl) {
    // Here we would retrieve file from storage based on filename
    // For now, just return mock data for mobile flow
    console.log(
      `🎤 Processing transcription for mobile recording: ${filename}`
    );
    return NextResponse.json({
      transcription: "This is a mock transcription for mobile testing.",
    });
  }

  // This should not happen given the earlier check, but just in case
  return NextResponse.json(
    { error: "No valid audio source provided" },
    { status: 400 }
  );
}
