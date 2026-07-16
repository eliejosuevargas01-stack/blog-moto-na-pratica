import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const cwd = process.cwd();
    
    let exists = false;
    let files: { name: string; size: number; writable: boolean }[] = [];
    
    if (fs.existsSync(uploadDir)) {
      exists = true;
      const fileNames = fs.readdirSync(uploadDir);
      files = fileNames.map(name => {
        const filePath = path.join(uploadDir, name);
        const stats = fs.statSync(filePath);
        let writable = false;
        try {
          fs.accessSync(filePath, fs.constants.W_OK);
          writable = true;
        } catch(e) {}
        
        return {
          name,
          size: stats.size,
          writable
        };
      });
    }

    return NextResponse.json({
      cwd,
      uploadDir,
      uploadDirExists: exists,
      files
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
