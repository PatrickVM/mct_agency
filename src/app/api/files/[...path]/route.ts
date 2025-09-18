import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Construct file path
    const uploadsDir = process.env.UPLOADS_DIR || "/app/uploads";
    const requestedPath = pathSegments.join("/");
    const filePath = path.join(uploadsDir, requestedPath);

    // Security check - ensure path is within uploads directory
    const normalizedUploadsDir = path.resolve(uploadsDir);
    const normalizedFilePath = path.resolve(filePath);

    if (!normalizedFilePath.startsWith(normalizedUploadsDir)) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Check if file exists
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return new NextResponse("File not found", { status: 404 });
      }
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read and serve file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".webp":
        contentType = "image/webp";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
    }

    // Set caching headers for images
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
      "Content-Length": fileBuffer.length.toString(),
    });

    return new NextResponse(new Uint8Array(fileBuffer), { headers });
  } catch (error) {
    console.error("File serving error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}