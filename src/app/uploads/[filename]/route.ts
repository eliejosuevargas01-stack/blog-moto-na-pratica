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

    // Verificar se o arquivo original existe. Se não existir, retornar SVG placeholder amigável
    if (!fs.existsSync(filePath)) {
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="#151515"/>
  <rect x="2" y="2" width="1196" height="671" fill="none" stroke="#262626" stroke-width="2"/>
  <g transform="translate(600, 310)" text-anchor="middle">
    <circle cx="0" cy="-20" r="40" fill="#252525"/>
    <path d="M-15 -30 L15 -30 L15 -10 L-15 -10 Z M-8 -35 L8 -35 L5 -30 L-5 -30 Z" fill="#E31E24"/>
    <circle cx="0" cy="-20" r="10" fill="#151515" stroke="#E31E24" stroke-width="3"/>
    <text x="0" y="55" font-family="'Barlow', sans-serif, system-ui" font-size="22" font-weight="700" fill="#FFFFFF" letter-spacing="1">CURIOSOTECH</text>
    <text x="0" y="85" font-family="'Barlow', sans-serif, system-ui" font-size="14" font-weight="400" fill="#888888">Imagem em processamento ou não encontrada no servidor</text>
  </g>
</svg>`;
      return new Response(fallbackSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Obter parâmetro de largura ?w=
    const { searchParams } = new URL(request.url);
    const wParam = searchParams.get("w");
    let targetWidth = 1400; // Largura padrão
    if (wParam) {
      const parsedWidth = parseInt(wParam, 10);
      if (!isNaN(parsedWidth) && parsedWidth > 0 && parsedWidth <= 2500) {
        targetWidth = parsedWidth;
      }
    }

    // Suportar conversão e redimensionamento para formatos de imagem comuns
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
      // Guardar arquivos de cache em uma pasta oculta uploads/.cache para não poluir a galeria
      const cacheDir = path.join(UPLOADS_DIR, ".cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const cacheFilename = filename.replace(/\.(jpe?g|png|webp)$/i, "") + `.w${targetWidth}.webp`;
      const cachePath = path.join(cacheDir, cacheFilename);

      // Checar se já existe versão correspondente em cache no disco
      if (!fs.existsSync(cachePath)) {
        const inputBuffer = fs.readFileSync(filePath);
        const webpBuffer = await sharp(inputBuffer)
          .rotate() // Corrigir orientação EXIF automaticamente
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        fs.writeFileSync(cachePath, webpBuffer);
      }

      const webpBuffer = fs.readFileSync(cachePath);
      return new Response(new Uint8Array(webpBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Para outros formatos (ex: gif, svg): servir diretamente
    const fileBuffer = fs.readFileSync(filePath);
    let contentType = "application/octet-stream";
    if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".avif") contentType = "image/avif";

    return new Response(new Uint8Array(fileBuffer), {
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
