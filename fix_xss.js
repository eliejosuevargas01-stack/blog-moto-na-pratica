import fs from 'fs';

function replaceXSS(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('SafeHtml')) {
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport SafeHtml from "./components/SafeHtml";');
    content = content.replace('import Link from \'next/link\';', 'import Link from \'next/link\';\nimport SafeHtml from "../components/SafeHtml";');
    content = content.replace('import { ChevronRight }', 'import SafeHtml from "../components/SafeHtml";\nimport { ChevronRight }');
  }

  // <h1 ... dangerouslySetInnerHTML={{ __html: heroTitle }} />
  content = content.replace(/<([a-z0-9]+)\s+([^>]*?)dangerouslySetInnerHTML=\{\{\s*__html:\s*(.*?)\s*\}\}\s*\/>/g, 
    '<SafeHtml tag="$1" $2 html={$3} />');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed XSS in', filePath);
}

replaceXSS('src/app/page.tsx');
replaceXSS('src/app/posts/page.tsx');
replaceXSS('src/app/components/CategoryView.tsx');

// Fix paths for SafeHtml
let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
pageContent = pageContent.replace('import SafeHtml from "../components/SafeHtml";', 'import SafeHtml from "./components/SafeHtml";');
fs.writeFileSync('src/app/page.tsx', pageContent);

