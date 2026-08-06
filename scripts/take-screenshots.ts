import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "public", "screenshots");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const posts = [
  "honda-0km-em-48x-vale-a-pena-ou-e-armadilha",
  "yamaha-mt-03-2026-avaliacao-consumo-preco"
];

const viewports = [
  { name: "mobile", width: 375, height: 3200 },
  { name: "tablet", width: 768, height: 3200 },
  { name: "desktop", width: 1280, height: 3200 }
];

async function capture() {
  console.log("Iniciando captura de corpo completo dos posts...");

  for (const slug of posts) {
    const url = `http://localhost:3000/post/${slug}`;
    for (const vp of viewports) {
      const outputPath = path.join(targetDir, `${slug}-${vp.name}.png`);
      const cmd = `google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --screenshot="${outputPath}" --window-size=${vp.width},${vp.height} "${url}"`;
      console.log(`Capturando ${slug} [${vp.name} ${vp.width}x${vp.height}]...`);
      try {
        execSync(cmd, { stdio: "inherit", timeout: 40000 });
      } catch (err) {
        console.error(`Erro ao capturar ${slug} no ${vp.name}:`, err);
      }
    }
  }

  console.log("Captura concluída! Screenshots salvos em:", targetDir);
}

capture();
