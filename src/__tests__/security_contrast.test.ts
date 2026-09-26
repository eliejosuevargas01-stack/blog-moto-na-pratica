import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { sanitizeSafeHtml, ALLOWED_SAFE_TAGS, ALLOWED_SAFE_ATTR } from '../app/components/SafeHtml';

// WCAG Contrast helper
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(...hexToRgb(hex1));
  const l2 = getLuminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Segurança XSS, SSR e Contraste Visual (REV-SEC-001, REV-LOG-001, REV-ARC-001, REV-ACC-002)', () => {
  const rootDir = process.cwd();
  const safeHtmlPath = path.resolve(rootDir, 'src/app/components/SafeHtml.tsx');
  const postPagePath = path.resolve(rootDir, 'src/app/post/[slug]/page.tsx');
  const homePagePath = path.resolve(rootDir, 'src/app/page.tsx');
  const postsPagePath = path.resolve(rootDir, 'src/app/posts/page.tsx');
  const tagPagePath = path.resolve(rootDir, 'src/app/tag/[tag]/page.tsx');
  const sobrePagePath = path.resolve(rootDir, 'src/app/sobre/page.tsx');
  const slugPagePath = path.resolve(rootDir, 'src/app/[slug]/page.tsx');
  const headerPath = path.resolve(rootDir, 'src/app/components/Header.tsx');
  const categoryViewPath = path.resolve(rootDir, 'src/app/components/CategoryView.tsx');
  const themeCssPath = path.resolve(rootDir, 'src/styles/theme.css');

  const safeHtmlContent = fs.readFileSync(safeHtmlPath, 'utf-8');
  const postPageContent = fs.readFileSync(postPagePath, 'utf-8');
  const homePageContent = fs.readFileSync(homePagePath, 'utf-8');
  const postsPageContent = fs.readFileSync(postsPagePath, 'utf-8');
  const tagPageContent = fs.readFileSync(tagPagePath, 'utf-8');
  const sobrePageContent = fs.readFileSync(sobrePagePath, 'utf-8');
  const slugPageContent = fs.readFileSync(slugPagePath, 'utf-8');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  const categoryViewContent = fs.readFileSync(categoryViewPath, 'utf-8');
  const themeCssContent = fs.readFileSync(themeCssPath, 'utf-8');

  describe('1. Sanitização XSS e SSR Seguro (SafeHtml e Post Page)', () => {
    it('SafeHtml deve usar isomorphic-dompurify sem stripHtml e sem FOUC', () => {
      expect(safeHtmlContent).toContain('isomorphic-dompurify');
      expect(safeHtmlContent).not.toContain('function stripHtml');
      expect(safeHtmlContent).not.toContain('useState<string>(() => stripHtml');
    });

    it('sanitizeSafeHtml deve neutralizar payloads maliciosos de XSS', () => {
      const payloadScript = '<script>alert("xss")</script><p>Texto Seguro</p>';
      const cleanScript = sanitizeSafeHtml(payloadScript);
      expect(cleanScript).not.toContain('<script>');
      expect(cleanScript).toContain('<p>Texto Seguro</p>');

      const payloadEvent = '<img src="invalid.jpg" onerror="alert(1)" alt="teste" />';
      const cleanEvent = sanitizeSafeHtml(payloadEvent);
      expect(cleanEvent).not.toContain('onerror');
      expect(cleanEvent).toContain('alt="teste"');

      const payloadIframe = '<iframe src="javascript:alert(1)"></iframe><span>Válido</span>';
      const cleanIframe = sanitizeSafeHtml(payloadIframe);
      expect(cleanIframe).not.toContain('<iframe');
      expect(cleanIframe).toContain('<span>Válido</span>');
    });

    it('sanitizeSafeHtml deve preservar tags e atributos de formatação seguros', () => {
      const html = '<h2 class="subtitulo" id="topico-1">Título</h2><p style="font-weight: bold;">Parágrafo com <a href="https://exemplo.com" target="_blank" rel="noopener">link</a> e <strong>destaque</strong>.</p>';
      const cleaned = sanitizeSafeHtml(html);
      expect(cleaned).toContain('<h2 class="subtitulo" id="topico-1">Título</h2>');
      expect(cleaned).toContain('href="https://exemplo.com"');
      expect(cleaned).toContain('<strong>destaque</strong>');
    });

    it('post/[slug]/page.tsx deve sanitizar o título e os blocos de texto com DOMPurify/SafeHtml', () => {
      // Título usando SafeHtml
      expect(postPageContent).toMatch(/<SafeHtml\s+tag="h1"[^>]*html=\{post\.title\}/);
      // Sanitização de blocos antes da renderização
      expect(postPageContent).toMatch(/DOMPurify\.sanitize\(cleanedText/);
    });

    it('tag/[tag]/page.tsx, sobre/page.tsx e [slug]/page.tsx devem usar SafeHtml sem dangerouslySetInnerHTML (REV-SEC-002)', () => {
      expect(tagPageContent).toContain('import SafeHtml from "../../components/SafeHtml";');
      expect(tagPageContent).toMatch(/<SafeHtml\s+tag="h2"[^>]*html=\{post\.title\}/);
      expect(tagPageContent).not.toMatch(/dangerouslySetInnerHTML=\{\{\s*__html:\s*post\.title\s*\}\}/);

      expect(sobrePageContent).toContain('import SafeHtml from "../components/SafeHtml";');
      expect(sobrePageContent).toMatch(/<SafeHtml\s+html=\{content\.bioContentHtml\}/);
      expect(sobrePageContent).toMatch(/<SafeHtml\s+tag="h3"[^>]*html=\{post\.title\}/);
      expect(sobrePageContent).not.toContain('dangerouslySetInnerHTML');

      expect(slugPageContent).toContain('import SafeHtml from "../components/SafeHtml";');
      expect(slugPageContent).toMatch(/<SafeHtml\s+html=\{bodyHtml\}\s+className="prose max-w-none text-foreground/);
      expect(slugPageContent).not.toContain('dangerouslySetInnerHTML');
    });
  });

  describe('2. Contraste em Overlays Escuros e Cabeçalhos de Páginas', () => {
    it('page.tsx Hero Editorial deve adotar contraste semântico WCAG AAA (text-foreground e text-muted-foreground)', () => {
      expect(homePageContent).toMatch(/SafeHtml\s+tag="h1"[^>]*className="[^"]*text-foreground/);
      expect(homePageContent).toMatch(/text-muted-foreground/);
    });

    it('post/[slug]/page.tsx Hero deve ter contraste legível sobre a imagem escura', () => {
      expect(postPageContent).toContain('text-white/80 hover:text-white');
      expect(postPageContent).toMatch(/text-white\/80[^\n]*<Clock/);
      expect(postPageContent).toMatch(/text-white\/80[^\n]*<Eye/);
    });

    it('posts/page.tsx e tag/[tag]/page.tsx devem usar bg-card border-b border-border', () => {
      expect(postsPageContent).toContain('<section className="bg-card border-b border-border py-14 px-6">');
      expect(postsPageContent).not.toContain('<section className="bg-[#0A0A0A]');

      expect(tagPageContent).toContain('<section className="bg-card border-b border-border py-14 px-6">');
      expect(tagPageContent).not.toContain('<section className="bg-[#0A0A0A]');
    });

    it('CategoryView.tsx deve usar bg-card border-b border-border no cabeçalho/breadcrumb', () => {
      expect(categoryViewContent).toContain('<div className="bg-card border-b border-border">');
      expect(categoryViewContent).not.toContain('bg-[#0D0D0D]');
    });
  });

  describe('3. Acessibilidade e Cores Semânticas (theme.css)', () => {
    it('legendas de imagens devem usar #4B5563 garantindo contraste WCAG AAA (> 7.4:1) sobre #FFFFFF', () => {
      expect(themeCssContent).toMatch(/figcaption[^\{]*\{[^}]*color:\s*#4B5563;/s);
      const ratio = calculateContrastRatio('#4B5563', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(7.4);
    });

    it('.prose, parágrafos e títulos devem usar color: var(--foreground) para compatibilidade semântica', () => {
      expect(themeCssContent).toMatch(/\.prose\s*\{[^}]*color:\s*var\(--foreground\);/s);
      expect(themeCssContent).toMatch(/\.prose p\s*\{[^}]*color:\s*var\(--foreground\);/s);
      expect(themeCssContent).toMatch(/\.prose h1,\s*\.prose h2,\s*\.prose h3,\s*\.prose h4\s*\{[^}]*color:\s*var\(--foreground\);/s);
    });

    it('legendas figcaption em modo escuro devem ter color: var(--muted-foreground) (REV-ACC-003)', () => {
      expect(themeCssContent).toMatch(/\.dark figcaption,\s*\.dark \.prose figcaption,\s*\.dark figure\.prose-image figcaption\s*\{\s*color:\s*var\(--muted-foreground\);/);
    });

    it('Header.tsx deve ter aria-label dinâmico no botão de busca (REV-ACC-004)', () => {
      expect(headerContent).toContain('aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}');
    });
  });

  describe('4. Auditoria Arquitetural, Âncoras e Acessibilidade por Teclado (REV-ARC-001, REV-LOG-002, REV-ARC-002, REV-ARC-003)', () => {
    const layoutPath = path.resolve(rootDir, 'src/app/layout.tsx');
    const politicaEditorialPath = path.resolve(rootDir, 'src/app/politica-editorial/page.tsx');
    const politicaPrivacidadePath = path.resolve(rootDir, 'src/app/politica-de-privacidade/page.tsx');

    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    const politicaEditorialContent = fs.readFileSync(politicaEditorialPath, 'utf-8');
    const politicaPrivacidadeContent = fs.readFileSync(politicaPrivacidadePath, 'utf-8');

    it('sobre/page.tsx não deve conter cores hardcoded com baixo contraste (REV-ARC-001)', () => {
      expect(sobrePageContent).not.toContain('text-[#6B7280]');
      expect(sobrePageContent).not.toContain('text-[#374151]');
      expect(sobrePageContent).toContain('text-muted-foreground');
    });

    it('politica-editorial/page.tsx deve conter âncoras e scroll-mt-24 para independência, metodologia, checagem, diversidade e correções (REV-LOG-002)', () => {
      const requiredAnchors = ['independencia', 'metodologia', 'checagem', 'diversidade', 'correcoes'];
      requiredAnchors.forEach((id) => {
        expect(politicaEditorialContent).toContain(`id="${id}"`);
      });
      // Verifica presença de scroll-mt-24 nas seções
      expect(politicaEditorialContent).toMatch(/id="independencia"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="independencia"/);
      expect(politicaEditorialContent).toMatch(/id="metodologia"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="metodologia"/);
      expect(politicaEditorialContent).toMatch(/id="checagem"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="checagem"/);
      expect(politicaEditorialContent).toMatch(/id="diversidade"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="diversidade"/);
      expect(politicaEditorialContent).toMatch(/id="correcoes"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="correcoes"/);
    });

    it('politica-de-privacidade/page.tsx deve conter âncora exclusao-dados com scroll-mt-24 (REV-LOG-002)', () => {
      expect(politicaPrivacidadeContent).toContain('id="exclusao-dados"');
      expect(politicaPrivacidadeContent).toMatch(/id="exclusao-dados"[^>]*scroll-mt-24|scroll-mt-24[^>]*id="exclusao-dados"/);
    });

    it('Header.tsx deve permitir navegação por teclado com group-focus-within:block no dropdown institucional (REV-ARC-002)', () => {
      expect(headerContent).toContain('group-focus-within:block');
      expect(headerContent).toContain('hidden group-hover:block group-focus-within:block z-50');
    });

    it('layout.tsx não deve conter consultas desnecessárias de posts nem código morto (REV-ARC-003)', () => {
      expect(layoutContent).not.toContain('prisma.post.findMany');
      expect(layoutContent).not.toContain('recentPosts');
      expect(layoutContent).not.toContain('const navLinks');
      expect(layoutContent).not.toContain('function stripHtml');
    });
  });
});
