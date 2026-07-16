import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Resolve the path to the uploads folder
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    // Verify if the file exists on the filesystem
    if (!fs.existsSync(filePath)) {
      return new Response("Arquivo não encontrado", { status: 404 });
    }

    // Read the file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the appropriate MIME type based on the file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";

    // Return the file stream with cache headers
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Erro ao servir arquivo:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
