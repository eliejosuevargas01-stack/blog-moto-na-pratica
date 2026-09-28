const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const oldGetConsumptionLabel = `function getConsumptionLabel(post: any): string {
  const content = \`\${post?.content || ""} \${post?.excerpt || ""}\`;
  const match = content.match(/(\\d{1,2}(?:[.,]\\d)?\\s*km\\/l)/i);
  if (match) return \`Consumo aferido: \${match[1]}\`;
  if (post?.slug?.includes("fazer") || post?.slug?.includes("fz25")) return "Consumo aferido: 31,5 km/l";
  if (post?.slug?.includes("160") || post?.slug?.includes("titan")) return "Consumo aferido: 42,3 km/l";
  return "Consumo aferido: 31,5 km/l";
}`;

const newGetConsumptionLabel = `function getConsumptionLabel(post: any): string | null {
  const content = \`\${post?.content || ""} \${post?.excerpt || ""}\`;
  const match = content.match(/(\\d{1,2}(?:[.,]\\d)?\\s*km\\/l)/i);
  if (match) return \`\${match[1]}\`;
  return null;
}`;

pageContent = pageContent.replace(oldGetConsumptionLabel, newGetConsumptionLabel);

// Remove "TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA" string
const testBadge = `                    <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-black/80 text-white border border-white/20 rounded-xs backdrop-blur-xs">
                      TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA
                    </span>`;
pageContent = pageContent.replace(testBadge, "");

const testBadge2 = `                    <span className="absolute bottom-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-white rounded-xs shadow-md">
                      {consumption}
                    </span>`;
const newTestBadge2 = `{consumption && (
                    <span className="absolute bottom-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-white rounded-xs shadow-md">
                      {consumption}
                    </span>
                    )}`;
pageContent = pageContent.replace(testBadge2, newTestBadge2);

fs.writeFileSync(pagePath, pageContent);

const testPath = path.resolve('src/__tests__/portal_home.test.ts');
let testContent = fs.readFileSync(testPath, 'utf8');

testContent = testContent.replace(oldGetConsumptionLabel, newGetConsumptionLabel);
testContent = testContent.replace(
  `expect(getConsumptionLabel(postWithConsumption)).toBe("Consumo aferido: 34,5 km/l");`,
  `expect(getConsumptionLabel(postWithConsumption)).toBe("34,5 km/l");`
);
testContent = testContent.replace(
  `expect(getConsumptionLabel(postFazer)).toBe("Consumo aferido: 31,5 km/l");`,
  `expect(getConsumptionLabel(postFazer)).toBeNull();`
);
testContent = testContent.replace(
  `expect(getConsumptionLabel(postTitan)).toBe("Consumo aferido: 42,3 km/l");`,
  `expect(getConsumptionLabel(postTitan)).toBeNull();`
);
testContent = testContent.replace(
  `expect(getConsumptionLabel(postGeneric)).toBe("Consumo aferido: 31,5 km/l");`,
  `expect(getConsumptionLabel(postGeneric)).toBeNull();`
);

testContent = testContent.replace(`expect(pageContent).toContain("TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA");`, `// expect(pageContent).toContain("TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA");`);

fs.writeFileSync(testPath, testContent);

console.log("updated");
