import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function extractListOrContent(htmlSnippet: string): string {
  if (!htmlSnippet) return "";
  const listMatch = htmlSnippet.match(/<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>/i);
  if (listMatch) {
    return listMatch[0];
  }
  const pMatches = htmlSnippet.match(/<p[\s\S]*?<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    const items = pMatches
      .map(p => p.replace(/<\/?p[^>]*>/g, '').trim())
      .filter(t => t.length > 0 && !/pontos\s+(fortes|fracos)|prós|contras|strengths|weaknesses|vantagens|desvantagens|👍|👎|✅|❌/i.test(t))
      .map(t => `<li>${t.replace(/^[•\-\*\s]+/, '')}</li>`);
    if (items.length > 0) {
      return `<ul>${items.join('')}</ul>`;
    }
  }
  return "";
}

function normalizeProsConsHtml(html: string, lang: string = "pt"): string {
  if (!html) return "";

  if (html.includes('class="box-pros-cons"') || html.includes('class="pros-contras-box"')) {
    return html;
  }

  let cleanInput = html
    .replace(/^<ul[^>]*>\s*<li[^>]*>/i, '')
    .replace(/<\/li>\s*<\/ul>$/i, '');

  const hasProsKeyword = /(?:pontos\s+fortes|prós|pros|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)/i.test(cleanInput);
  const hasConsKeyword = /(?:pontos\s+fracos|contras|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)/i.test(cleanInput);

  if (!hasProsKeyword && !hasConsKeyword) {
    return cleanInput;
  }

  const prosTitle = lang === "en" ? "👍 Pros / Strengths" : lang === "es" ? "👍 Puntos Fuertes" : "👍 Pontos Fortes";
  const consTitle = lang === "en" ? "👎 Cons / Weaknesses" : lang === "es" ? "👎 Puntos Débiles" : "👎 Pontos Fracos";

  if (cleanInput.includes('box-pros') && cleanInput.includes('box-cons')) {
    cleanInput = cleanInput.replace(/<li[^>]*>\s*(<div\b[^>]*class=["'][^"']*box-pros-cons[\s\S]*?<\/div>)\s*<\/li>/gi, '$1');
    return cleanInput;
  }

  // 1. Caso de lista de <li> contendo explicitamente Prós e Contras com marcadores nos <li>
  const allLiMatches = Array.from(cleanInput.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi));
  if (allLiMatches.length > 0) {
    const prosLis: string[] = [];
    const consLis: string[] = [];
    let currentMode: 'pros' | 'cons' = 'pros';
    let foundExplicitLabels = false;

    for (const match of allLiMatches) {
      const fullLi = match[0];
      const liInner = match[1];
      const cleanText = liInner.replace(/<[^>]*>/g, '').trim();

      const isConsLi = /^(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*<\/strong>/i.test(liInner);
      
      const isProsLi = /^(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?/i.test(cleanText) ||
                       /<strong>\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*<\/strong>/i.test(liInner);

      if (isConsLi) {
        foundExplicitLabels = true;
        currentMode = 'cons';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:contras?|pontos\s+fracos|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*(?:<\/strong>)?\s*/i, '');
        consLis.push(`<li>${cleanedLi}</li>`);
      } else if (isProsLi) {
        foundExplicitLabels = true;
        currentMode = 'pros';
        const cleanedLi = liInner
          .replace(/^(?:<strong>)?\s*(?:prós|pros|pontos\s+fortes|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*(?:<\/strong>)?\s*/i, '');
        prosLis.push(`<li>${cleanedLi}</li>`);
      } else {
        if (currentMode === 'cons') {
          consLis.push(fullLi);
        } else {
          prosLis.push(fullLi);
        }
      }
    }

    if (foundExplicitLabels && prosLis.length > 0 && consLis.length > 0) {
      const prosBox = `<div class="box-pros"><h4>${prosTitle}</h4><ul>${prosLis.join('')}</ul></div>`;
      const consBox = `<div class="box-cons"><h4>${consTitle}</h4><ul>${consLis.join('')}</ul></div>`;
      const prefixMatch = cleanInput.split(/<(h[1-6]|p|ul|ol)\b/i);
      const prefix = prefixMatch && prefixMatch[0] ? prefixMatch[0] : "";
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  // 2. Seções com Títulos H2-H4 dedicados exclusivamente a "Prós" e "Contras"
  const prosHeaderRegex = /<(h[2-4])\b[^>]*>\s*(?:pontos\s+fortes|prós|pros|vantagens|strengths|puntos\s+fuertes|ventajas|👍|✅)\s*:?\s*<\/\1>/gi;
  const consHeaderRegex = /<(h[2-4])\b[^>]*>\s*(?:pontos\s+fracos|contras|desvantagens|cons|weaknesses|puntos\s+débiles|desventajas|👎|❌)\s*:?\s*<\/\1>/gi;

  const prosMatch = prosHeaderRegex.exec(cleanInput);
  const consMatch = consHeaderRegex.exec(cleanInput);

  if (prosMatch && consMatch) {
    const prosStart = prosMatch.index;
    const consStart = consMatch.index;

    let prefix = "";
    let prosSection = "";
    let consSection = "";

    if (prosStart < consStart) {
      prefix = cleanInput.substring(0, prosStart);
      prosSection = cleanInput.substring(prosStart + prosMatch[0].length, consStart);
      consSection = cleanInput.substring(consStart + consMatch[0].length);
    } else {
      prefix = cleanInput.substring(0, consStart);
      consSection = cleanInput.substring(consStart + consMatch[0].length, prosStart);
      prosSection = cleanInput.substring(prosStart + prosMatch[0].length);
    }

    const prosList = extractListOrContent(prosSection);
    const consList = extractListOrContent(consSection);

    if (prosList && consList) {
      const prosBox = `<div class="box-pros"><h4>${prosTitle}</h4>${prosList}</div>`;
      const consBox = `<div class="box-cons"><h4>${consTitle}</h4>${consList}</div>`;
      return `${prefix}<div class="box-pros-cons">${prosBox}${consBox}</div>`;
    }
  }

  return cleanInput;
}

function cleanBlockHtml(html: string, lang: string = "pt"): string {
  if (!html) return "";
  let cleaned = html
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .replace(/>\s*\r?\n\s*</g, "><")
    .replace(/<p>\s*(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+\s*<\/p>/gi, "")
    .replace(/(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+/gi, "")
    .replace(/\{[^}]*\}=\d+\{[^}]*\}/gi, "")
    .replace(/href=(["'])\/?pt\/posts?\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?posts\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?en\/posts\//gi, 'href=$1/en/post/')
    .replace(/href=(["'])\/?es\/posts\//gi, 'href=$1/es/post/')
    .trim();

  // 1. Padronizar Tabelas no wrapper .table-wrapper e classe .tabela-comparativa
  if (cleaned.includes("<table") && !cleaned.includes('class="table-wrapper"')) {
    cleaned = cleaned.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, body) => {
      let cleanAttrs = attrs.replace(/class=["'][^"']*["']/gi, "");
      return `<div class="table-wrapper"><table class="tabela-comparativa"${cleanAttrs}>${body}</table></div>`;
    });
  }

  // 2. Padronizar Avisos / Callouts / Blockquotes com .box-aviso se for parágrafo isolado de aviso
  if (cleaned.includes("<p><strong>Aviso") || cleaned.includes("<p><strong>Atenção") || cleaned.includes("<p><strong>Warning") || cleaned.includes("<p><strong>Atención")) {
    cleaned = cleaned.replace(/<p>\s*(<strong>(?:Aviso|Atenção|Warning|Atención)[^<]*<\/strong>[\s\S]*?)<\/p>/gi, '<div class="box-aviso"><p>$1</p></div>');
  }

  return normalizeProsConsHtml(cleaned, lang);
}

async function main() {
  console.log("Iniciando padronização de todos os posts no banco de dados...");

  const posts = await prisma.post.findMany();
  console.log(`Encontrados ${posts.length} posts para processamento.`);

  let updatedCount = 0;

  for (const post of posts) {
    const lang = post.lang || "pt";
    let blocks: any[] = [];

    if (Array.isArray(post.blocks)) {
      blocks = post.blocks;
    } else if (typeof post.blocks === "string") {
      try {
        blocks = JSON.parse(post.blocks);
      } catch (e) {
        blocks = [];
      }
    }

    if (blocks.length === 0) continue;

    let isModified = false;
    const updatedBlocks = blocks.map((block: any) => {
      if (block && typeof block.text === "string") {
        const cleanedText = cleanBlockHtml(block.text, lang);
        if (cleanedText !== block.text) {
          isModified = true;
        }
        return {
          ...block,
          text: cleanedText
        };
      }
      return block;
    });

    if (isModified) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          blocks: updatedBlocks
        }
      });
      updatedCount++;
      console.log(`✓ Post padronizado [${lang.toUpperCase()}]: "${post.title}" (${post.slug})`);
    }
  }

  console.log(`\nConcluído com sucesso! Total de posts atualizados e padronizados: ${updatedCount} de ${posts.length}`);
}

main()
  .catch((e) => {
    console.error("Erro durante padronização:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
