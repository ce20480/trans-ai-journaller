// src/app/api/upload/route.ts
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_AUDIO = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];
const ALLOWED_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export async function POST(request: NextRequest) {
  // 1️⃣ Auth your user here (omitted for brevity)…

  // 2️⃣ Grabs the incoming File
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  if (![...ALLOWED_AUDIO, ...ALLOWED_VIDEO].includes(file.type))
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 415 }
    );

  // 3️⃣ Stream directly into AssemblyAI
  const apiKey = process.env.ASSEMBLYAI_API_KEY!;
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
    return NextResponse.json(
      { error: e.error ?? "Upstream upload failed" },
      { status: uploadRes.status }
    );
  }

  const { upload_url } = await uploadRes.json();
  return NextResponse.json({ uploadUrl: upload_url });
}
