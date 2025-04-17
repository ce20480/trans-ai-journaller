import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { verifyAuth } from "@/app/utils/auth";

// Configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

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
    console.log("Upload attempted without authentication");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("Upload attempted without file");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Log file details
    console.log("File upload attempted:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    });

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds the limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    // Check file type (audio/video)
    const isAllowedAudio = ALLOWED_AUDIO_TYPES.includes(file.type);
    const isAllowedVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isAllowedAudio && !isAllowedVideo) {
      return NextResponse.json(
        {
          error: "Unsupported file type",
          supportedTypes: [...ALLOWED_AUDIO_TYPES, ...ALLOWED_VIDEO_TYPES].join(
            ", "
          ),
        },
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

    console.log("File uploaded successfully:", {
      filepath,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      type: file.type,
    });

    // Return success with the file path for further processing
    return NextResponse.json({
      success: true,
      filePath: filepath,
      filename: filename,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during file upload";

    return NextResponse.json(
      { error: "Failed to upload file", details: errorMessage },
      { status: 500 }
    );
  }
}
