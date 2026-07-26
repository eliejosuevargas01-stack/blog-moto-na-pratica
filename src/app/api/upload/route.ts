import { NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas imagens (JPEG, PNG, WEBP, AVIF, GIF) são permitidas." },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máx 10MB antes de compressão)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "O tamanho máximo permitido é 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Processar imagem com sharp: redimensionar para max 1400px de largura e converter para WebP
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate() // Corrigir orientação EXIF automaticamente
      .resize({ width: 1400, withoutEnlargement: true }) // Nunca aumenta o tamanho original
      .webp({ quality: 82 })
      .toBuffer();

    // Gerar nome de arquivo seguro com extensão .webp
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}.webp`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, filename);

    // Garantir que o diretório existe (cria recursivamente se necessário)
    await mkdir(uploadDir, { recursive: true });

    // Salvar o buffer otimizado em disco
    await writeFile(filePath, optimizedBuffer);

    // Retorna a URL pública relativa
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("Erro durante o upload do arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar arquivo no servidor." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const imagesSet = new Set<string>();

    // Varrer estritamente os arquivos salvos no volume /uploads do servidor
    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      const files = await readdir(uploadDir);
      // Ordenar por data de modificação ou nome (mais recentes primeiro)
      const validFiles = files.filter(file => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file));
      validFiles.forEach(file => imagesSet.add(`/uploads/${file}`));
    } catch (e) {
      // Diretório ainda não existe
    }

    return NextResponse.json({ images: Array.from(imagesSet) });
  } catch (err: any) {
    console.error("Erro ao listar galeria:", err);
    return NextResponse.json({ images: [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    // Se for uma imagem salva na pasta local /uploads/
    if (url.startsWith("/uploads/")) {
      const filename = path.basename(url);
      const filePath = path.join(process.cwd(), "uploads", filename);
      try {
        const { unlink } = await import("fs/promises");
        await unlink(filePath);
      } catch (err: any) {
        console.warn("Arquivo não encontrado no disco ou já removido:", err.message);
      }
    }

    return NextResponse.json({ success: true, message: "Imagem excluída da galeria." });
  } catch (error: any) {
    console.error("Erro ao deletar imagem da galeria:", error);
    return NextResponse.json({ error: "Erro interno ao deletar imagem." }, { status: 500 });
  }
}
