// file: app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  // 1️⃣ Auth check
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ Grab the upload URL
  const { uploadUrl } = await request.json();
  if (!uploadUrl) {
    return NextResponse.json(
      { error: "No uploadUrl provided" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY!;
  // 3️⃣ Kick off transcription
  const { data: kick } = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    { audio_url: uploadUrl },
    { headers: { authorization: apiKey } }
  );
  const transcriptId = kick.id;

  // 4️⃣ Poll for completion
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const { data: poll } = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers: { authorization: apiKey } }
    );
    if (poll.status === "completed") {
      return NextResponse.json({ transcription: poll.text });
    }
    if (poll.status === "error") {
      throw new Error(`Transcription failed: ${poll.error}`);
    }
  }
  return NextResponse.json(
    { error: "Transcription timed out" },
    { status: 504 }
  );
}
