import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Importações puras de TypeScript (dados de navegação e traduções)
import { PORTAL_NAV_LINKS, INSTITUTIONAL_LINKS } from '../app/data';
import { TRANSLATIONS, getTranslation, Language } from '../app/i18n/translations';

// Utilitário para extrair metadados e exports dos arquivos das páginas
function extractPageMetadata(fileContent: string): { title: string; description: string } {
  const metaMatch = fileContent.match(/export const metadata = ({[\s\S]*?^};)/m);
  if (!metaMatch) {
    throw new Error('Não foi possível encontrar "export const metadata" no arquivo.');
  }
  return new Function(`return ${metaMatch[1]}`)();
}

describe('Portal de Motos: Páginas Estáticas Institucionais, SEO, Navegação e I18n', () => {
  const rootDir = process.cwd();

  // --------------------------------------------------------------------------
  // 1. EXISTÊNCIA, EXPORTAÇÃO PADRÃO E METADADOS SEO DAS PÁGINAS INSTITUCIONAIS
  // --------------------------------------------------------------------------
  describe('1. Exportação Padrão e Metadados SEO das Páginas Institucionais', () => {
    const staticPages = [
      {
        slug: 'politica-editorial',
        filePath: 'src/app/politica-editorial/page.tsx',
        componentName: 'PoliticaEditorialPage',
        expectedTitleWord: 'Política Editorial',
        expectedKeyword: 'editorial'
      },
      {
        slug: 'contato',
        filePath: 'src/app/contato/page.tsx',
        componentName: 'ContatoPage',
        expectedTitleWord: 'Contato',
        expectedKeyword: 'contato'
      },
      {
        slug: 'anuncie',
        filePath: 'src/app/anuncie/page.tsx',
        componentName: 'AnunciePage',
        expectedTitleWord: 'Anuncie',
        expectedKeyword: 'mídia kit'
      },
      {
        slug: 'termos-de-uso',
        filePath: 'src/app/termos-de-uso/page.tsx',
        componentName: 'TermosDeUsoPage',
        expectedTitleWord: 'Termos de Uso',
        expectedKeyword: 'responsabilidade'
      },
      {
        slug: 'politica-de-privacidade',
        filePath: 'src/app/politica-de-privacidade/page.tsx',
        componentName: 'PoliticaDePrivacidadePage',
        expectedTitleWord: 'Privacidade',
        expectedKeyword: 'LGPD'
      },
      {
        slug: 'equipe',
        filePath: 'src/app/equipe/page.tsx',
        componentName: 'EquipePage',
        expectedTitleWord: 'Quem Faz',
        expectedKeyword: 'jornalistas'
      }
    ];

    staticPages.forEach(({ slug, filePath, componentName, expectedTitleWord, expectedKeyword }) => {
      describe(`Página Institucional: /${slug}`, () => {
        const fullPath = path.resolve(rootDir, filePath);
        const fileExists = fs.existsSync(fullPath);
        const fileContent = fileExists ? fs.readFileSync(fullPath, 'utf-8') : '';

        it(`arquivo deve existir fisicamente em "${filePath}"`, () => {
          expect(fileExists).toBe(true);
        });

        it(`deve conter a exportação padrão da função "${componentName}"`, () => {
          expect(fileContent).toMatch(new RegExp(`export default function ${componentName}\\s*\\(`));
        });

        it('deve conter metadados SEO estáticos válidos com título institucional e marca', () => {
          const metadata = extractPageMetadata(fileContent);
          expect(metadata).toBeDefined();
          expect(metadata.title).toBeDefined();
          expect(metadata.title).toContain(expectedTitleWord);
          expect(metadata.title).toContain('Moto na Prática');
        });

        it(`deve conter descrição SEO rica (> 40 caracteres) e menção a "${expectedKeyword}"`, () => {
          const metadata = extractPageMetadata(fileContent);
          expect(metadata.description).toBeDefined();
          expect(metadata.description.length).toBeGreaterThan(40);
          expect(metadata.description.toLowerCase()).toContain(expectedKeyword.toLowerCase());
        });

        it('deve conter navegação breadcrumb com link para a Home ("/")', () => {
          expect(fileContent).toContain('href="/"');
          expect(fileContent).toContain('Home');
        });

        it('deve utilizar o contêiner responsivo padrão de 1200px', () => {
          expect(fileContent).toContain('max-w-[1200px]');
        });
      });
    });

    describe('Página Institucional Especial: /sobre', () => {
      const sobrePath = path.resolve(rootDir, 'src/app/sobre/page.tsx');
      const sobreContent = fs.readFileSync(sobrePath, 'utf-8');

      it('deve conter exportação default da função Sobre', () => {
        expect(sobreContent).toMatch(/export default async function Sobre\s*\(/);
      });

      it('deve exportar a função generateMetadata com fallback para Quem Somos', () => {
        expect(sobreContent).toMatch(/export async function generateMetadata\s*\(/);
        expect(sobreContent).toContain('Quem Somos · Jornalismo Independente & E-E-A-T · Moto na Prática');
        expect(sobreContent).toContain('Conheça o Moto na Pr');
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. CONSTANTES DE NAVEGAÇÃO E LINKS INSTITUCIONAIS (data.ts)
  // --------------------------------------------------------------------------
  describe('2. Navegação Global do Portal e Links Institucionais (data.ts)', () => {
    it('PORTAL_NAV_LINKS deve ser um array com os 7 links editoriais principais', () => {
      expect(PORTAL_NAV_LINKS).toBeDefined();
      expect(Array.isArray(PORTAL_NAV_LINKS)).toBe(true);
      expect(PORTAL_NAV_LINKS.length).toBe(7);

      const expectedLinks = [
        { label: 'Home', path: '/' },
        { label: 'Lançamentos', path: '/posts?tag=Lançamentos' },
        { label: 'Testes & Reviews', path: '/reviews' },
        { label: 'MotoGP & Corridas', path: '/eventos' },
        { label: 'Oficina & Manutenção', path: '/manutencao' },
        { label: 'Rotas & Viagens', path: '/rotas' },
        { label: 'Equipamentos', path: '/equipamentos' }
      ];

      expectedLinks.forEach((expected, i) => {
        expect(PORTAL_NAV_LINKS[i].label).toBe(expected.label);
        expect(PORTAL_NAV_LINKS[i].path).toBe(expected.path);
        expect(PORTAL_NAV_LINKS[i].path.startsWith('/')).toBe(true);
      });
    });

    it('INSTITUTIONAL_LINKS deve ser um array com os 7 links institucionais e regulatórios', () => {
      expect(INSTITUTIONAL_LINKS).toBeDefined();
      expect(Array.isArray(INSTITUTIONAL_LINKS)).toBe(true);
      expect(INSTITUTIONAL_LINKS.length).toBe(7);

      const expectedInstitutional = [
        { label: 'Quem Somos', path: '/sobre' },
        { label: 'Política Editorial', path: '/politica-editorial' },
        { label: 'Equipe da Redação', path: '/equipe' },
        { label: 'Fale com a Redação', path: '/contato' },
        { label: 'Anuncie no Portal', path: '/anuncie' },
        { label: 'Termos de Uso', path: '/termos-de-uso' },
        { label: 'Privacidade e LGPD', path: '/politica-de-privacidade' }
      ];

      expectedInstitutional.forEach((expected, i) => {
        expect(INSTITUTIONAL_LINKS[i].label).toBe(expected.label);
        expect(INSTITUTIONAL_LINKS[i].path).toBe(expected.path);
        expect(INSTITUTIONAL_LINKS[i].path.startsWith('/')).toBe(true);
      });
    });

    it('não deve haver links duplicados ou caminhos malformados em INSTITUTIONAL_LINKS', () => {
      const paths = INSTITUTIONAL_LINKS.map(link => link.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);

      paths.forEach(p => {
        expect(p).toMatch(/^\/[a-z0-9-]+$/);
      });
    });
  });

  // --------------------------------------------------------------------------
  // 3. SCHEMA ESTRUTURADO NewsMediaOrganization (layout.tsx)
  // --------------------------------------------------------------------------
  describe('3. Schema Estruturado NewsMediaOrganization e Footer no Layout (layout.tsx)', () => {
    const layoutPath = path.resolve(rootDir, 'src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    it('layout.tsx deve incluir script JSON-LD com newsMediaSchema', () => {
      expect(layoutContent).toContain('type="application/ld+json"');
      expect(layoutContent).toContain('dangerouslySetInnerHTML={{ __html: JSON.stringify(newsMediaSchema) }}');
    });

    it('newsMediaSchema deve atender integralmente à especificação NewsMediaOrganization do Schema.org', () => {
      const schemaMatch = layoutContent.match(/const newsMediaSchema = ({[\s\S]*?^  };)/m);
      expect(schemaMatch).not.toBeNull();
      if (schemaMatch) {
        const schemaStr = schemaMatch[1];
        expect(schemaStr).toContain('"@context": "https://schema.org"');
        expect(schemaStr).toContain('"@type": "NewsMediaOrganization"');
        expect(schemaStr).toContain('"name": "Moto na Prática"');
        expect(schemaStr).toContain('"url": siteUrl');
        expect(schemaStr).toContain('"ethicsPolicy": `${siteUrl}/politica-editorial`');
        expect(schemaStr).toContain('"correctionsPolicy": `${siteUrl}/politica-editorial#correcoes`');
        expect(schemaStr).not.toContain('"sameAs"');
      }
    });

    it('o footer em layout.tsx deve apresentar links para todas as 7 páginas institucionais e âncoras', () => {
      const institutionalUrls = [
        '/sobre',
        '/politica-editorial',
        '/equipe',
        '/contato',
        '/anuncie',
        '/termos-de-uso',
        '/politica-de-privacidade',
        '/politica-editorial#metodologia',
        '/politica-de-privacidade#exclusao-dados'
      ];

      institutionalUrls.forEach(url => {
        expect(layoutContent, `Footer deve conter link para ${url}`).toContain(`href="${url}"`);
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. REGRAS DE VALIDAÇÃO DE FORMULÁRIOS (ContactForm & AdvertiseContactForm)
  // --------------------------------------------------------------------------
  describe('4. Regras de Validação dos Formulários Institucionais e Comerciais', () => {
    // Espelho semântico da lógica exata de ContactForm
    function validateContactForm(data: { fullName: string; email: string; subject: string; message: string }) {
      const newErrors: Record<string, string> = {};

      if (!data.fullName.trim()) {
        newErrors.fullName = "Por favor, informe seu nome completo.";
      } else if (data.fullName.trim().length < 3) {
        newErrors.fullName = "O nome deve conter ao menos 3 caracteres.";
      }

      if (!data.email.trim()) {
        newErrors.email = "Por favor, informe seu e-mail.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        newErrors.email = "Insira um endereço de e-mail válido.";
      }

      if (!data.subject) {
        newErrors.subject = "Selecione o assunto do contato.";
      }

      if (!data.message.trim()) {
        newErrors.message = "Por favor, digite sua mensagem.";
      } else if (data.message.trim().length < 10) {
        newErrors.message = "A mensagem deve conter no mínimo 10 caracteres.";
      }

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors
      };
    }

    // Espelho semântico da lógica exata de AdvertiseContactForm
    function validateAdvertiseForm(data: {
      contactName: string;
      companyName: string;
      corporateEmail: string;
      adFormat: string;
      message: string;
    }) {
      const newErrors: Record<string, string> = {};

      if (!data.contactName.trim()) {
        newErrors.contactName = "Por favor, informe o nome do responsável.";
      }

      if (!data.companyName.trim()) {
        newErrors.companyName = "Informe o nome da empresa ou agência.";
      }

      if (!data.corporateEmail.trim()) {
        newErrors.corporateEmail = "Informe o e-mail de contato corporativo.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.corporateEmail.trim())) {
        newErrors.corporateEmail = "Insira um endereço de e-mail válido.";
      }

      if (!data.adFormat) {
        newErrors.adFormat = "Selecione o formato de mídia pretendido.";
      }

      if (!data.message.trim()) {
        newErrors.message = "Descreva brevemente o objetivo da campanha.";
      }

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors
      };
    }

    describe('ContactForm - Regras de Validação', () => {
      it('deve rejeitar submissão com todos os campos em branco', () => {
        const result = validateContactForm({
          fullName: '',
          email: '',
          subject: '',
          message: ''
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.fullName).toBe("Por favor, informe seu nome completo.");
        expect(result.errors.email).toBe("Por favor, informe seu e-mail.");
        expect(result.errors.subject).toBe("Selecione o assunto do contato.");
        expect(result.errors.message).toBe("Por favor, digite sua mensagem.");
      });

      it('deve rejeitar nome menor que 3 caracteres ou contendo apenas espaços', () => {
        const withSpaces = validateContactForm({
          fullName: '   ',
          email: 'teste@exemplo.com',
          subject: 'Dúvida Técnica / Mecânica',
          message: 'Mensagem com tamanho suficiente'
        });
        expect(withSpaces.isValid).toBe(false);
        expect(withSpaces.errors.fullName).toBe("Por favor, informe seu nome completo.");

        const tooShort = validateContactForm({
          fullName: 'Ab',
          email: 'teste@exemplo.com',
          subject: 'Dúvida Técnica / Mecânica',
          message: 'Mensagem com tamanho suficiente'
        });
        expect(tooShort.isValid).toBe(false);
        expect(tooShort.errors.fullName).toBe("O nome deve conter ao menos 3 caracteres.");

        const exactBoundary = validateContactForm({
          fullName: 'Ana',
          email: 'teste@exemplo.com',
          subject: 'Dúvida Técnica / Mecânica',
          message: 'Mensagem com tamanho suficiente'
        });
        expect(exactBoundary.errors.fullName).toBeUndefined();
      });

      it('deve validar formatos inválidos de e-mail', () => {
        const invalidEmails = [
          'invalido',
          'sem-arroba.com',
          'com espaco@email.com',
          'teste@semdominio',
          '@semusuario.com'
        ];

        invalidEmails.forEach((email) => {
          const res = validateContactForm({
            fullName: 'Carlos Pilot',
            email,
            subject: 'Outro',
            message: 'Mensagem válida com mais de dez caracteres.'
          });
          expect(res.isValid).toBe(false);
          expect(res.errors.email).toBe("Insira um endereço de e-mail válido.");
        });
      });

      it('deve aceitar formatos legítimos de e-mail', () => {
        const validEmails = [
          'contato@empresa.com.br',
          'usuario+filtro@dominio.io',
          'primeiro.segundo@sub.dominio.org'
        ];

        validEmails.forEach((email) => {
          const res = validateContactForm({
            fullName: 'Carlos Pilot',
            email,
            subject: 'Outro',
            message: 'Mensagem válida com mais de dez caracteres.'
          });
          expect(res.errors.email).toBeUndefined();
        });
      });

      it('deve rejeitar mensagem menor que 10 caracteres ou vazia após trim', () => {
        const shortMsg = validateContactForm({
          fullName: 'Amanda Costa',
          email: 'amanda@teste.com',
          subject: 'Sugestão de Pauta / Notícia',
          message: '123456789'
        });
        expect(shortMsg.isValid).toBe(false);
        expect(shortMsg.errors.message).toBe("A mensagem deve conter no mínimo 10 caracteres.");

        const spacesMsg = validateContactForm({
          fullName: 'Amanda Costa',
          email: 'amanda@teste.com',
          subject: 'Sugestão de Pauta / Notícia',
          message: '          '
        });
        expect(spacesMsg.isValid).toBe(false);
        expect(spacesMsg.errors.message).toBe("Por favor, digite sua mensagem.");

        const tenChars = validateContactForm({
          fullName: 'Amanda Costa',
          email: 'amanda@teste.com',
          subject: 'Sugestão de Pauta / Notícia',
          message: '1234567890'
        });
        expect(tenChars.errors.message).toBeUndefined();
      });

      it('deve aprovar submissão de formulário totalmente válido', () => {
        const valid = validateContactForm({
          fullName: 'Rodrigo Motociclista',
          email: 'rodrigo.moto@gmail.com',
          subject: 'Sugestão de Pauta / Notícia',
          message: 'Gostaria de sugerir uma matéria sobre consumo em altitude.'
        });
        expect(valid.isValid).toBe(true);
        expect(Object.keys(valid.errors).length).toBe(0);
      });

      it('arquivo ContactForm.tsx deve conter inputs estruturados, acessibilidade e opções', () => {
        const fileContent = fs.readFileSync(path.resolve(rootDir, 'src/app/contato/ContactForm.tsx'), 'utf-8');
        expect(fileContent).toContain('name="fullName"');
        expect(fileContent).toContain('name="email"');
        expect(fileContent).toContain('name="subject"');
        expect(fileContent).toContain('name="message"');
        expect(fileContent).toContain('aria-invalid');
        expect(fileContent).toContain('aria-describedby');
        expect(fileContent).toContain('Sugestão de Pauta / Notícia');
        expect(fileContent).toContain('Dúvida Técnica / Mecânica');
        expect(fileContent).toContain('Correção de Matéria');
        expect(fileContent).toContain('Parceria Comercial / Publicidade');
        expect(fileContent).toContain('Outro');
      });
    });

    describe('AdvertiseContactForm - Regras de Validação Comercial', () => {
      it('deve rejeitar submissão com dados em branco', () => {
        const result = validateAdvertiseForm({
          contactName: '',
          companyName: '',
          corporateEmail: '',
          adFormat: '',
          message: ''
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.contactName).toBe("Por favor, informe o nome do responsável.");
        expect(result.errors.companyName).toBe("Informe o nome da empresa ou agência.");
        expect(result.errors.corporateEmail).toBe("Informe o e-mail de contato corporativo.");
        expect(result.errors.adFormat).toBe("Selecione o formato de mídia pretendido.");
        expect(result.errors.message).toBe("Descreva brevemente o objetivo da campanha.");
      });

      it('deve validar e-mail corporativo inválido', () => {
        const result = validateAdvertiseForm({
          contactName: 'Fernanda Lima',
          companyName: 'Capacetes Inc',
          corporateEmail: 'fernanda-empresa',
          adFormat: 'Banners IAB Display (Leaderboard / MPU)',
          message: 'Campanha de lançamento da coleção 2026'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.corporateEmail).toBe("Insira um endereço de e-mail válido.");
      });

      it('deve aprovar formulário comercial completo', () => {
        const valid = validateAdvertiseForm({
          contactName: 'Luciana Brandão',
          companyName: 'Motopeças do Brasil',
          corporateEmail: 'luciana@motopecas.com.br',
          adFormat: 'Branded Content / Review Patrocinado',
          message: 'Gostaríamos de agendar uma reunião comercial para avaliar pacote semestral.'
        });
        expect(valid.isValid).toBe(true);
        expect(Object.keys(valid.errors).length).toBe(0);
      });

      it('arquivo AdvertiseContactForm.tsx deve conter opções de formatos IAB e faixas de investimento', () => {
        const fileContent = fs.readFileSync(path.resolve(rootDir, 'src/app/anuncie/AdvertiseContactForm.tsx'), 'utf-8');
        expect(fileContent).toContain('name="contactName"');
        expect(fileContent).toContain('name="companyName"');
        expect(fileContent).toContain('name="corporateEmail"');
        expect(fileContent).toContain('name="phone"');
        expect(fileContent).toContain('name="adFormat"');
        expect(fileContent).toContain('name="budgetRange"');
        expect(fileContent).toContain('name="message"');

        // Formatos
        expect(fileContent).toContain('Banners IAB Display (Leaderboard / MPU)');
        expect(fileContent).toContain('Branded Content / Review Patrocinado');
        expect(fileContent).toContain('Patrocínio de Newsletter Semanal');

        // Faixas de Budget
        expect(fileContent).toContain('Até R$ 3.000 / mês');
        expect(fileContent).toContain('R$ 3.000 a R$ 8.000 / mês');
        expect(fileContent).toContain('Acima de R$ 20.000 / mês');
      });
    });
  });

  // --------------------------------------------------------------------------
  // 5. INTEGRIDADE DAS CHAVES DE TRADUÇÃO (translations.ts para PT / EN / ES)
  // --------------------------------------------------------------------------
  describe('5. Integridade e Paridade de I18n para Chaves Institucionais e Navegação', () => {
    const languages: Language[] = ['pt', 'en', 'es'];

    const requiredNavKeys = [
      'home',
      'reviews',
      'maintenance',
      'routes',
      'gear',
      'events',
      'about',
      'contact',
      'team',
      'editorialPolicy',
      'advertise',
      'terms',
      'privacy'
    ];

    const requiredInstitutionalKeys = [
      'contact',
      'team',
      'editorialPolicy',
      'advertise',
      'terms',
      'privacy',
      'press',
      'editorialTeam',
      'contactDesc',
      'editorialPolicyDesc',
      'advertiseDesc',
      'termsDesc',
      'privacyDesc',
      'teamDesc'
    ];

    languages.forEach((lang) => {
      describe(`Idioma: ${lang.toUpperCase()}`, () => {
        it(`deve conter todas as ${requiredNavKeys.length} chaves obrigatórias em nav`, () => {
          const nav = TRANSLATIONS[lang].nav;
          expect(nav).toBeDefined();

          requiredNavKeys.forEach((key) => {
            expect(nav, `Faltando chave nav.${key} no idioma ${lang}`).toHaveProperty(key);
            const value = (nav as Record<string, string>)[key];
            expect(typeof value).toBe('string');
            expect(value.trim().length).toBeGreaterThan(0);
          });
        });

        it(`deve conter todas as ${requiredInstitutionalKeys.length} chaves obrigatórias em institutional`, () => {
          const inst = TRANSLATIONS[lang].institutional;
          expect(inst).toBeDefined();

          requiredInstitutionalKeys.forEach((key) => {
            expect(inst, `Faltando chave institutional.${key} no idioma ${lang}`).toHaveProperty(key);
            const value = (inst as Record<string, string>)[key];
            expect(typeof value).toBe('string');
            expect(value.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('todas as linguagens devem possuir exata paridade estrutural em institutional', () => {
      const ptKeys = Object.keys(TRANSLATIONS.pt.institutional).sort();
      const enKeys = Object.keys(TRANSLATIONS.en.institutional).sort();
      const esKeys = Object.keys(TRANSLATIONS.es.institutional).sort();

      expect(enKeys).toEqual(ptKeys);
      expect(esKeys).toEqual(ptKeys);
    });

    it('todas as linguagens devem possuir exata paridade estrutural em nav', () => {
      const ptKeys = Object.keys(TRANSLATIONS.pt.nav).sort();
      const enKeys = Object.keys(TRANSLATIONS.en.nav).sort();
      const esKeys = Object.keys(TRANSLATIONS.es.nav).sort();

      expect(enKeys).toEqual(ptKeys);
      expect(esKeys).toEqual(ptKeys);
    });

    it('getTranslation deve retornar o dicionário correto e fallback gracioso para PT', () => {
      expect(getTranslation('pt')).toBe(TRANSLATIONS.pt);
      expect(getTranslation('en')).toBe(TRANSLATIONS.en);
      expect(getTranslation('es')).toBe(TRANSLATIONS.es);

      // Fallbacks
      expect(getTranslation('fr')).toBe(TRANSLATIONS.pt);
      expect(getTranslation('')).toBe(TRANSLATIONS.pt);
      expect(getTranslation(undefined as any)).toBe(TRANSLATIONS.pt);
    });
  });
});
