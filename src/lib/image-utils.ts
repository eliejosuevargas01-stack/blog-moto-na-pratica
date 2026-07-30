import sharp from "sharp";
import path from "path";
import { createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function saveOptimizedImageBuffer(inputBuffer: Buffer): Promise<string> {
  const optimizedBuffer = await sharp(inputBuffer)
    .rotate() // Corrigir orientação EXIF automaticamente
    .resize({ width: 1400, withoutEnlargement: true }) // Redimensionar para max 1400px
    .webp({ quality: 82 })
    .toBuffer();

  const fileHash = createHash("md5").update(optimizedBuffer).digest("hex");
  const filename = `img-${fileHash}.webp`;
  const uploadDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });

  if (!existsSync(filePath)) {
    await writeFile(filePath, optimizedBuffer);
  }

  return `https://motonapratica.online/uploads/${filename}`;
}

export async function processImageBase64(base64Str: string): Promise<string> {
  if (!base64Str || typeof base64Str !== "string") {
    throw new Error("String Base64 inválida.");
  }

  // Remover cabeçalho data:image/png;base64, se existir
  const cleanBase64 = base64Str.replace(/^data:image\/[a-z0-9\+\-]+;base64,/i, "").trim();
  const inputBuffer = Buffer.from(cleanBase64, "base64");

  return await saveOptimizedImageBuffer(inputBuffer);
}

export async function saveAudioBuffer(inputBuffer: Buffer, extension: string = "mp3"): Promise<string> {
  const fileHash = createHash("md5").update(inputBuffer).digest("hex");
  const ext = extension.replace(/^\./, "") || "mp3";
  const filename = `audio-${fileHash}.${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });

  if (!existsSync(filePath)) {
    await writeFile(filePath, inputBuffer);
  }

  return `https://motonapratica.online/uploads/${filename}`;
}
