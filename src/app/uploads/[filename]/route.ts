import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const ext = path.extname(filename).toLowerCase();
    const filePath = path.join(UPLOADS_DIR, filename);

    // Verificar se o arquivo original existe
    if (!fs.existsSync(filePath)) {
      return new Response("Arquivo não encontrado", { status: 404 });
    }

    // Para JPEG/PNG: converter para WebP automaticamente (com cache em disco)
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      const webpFilename = filename.replace(/\.(jpe?g|png)$/i, ".webp");
      const webpPath = path.join(UPLOADS_DIR, webpFilename);

      // Checar se já existe versão WebP em cache no disco
      if (!fs.existsSync(webpPath)) {
        const inputBuffer = fs.readFileSync(filePath);
        const webpBuffer = await sharp(inputBuffer)
          .rotate() // Corrigir orientação EXIF automaticamente
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        fs.writeFileSync(webpPath, webpBuffer);
      }

      const webpBuffer = fs.readFileSync(webpPath);
      return new Response(webpBuffer, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Para WebP e outros formatos: servir diretamente
    const fileBuffer = fs.readFileSync(filePath);
    let contentType = "application/octet-stream";
    if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".avif") contentType = "image/avif";

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
