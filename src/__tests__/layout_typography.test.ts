import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock do prisma para post-helpers
vi.mock('../lib/db', () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn()
    },
    page: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from '../lib/db';
import { slugify, optimizeImageUrl, formatPostUrl, toNumericGroupId, TEKO, BODY, TAG_COLORS, POSTS } from '../app/data';
import { findPostBySlugOrId, generatePostMetadata } from '../lib/post-helpers';

// WCAG 2.1 Contrast Calculation Utilities
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
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
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design System: Layout, Tipografia e Acessibilidade (Vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const themeCssPath = path.resolve(process.cwd(), 'src/styles/theme.css');
  const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
  const postPagePath = path.resolve(process.cwd(), 'src/app/post/[slug]/page.tsx');
  const headerPath = path.resolve(process.cwd(), 'src/app/components/Header.tsx');

  const themeCssContent = fs.readFileSync(themeCssPath, 'utf-8');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const postPageContent = fs.readFileSync(postPagePath, 'utf-8');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');

  describe('1. Variáveis do Tema Claro de Alto Contraste (:root em theme.css)', () => {
    it('deve definir variáveis de fundo e texto de alto contraste', () => {
      expect(themeCssContent).toMatch(/--background:\s*#F8F9FA/i);
      expect(themeCssContent).toMatch(/--foreground:\s*#111827/i);
      expect(themeCssContent).toMatch(/--card:\s*#FFFFFF/i);
      expect(themeCssContent).toMatch(/--card-foreground:\s*#111827/i);
      expect(themeCssContent).toMatch(/--border:\s*#E5E7EB/i);
    });

    it('deve definir cores de destaque e semântica com excelente legibilidade', () => {
      expect(themeCssContent).toMatch(/--primary:\s*#C8102E/i);
      expect(themeCssContent).toMatch(/--primary-foreground:\s*#FFFFFF/i);
      expect(themeCssContent).toMatch(/--muted:\s*#F3F4F6/i);
      expect(themeCssContent).toMatch(/--muted-foreground:\s*#4B5563/i);
      expect(themeCssContent).toMatch(/--accent:\s*#2563EB/i);
      expect(themeCssContent).toMatch(/--destructive:\s*#DC2626/i);
      expect(themeCssContent).toMatch(/--success:\s*#16A34A/i);
    });

    it('deve cumprir o padrão WCAG AAA (> 7:1) para texto principal no tema claro', () => {
      const bg = '#F8F9FA';
      const fg = '#111827';
      const ratio = calculateContrastRatio(bg, fg);
      // Deve ter contraste ultra-alto para leitura confortável e sem fadiga visual
      expect(ratio).toBeGreaterThanOrEqual(7.0);
      expect(ratio).toBeGreaterThan(15.0);
    });

    it('deve cumprir o padrão WCAG AA (> 4.5:1) para texto secundário/mutado', () => {
      const bg = '#F8F9FA';
      const mutedFg = '#4B5563';
      const ratio = calculateContrastRatio(bg, mutedFg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('deve garantir contraste para botões primários e alertas de texto sobre branco', () => {
      const primaryRatio = calculateContrastRatio('#C8102E', '#FFFFFF');
      expect(primaryRatio).toBeGreaterThanOrEqual(4.5);

      const successRatio = calculateContrastRatio('#16A34A', '#FFFFFF');
      expect(successRatio).toBeGreaterThanOrEqual(3.0);

      const destructiveRatio = calculateContrastRatio('#DC2626', '#FFFFFF');
      expect(destructiveRatio).toBeGreaterThanOrEqual(4.0);
    });

    it('deve mapear propriedades inline no @theme para Tailwind CSS v4', () => {
      expect(themeCssContent).toContain('--color-background: var(--background);');
      expect(themeCssContent).toContain('--color-foreground: var(--foreground);');
      expect(themeCssContent).toContain('--color-card: var(--card);');
      expect(themeCssContent).toContain('--color-border: var(--border);');
      expect(themeCssContent).toContain('--color-primary: var(--primary);');
    });
  });

  describe('2. Tipografia e Limites de Leitura (.prose)', () => {
    it('deve delimitar o comprimento máximo de linha entre 65ch e 72ch para legibilidade ótima', () => {
      const proseMaxWidthMatch = themeCssContent.match(/\.prose\s*\{[^}]*max-width:\s*(\d+)ch;/s);
      expect(proseMaxWidthMatch).not.toBeNull();
      if (proseMaxWidthMatch) {
        const maxWidthCh = parseInt(proseMaxWidthMatch[1], 10);
        expect(maxWidthCh).toBeGreaterThanOrEqual(65);
        expect(maxWidthCh).toBeLessThanOrEqual(72);
      }
    });

    it('deve definir line-height ergonômico de 1.7 no corpo dos artigos (.prose e .prose p)', () => {
      expect(themeCssContent).toMatch(/\.prose\s*\{[^}]*line-height:\s*1\.7/s);
      expect(themeCssContent).toMatch(/\.prose p\s*\{[^}]*line-height:\s*1\.7/s);
    });

    it('deve incluir word-break: break-word para prevenir quebra de layout em mobile', () => {
      expect(themeCssContent).toMatch(/\.prose\s*\{[^}]*word-break:\s*break-word;/s);
    });

    it('deve configurar tamanhos de fonte responsivos (16px mobile, 17.5px desktop)', () => {
      expect(themeCssContent).toMatch(/\.prose\s*\{[^}]*font-size:\s*16px;/s);
      expect(themeCssContent).toMatch(/@media\s*\(min-width:\s*768px\)\s*\{[^}]*\.prose\s*\{[^}]*font-size:\s*17\.5px;/s);
    });

    it('deve estilizar títulos h1-h4 com Teko, caixa alta e espaçamento adequado', () => {
      expect(themeCssContent).toMatch(/\.prose h1,\s*\.prose h2,\s*\.prose h3,\s*\.prose h4\s*\{[^}]*font-family:\s*var\(--font-teko\)/s);
      expect(themeCssContent).toMatch(/\.prose h1,\s*\.prose h2,\s*\.prose h3,\s*\.prose h4\s*\{[^}]*text-transform:\s*uppercase/s);
      expect(themeCssContent).toMatch(/\.prose h1\s*\{[^}]*border-left:\s*4px solid var\(--primary/s);
      expect(themeCssContent).toMatch(/\.prose h2\s*\{[^}]*border-top:\s*1px solid var\(--border/s);
    });

    it('deve configurar links acessíveis com sublinhado e offset para fácil identificação', () => {
      expect(themeCssContent).toMatch(/\.prose a\s*\{[^}]*text-decoration:\s*underline;/s);
      expect(themeCssContent).toMatch(/\.prose a\s*\{[^}]*text-underline-offset:\s*3px;/s);
    });

    it('deve estilizar listas com marcadores estilizados e checklist SVG com ícone de verificação', () => {
      expect(themeCssContent).toMatch(/\.prose ul:not\(\.checklist\)\s*li::marker\s*\{[^}]*color:\s*var\(--primary/s);
      expect(themeCssContent).toMatch(/\.checklist li::before,\s*\.prose ul\.checklist li::before\s*\{[^}]*background-image:\s*url\("data:image\/svg\+xml/s);
    });
  });

  describe('3. Tabelas Responsivas e Callouts Especiais', () => {
    it('deve definir .table-wrapper com overflow-x: auto e rolagem suave no toque', () => {
      expect(themeCssContent).toMatch(/\.table-wrapper\s*\{[^}]*overflow-x:\s*auto;/s);
      expect(themeCssContent).toMatch(/\.table-wrapper\s*\{[^}]*-webkit-overflow-scrolling:\s*touch;/s);
      expect(themeCssContent).toMatch(/\.table-wrapper\s*\{[^}]*border:\s*1px solid var\(--border/s);
      expect(themeCssContent).toMatch(/\.table-wrapper\s*\{[^}]*border-radius:\s*8px;/s);
    });

    it('deve garantir largura mínima nas tabelas comparativas para evitar colapso de colunas', () => {
      expect(themeCssContent).toMatch(/\.prose table,\s*\.tabela-comparativa\s*\{[^}]*min-width:\s*540px;/s);
      expect(themeCssContent).toMatch(/\.prose table,\s*\.tabela-comparativa\s*\{[^}]*border-collapse:\s*collapse;/s);
    });

    it('deve implementar cabeçalhos e zebragem com contraste nítido nas tabelas', () => {
      expect(themeCssContent).toMatch(/\.prose table th,\s*\.tabela-comparativa th\s*\{[^}]*background:\s*#F3F4F6;/s);
      expect(themeCssContent).toMatch(/\.prose table tr:nth-child\(even\),\s*\.tabela-comparativa tr:nth-child\(even\)\s*\{[^}]*background:\s*#F9FAFB;/s);
    });

    it('deve fornecer estilos para callout de alerta mecânico (.box-alerta-mecanico)', () => {
      expect(themeCssContent).toMatch(/\.box-alerta-mecanico,\s*\.callout-alerta\s*\{[^}]*border-left:\s*4px solid var\(--destructive/s);
      expect(themeCssContent).toMatch(/\.box-alerta-mecanico,\s*\.callout-alerta\s*\{[^}]*background-color:\s*#FEF2F2/s);
      expect(themeCssContent).toMatch(/\.box-alerta-mecanico h4,\s*\.callout-alerta h4\s*\{[^}]*color:\s*#991B1B/s);
    });

    it('deve fornecer estilos para callout de veredito e dicas (.box-veredito, .box-dica)', () => {
      expect(themeCssContent).toMatch(/\.box-veredito,\s*\.box-dica\s*\{[^}]*border-left:\s*4px solid var\(--success/s);
      expect(themeCssContent).toMatch(/\.box-veredito,\s*\.box-dica\s*\{[^}]*background-color:\s*#F0FDF4/s);
      expect(themeCssContent).toMatch(/\.box-veredito h4,\s*\.box-dica h4\s*\{[^}]*color:\s*#166534/s);
    });

    it('deve fornecer estilos para blocos comparativos de Prós e Contras (.box-pros-cons)', () => {
      expect(themeCssContent).toMatch(/\.box-pros-cons,\s*\.pros-contras-box\s*\{[^}]*display:\s*grid/s);
      expect(themeCssContent).toMatch(/@media\s*\(min-width:\s*640px\)\s*\{[^}]*\.box-pros-cons,\s*\.pros-contras-box\s*\{[^}]*grid-template-columns:\s*1fr 1fr/s);
      expect(themeCssContent).toMatch(/\.box-pros,\s*\.pros\s*\{[^}]*border-left:\s*4px solid var\(--success/s);
      expect(themeCssContent).toMatch(/\.box-cons,\s*\.cons\s*\{[^}]*border-left:\s*4px solid var\(--destructive/s);
    });

    it('deve fornecer ficha técnica completa padronizada (.ficha-tecnica)', () => {
      expect(themeCssContent).toContain('.ficha-tecnica');
      expect(themeCssContent).toContain('.ficha-header');
      expect(themeCssContent).toContain('.ficha-title');
      expect(themeCssContent).toContain('.ficha-grid');
      expect(themeCssContent).toContain('.spec-asfalto');
    });
  });

  describe('4. Integração Arquitetural nos Componentes e Páginas', () => {
    describe('src/app/layout.tsx', () => {
      it('deve carregar e injetar as fontes Teko e Barlow como variáveis CSS', () => {
        expect(layoutContent).toContain('variable: "--font-teko"');
        expect(layoutContent).toContain('variable: "--font-barlow"');
        expect(layoutContent).toContain('tekoFont.variable');
        expect(layoutContent).toContain('barlowFont.variable');
      });

      it('deve aplicar tema base de alto contraste no body', () => {
        expect(layoutContent).toMatch(/className="[^"]*bg-background[^"]*text-foreground/);
      });

      it('deve estruturar container principal limitado a 1200px', () => {
        expect(layoutContent).toContain('max-w-[1200px]');
      });

      it('deve utilizar classes de cartões e bordas de alto contraste no rodapé', () => {
        expect(layoutContent).toMatch(/footer[^>]*className="[^"]*bg-card border-t border-border/);
      });
    });

    describe('src/app/post/[slug]/page.tsx', () => {
      it('deve conter coluna de leitura delimitada por max-w-[70ch] (65ch - 72ch)', () => {
        expect(postPageContent).toContain('max-w-[70ch]');
      });

      it('deve aplicar classes .prose e line-height relaxado no container do conteúdo', () => {
        expect(postPageContent).toMatch(/className="[^"]*prose[^"]*leading-relaxed/);
      });

      it('deve empacotar tags <table> automaticamente com <div class="table-wrapper">', () => {
        const tableWrapperRegex = /cleaned\.includes\(["']<table["']\)\s*&&\s*!cleaned\.includes\(["']class=["']table-wrapper["']["']\)/;
        expect(postPageContent).toMatch(tableWrapperRegex);
        expect(postPageContent).toContain('<div class="table-wrapper"><table$1>$2</table></div>');
      });

      it('deve simular corretamente a função de auto-empacotamento de tabelas', () => {
        const wrapTableHtml = (html: string) => {
          let cleaned = html;
          if (cleaned.includes('<table') && !cleaned.includes('class="table-wrapper"')) {
            cleaned = cleaned.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, '<div class="table-wrapper"><table$1>$2</table></div>');
          }
          return cleaned;
        };

        const rawHtml = '<h3>Ficha</h3><table class="tabela-comparativa"><tbody><tr><td>Dado</td></tr></tbody></table>';
        const result = wrapTableHtml(rawHtml);
        expect(result).toBe('<h3>Ficha</h3><div class="table-wrapper"><table class="tabela-comparativa"><tbody><tr><td>Dado</td></tr></tbody></table></div>');

        const alreadyWrapped = '<div class="table-wrapper"><table><tr><td>Dado</td></tr></table></div>';
        expect(wrapTableHtml(alreadyWrapped)).toBe(alreadyWrapped);
      });

      it('deve manter contraste alto no parágrafo de resumo/excerpt do artigo', () => {
        expect(postPageContent).toMatch(/text-\[#374151\]/);
        expect(postPageContent).toMatch(/border-l-4 border-primary/);
      });
    });

    describe('src/app/components/Header.tsx', () => {
      it('deve possuir barra superior com fundo neutro claro e borda nítida', () => {
        expect(headerContent).toMatch(/bg-\[#F3F4F6\]/);
        expect(headerContent).toMatch(/border-b border-\[#E5E7EB\]/);
      });

      it('deve ter navbar fixa com fundo branco semitransparente com desfoque e borda contrastante', () => {
        expect(headerContent).toMatch(/header[^>]*className="[^"]*bg-white\/95[^"]*border-b border-\[#E5E7EB\]/);
      });

      it('deve usar cores de alto contraste nos links de navegação ativo/inativo', () => {
        expect(headerContent).toContain('text-primary font-semibold');
        expect(headerContent).toContain('text-[#4B5563] hover:text-[#111827]');
      });

      it('deve possuir overlay de busca com borda e contraste legível', () => {
        expect(headerContent).toMatch(/text-\[#111827\]/);
        expect(headerContent).toMatch(/placeholder:text-\[#9CA3AF\]/);
      });
    });
  });

  describe('5. Funções Auxiliares de Tipografia e Dados (data.ts & post-helpers.ts)', () => {
    it('deve definir estilos de fontes TEKO e BODY consistentes com o tema', () => {
      expect(TEKO.fontFamily).toContain('var(--font-teko)');
      expect(BODY.fontFamily).toContain('var(--font-barlow)');
    });

    it('slugify deve normalizar títulos mantendo acentos em português sem quebrar layout', () => {
      expect(slugify('Fazer 250: Teste & Impressões!')).toBe('fazer-250-teste-impressões');
      expect(slugify('Troca de Óleo na Moto')).toBe('troca-de-óleo-na-moto');
      expect(slugify('<h2>Título com Tags</h2>')).toBe('título-com-tags');
    });

    it('optimizeImageUrl deve otimizar parâmetros de query para imagens locais e Unsplash', () => {
      const unsplashUrl = 'https://images.unsplash.com/photo-1571646036117?w=1200';
      const optimizedUnsplash = optimizeImageUrl(unsplashUrl, 800);
      expect(optimizedUnsplash).toContain('w=800');

      const localUpload = '/uploads/minha-foto.webp';
      const optimizedLocal = optimizeImageUrl(localUpload, 600);
      expect(optimizedLocal).toBe('/uploads/minha-foto.webp?w=600');

      expect(optimizeImageUrl('', 500)).toBe('');
    });

    it('formatPostUrl deve montar rotas localizadas com prefixo de idioma correto', () => {
      expect(formatPostUrl('fazer-250', 'pt')).toBe('/post/fazer-250');
      expect(formatPostUrl('fazer-250', 'en')).toBe('/en/post/fazer-250');
      expect(formatPostUrl('fazer-250', 'es')).toBe('/es/post/fazer-250');
      expect(formatPostUrl('', 'pt')).toBe('/');
    });

    it('toNumericGroupId deve converter identificadores numéricos ou criar hash numérico', () => {
      expect(toNumericGroupId(456)).toBe(456);
      expect(toNumericGroupId('789')).toBe(789);
      expect(typeof toNumericGroupId('guid-random-string')).toBe('number');
    });

    it('findPostBySlugOrId deve recuperar post do banco de dados quando encontrado', async () => {
      const mockPost = {
        id: '123',
        slug: 'moto-teste',
        title: 'Moto Teste',
        tag: 'Review',
        lang: 'pt',
        translationGroupId: null
      };
      (prisma.post.findUnique as any).mockResolvedValueOnce(mockPost);

      const post = await findPostBySlugOrId('moto-teste');
      expect(post).toEqual(mockPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { slug: 'moto-teste' } });
    });

    it('findPostBySlugOrId deve buscar irmão no idioma solicitado se o post retornado estiver em outro idioma', async () => {
      const postEn = {
        id: '123',
        slug: 'moto-teste-en',
        lang: 'en',
        translationGroupId: 999
      };
      const siblingPt = {
        id: '124',
        slug: 'moto-teste-pt',
        lang: 'pt',
        translationGroupId: 999
      };
      (prisma.post.findUnique as any).mockResolvedValueOnce(postEn);
      (prisma.post.findFirst as any).mockResolvedValueOnce(siblingPt);

      const post = await findPostBySlugOrId('moto-teste-en', 'pt');
      expect(post).toEqual(siblingPt);
      expect(prisma.post.findFirst).toHaveBeenCalledWith({
        where: {
          translationGroupId: 999,
          OR: [{ lang: 'pt' }, { lang: null }]
        }
      });
    });

    it('findPostBySlugOrId deve buscar por ID ou translationGroupId numérico quando slug não for encontrada', async () => {
      (prisma.post.findUnique as any).mockResolvedValueOnce(null);
      const postFromId = {
        id: '999',
        slug: 'moto-por-id',
        lang: 'pt',
        translationGroupId: 555
      };
      (prisma.post.findMany as any).mockResolvedValue([postFromId]);

      const post = await findPostBySlugOrId('999');
      expect(post).toEqual(postFromId);
    });

    it('findPostBySlugOrId deve recorrer ao fallback estático POSTS quando banco falhar ou não encontrar', async () => {
      (prisma.post.findUnique as any).mockRejectedValueOnce(new Error('DB offline'));
      (prisma.post.findMany as any).mockRejectedValueOnce(new Error('DB offline'));

      const fallbackPost = await findPostBySlugOrId(POSTS[0].slug);
      expect(fallbackPost).toEqual(POSTS[0]);

      const empty = await findPostBySlugOrId('');
      expect(empty).toBeNull();
    });

    it('generatePostMetadata deve criar metadados completos de SEO, OpenGraph e Twitter', async () => {
      const mockPost = {
        id: '1',
        slug: 'post-completo',
        title: 'Título <b>HTML</b>',
        seoTitle: 'Título Customizado',
        excerpt: 'Resumo do post para SEO',
        tag: 'Review',
        img: 'https://images.unsplash.com/photo-1571646036117',
        translationGroupId: 10
      };
      (prisma.post.findUnique as any).mockResolvedValueOnce(mockPost);
      (prisma.post.findMany as any).mockResolvedValueOnce([
        { lang: 'en', slug: 'post-en' },
        { lang: 'es', slug: 'post-es' }
      ]);

      const meta = await generatePostMetadata('post-completo');
      expect(meta.title).toBe('Título Customizado · Moto na Prática');
      expect(meta.description).toBe('Resumo do post para SEO');
      expect(meta.openGraph.title).toBe('Título HTML');
      expect(meta.openGraph.images[0].url).toBe(mockPost.img);
      expect(meta.alternates?.languages).toEqual({
        en: '/en/post/post-en',
        es: '/es/post/post-es'
      });
    });

    it('generatePostMetadata deve retornar "Post Não Encontrado" para identificadores inválidos', async () => {
      (prisma.post.findUnique as any).mockResolvedValueOnce(null);
      (prisma.post.findMany as any).mockResolvedValueOnce([]);

      const meta = await generatePostMetadata('slug-completamente-desconhecida');
      expect(meta.title).toBe('Post Não Encontrado');
    });
  });

  describe('6. Robustez contra Quebras de Layout e Edge Cases Semânticos', () => {
    it('deve manter integridade de contraste mesmo com caracteres minúsculos ou maiúsculos em Hex', () => {
      expect(calculateContrastRatio('#fff', '#000')).toBeCloseTo(21, 0);
      expect(calculateContrastRatio('#FFFFFF', '#111827')).toBeGreaterThan(15);
      expect(calculateContrastRatio('#f8f9fa', '#111827')).toBeGreaterThan(15);
    });

    it('não deve conter valores depreciados ou propriedades inválidas no theme.css', () => {
      expect(themeCssContent).not.toContain('TODO');
      expect(themeCssContent).not.toContain('FIXME');
    });

    it('as fontes declaradas nos estilos devem coincidir com as importadas no layout', () => {
      expect(themeCssContent).toContain('--font-teko');
      expect(layoutContent).toContain('--font-teko');
      expect(layoutContent).toContain('--font-barlow');
    });
  });
});
