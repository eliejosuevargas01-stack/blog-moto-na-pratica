import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas imagens (JPEG, PNG, WEBP, GIF) são permitidas." },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máx 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "O tamanho máximo permitido é 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar um nome de arquivo seguro e aleatório
    const originalExt = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    // Salvar o arquivo no diretório public/uploads
    await writeFile(filePath, buffer);

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
