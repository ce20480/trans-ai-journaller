import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { verifyAuth } from "@/utils/auth";

// Ensure uploads directory exists
const createUploadsDir = async () => {
  try {
    await mkdir(join(process.cwd(), "uploads"), { recursive: true });
  } catch (error) {
    console.error("Failed to create uploads directory:", error);
  }
};

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await verifyAuth(request);
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type (audio/video)
    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only audio and video files are accepted" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    await createUploadsDir();

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(process.cwd(), "uploads", filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return success with the file path for further processing
    return NextResponse.json({
      success: true,
      filePath: filepath,
      filename: filename,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
