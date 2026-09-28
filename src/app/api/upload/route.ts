import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";
import { saveOptimizedImageBuffer, processImageBase64, saveAudioBuffer } from "@/lib/image-utils";
import { verifyAdminToken } from "@/lib/auth";
import { verifyM2MAuth } from "@/lib/m2m";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_BASE64_LEN = Math.ceil(MAX_IMAGE_SIZE * 1.37); // ~20.5MB
const MAX_AUDIO_BASE64_LEN = Math.ceil(MAX_AUDIO_SIZE * 1.37); // ~137MB

const ALLOWED_AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac", "webm"]);

function detectFileType(buffer: Buffer): { type: "image" | "audio"; format: string } | null {
  if (buffer.length < 12) return null;

  // JPEG: ffd8ff
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { type: "image", format: "jpeg" };
  }

  // PNG: 89504e470d0a1a0a
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { type: "image", format: "png" };
  }

  // GIF: GIF87a (474946383761) or GIF89a (474946383961)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { type: "image", format: "gif" };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { type: "image", format: "webp" };
  }

  // AVIF: ....ftypavif or ftypmif1
  if (buffer.length >= 16 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "mif1") {
      return { type: "image", format: "avif" };
    }
  }

  // MP3: ID3 or frame sync
  if (buffer.toString("ascii", 0, 3) === "ID3") {
    return { type: "audio", format: "mp3" };
  }
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { type: "audio", format: "mp3" };
  }

  // WAV: RIFF....WAVE
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WAVE"
  ) {
    return { type: "audio", format: "wav" };
  }

  // OGG: OggS
  if (buffer.toString("ascii", 0, 4) === "OggS") {
    return { type: "audio", format: "ogg" };
  }

  // M4A / AAC: ....ftypM4A
  if (buffer.length >= 16 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "M4A " || brand === "mp42" || brand === "isom") {
      return { type: "audio", format: "m4a" };
    }
  }

  // WEBM: 1a45dfa3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { type: "audio", format: "webm" };
  }

  return null;
}

async function isAuthorized(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  const adminToken = match ? match[1] : null;
  if (adminToken) {
    const admin = await verifyAdminToken(adminToken);
    if (admin) return true;
  }

  if (verifyM2MAuth(request)) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      const base64Str = json.image || json.file || json.base64 || json.audio;
      if (!base64Str || typeof base64Str !== "string") {
        return NextResponse.json(
          { error: "Nenhuma string base64 válida enviada no JSON (use 'image', 'file', 'audio' ou 'base64')." },
          { status: 400 }
        );
      }

      const isAudio = Boolean(json.audio || (json.type && String(json.type).startsWith("audio")));
      const maxLen = isAudio ? MAX_AUDIO_BASE64_LEN : MAX_IMAGE_BASE64_LEN;

      if (base64Str.length > maxLen) {
        return NextResponse.json(
          { error: `Tamanho excede o limite permitido (${isAudio ? "100MB para áudio" : "15MB para imagens"}).` },
          { status: 413 }
        );
      }

      const cleanBase64 = base64Str.replace(/^data:[a-z0-9\-]+\/[a-z0-9\+\-]+;base64,/i, "").trim();
      const inputBuffer = Buffer.from(cleanBase64, "base64");

      const detected = detectFileType(inputBuffer);
      if (!detected) {
        return NextResponse.json(
          { error: "Tipo de arquivo inválido ou não suportado (validação por magic bytes)." },
          { status: 400 }
        );
      }

      if (isAudio || detected.type === "audio") {
        const rawExt = String(json.ext || detected.format || "mp3").toLowerCase().replace(/^\./, "");
        const ext = ALLOWED_AUDIO_EXTENSIONS.has(rawExt) ? rawExt : "mp3";
        const audioUrl = await saveAudioBuffer(inputBuffer, ext);
        return NextResponse.json({ url: audioUrl });
      }

      // Validação de dimensões de imagem contra pixel bombs
      try {
        const sharp = (await import("sharp")).default;
        const metadata = await sharp(inputBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        if (width > 8192 || height > 8192 || width * height > 40_000_000) {
          return NextResponse.json(
            { error: "Dimensões da imagem excedem o limite seguro permitido (máx 8192x8192px)." },
            { status: 400 }
          );
        }
      } catch (err: any) {
        if (err.message && err.message.includes("limite seguro")) throw err;
      }

      const imageUrl = await processImageBase64(cleanBase64);
      return NextResponse.json({ url: imageUrl });
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
      }

      const rawExt = (file.name ? file.name.split(".").pop() || "" : "").toLowerCase();
      const isAudio = file.type.startsWith("audio/") || ALLOWED_AUDIO_EXTENSIONS.has(rawExt);
      const isImage = file.type.startsWith("image/") && !file.type.includes("svg") && rawExt !== "svg";

      if (!isAudio && !isImage) {
        return NextResponse.json(
          { error: "Apenas imagens (JPEG, PNG, WEBP, AVIF, GIF) e áudios (MP3, WAV, OGG, M4A, AAC, WEBM) são permitidos. SVG não é aceito por motivos de segurança." },
          { status: 400 }
        );
      }

      const maxLimit = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxLimit) {
        return NextResponse.json(
          { error: `Tamanho excede o limite permitido (${isAudio ? "100MB para áudio" : "15MB para imagens"}).` },
          { status: 413 }
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      const detected = detectFileType(inputBuffer);
      if (!detected) {
        return NextResponse.json(
          { error: "Tipo de arquivo inválido ou não suportado (validação por magic bytes)." },
          { status: 400 }
        );
      }

      if (isAudio || detected.type === "audio") {
        const ext = ALLOWED_AUDIO_EXTENSIONS.has(rawExt) ? rawExt : detected.format;
        const audioUrl = await saveAudioBuffer(inputBuffer, ext);
        return NextResponse.json({ url: audioUrl });
      }

      // Validação de dimensões de imagem antes do Sharp
      try {
        const sharp = (await import("sharp")).default;
        const metadata = await sharp(inputBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        if (width > 8192 || height > 8192 || width * height > 40_000_000) {
          return NextResponse.json(
            { error: "Dimensões da imagem excedem o limite seguro permitido (máx 8192x8192px)." },
            { status: 400 }
          );
        }
      } catch (err: any) {
        if (err.message && err.message.includes("limite seguro")) throw err;
      }

      const imageUrl = await saveOptimizedImageBuffer(inputBuffer);
      return NextResponse.json({ url: imageUrl });
    }
  } catch (error: any) {
    console.error("Erro interno no upload de mídia:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar o arquivo." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  try {
    const imagesSet = new Set<string>();

    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      const files = await readdir(uploadDir);
      for (const file of files) {
        if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file)) {
          imagesSet.add(`/uploads/${file}`);
        }
      }
    } catch (e) {
      // Diretório ainda não criado
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const posts = await prisma.post.findMany({
        select: { img: true, blocks: true }
      });

      for (const p of posts) {
        if (p.img && typeof p.img === "string" && p.img.trim()) {
          imagesSet.add(p.img.trim());
        }
        if (p.blocks) {
          let bList: any[] = [];
          if (Array.isArray(p.blocks)) {
            bList = p.blocks;
          } else if (typeof p.blocks === "string") {
            try {
              bList = JSON.parse(p.blocks);
            } catch (err) {}
          }
          for (const b of bList) {
            if (b && typeof b.image === "string" && b.image.trim()) {
              imagesSet.add(b.image.trim());
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao buscar imagens de posts:", e);
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({ images: Array.from(imagesSet) });
  } catch (err: any) {
    console.error("Erro ao listar galeria:", err);
    return NextResponse.json({ images: [] });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  try {
    const { url, action } = await request.json();
    const uploadDir = path.join(process.cwd(), "uploads");

    if (action === "purge_unused") {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const usedImagesSet = new Set<string>();

      try {
        const posts = await prisma.post.findMany({ select: { img: true, blocks: true } });
        for (const p of posts) {
          if (p.img && typeof p.img === "string") {
            const fname = p.img.split("/uploads/").pop()?.split("?")[0];
            if (fname) usedImagesSet.add(fname);
          }
          if (p.blocks) {
            let bList: any[] = [];
            if (Array.isArray(p.blocks)) bList = p.blocks;
            else if (typeof p.blocks === "string") {
              try { bList = JSON.parse(p.blocks); } catch (e) {}
            }
            for (const b of bList) {
              if (b && typeof b.image === "string") {
                const fname = b.image.split("/uploads/").pop()?.split("?")[0];
                if (fname) usedImagesSet.add(fname);
              }
              if (b && typeof b.text === "string" && b.text.includes("/uploads/")) {
                const matches = b.text.match(/\/uploads\/[a-zA-Z0-9._-]+/g);
                if (matches) {
                  matches.forEach(m => {
                    const fname = m.split("/uploads/").pop();
                    if (fname) usedImagesSet.add(fname);
                  });
                }
              }
            }
          }
        }

        const pages = await prisma.page.findMany({ select: { content: true } });
        for (const pg of pages) {
          if (pg.content) {
            const contentStr = typeof pg.content === "string" ? pg.content : JSON.stringify(pg.content);
            const matches = contentStr.match(/\/uploads\/[a-zA-Z0-9._-]+/g);
            if (matches) {
              matches.forEach(m => {
                const fname = m.split("/uploads/").pop();
                if (fname) usedImagesSet.add(fname);
              });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar imagens em uso:", err);
      } finally {
        await prisma.$disconnect();
      }

      let deletedCount = 0;
      try {
        const files = await readdir(uploadDir);
        const { unlink } = await import("fs/promises");
        for (const file of files) {
          if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file) && !usedImagesSet.has(file)) {
            try {
              await unlink(path.join(uploadDir, file));
              deletedCount++;
            } catch (e) {}
          }
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        count: deletedCount,
        message: `${deletedCount} imagens não utilizadas foram deletadas do servidor.`
      });
    }

    if (action === "purge_all") {
      let deletedCount = 0;
      try {
        const files = await readdir(uploadDir);
        const { unlink } = await import("fs/promises");
        for (const file of files) {
          if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file)) {
            try {
              await unlink(path.join(uploadDir, file));
              deletedCount++;
            } catch (e) {}
          }
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        count: deletedCount,
        message: `Galeria zerada. ${deletedCount} imagens foram deletadas.`
      });
    }

    if (url && typeof url === "string") {
      if (url.startsWith("/uploads/")) {
        const filename = path.basename(url);
        const filePath = path.join(uploadDir, filename);
        try {
          const { unlink } = await import("fs/promises");
          await unlink(filePath);
        } catch (err: any) {
          console.warn("Arquivo não encontrado no disco ou já removido:", err.message);
        }
      }
      return NextResponse.json({ success: true, message: "Imagem excluída da galeria." });
    }

    return NextResponse.json({ error: "Parâmetros de requisição inválidos." }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao deletar imagem da galeria:", error);
    return NextResponse.json({ error: "Erro interno ao deletar imagem." }, { status: 500 });
  }
}
