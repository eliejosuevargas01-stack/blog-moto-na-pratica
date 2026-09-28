export const TEKO: React.CSSProperties = { fontFamily: "var(--font-teko), 'Teko', sans-serif" };
export const BODY: React.CSSProperties = { fontFamily: "var(--font-barlow), 'Barlow', sans-serif" };

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Reviews", path: "/reviews" },
  { label: "Manutenção", path: "/manutencao" },
  { label: "Rotas", path: "/rotas" },
  { label: "Equipamentos", path: "/equipamentos" },
  { label: "Sobre", path: "/sobre" },
];

export const PORTAL_NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Lançamentos", path: "/posts?tag=Lançamentos" },
  { label: "Testes & Reviews", path: "/reviews" },
  { label: "MotoGP & Corridas", path: "/eventos" },
  { label: "Oficina & Manutenção", path: "/manutencao" },
  { label: "Rotas & Viagens", path: "/rotas" },
  { label: "Equipamentos", path: "/equipamentos" },
];

export const INSTITUTIONAL_LINKS = [
  { label: "Quem Somos", path: "/sobre" },
  { label: "Política Editorial", path: "/politica-editorial" },
  { label: "Equipe da Redação", path: "/equipe" },
  { label: "Fale com a Redação", path: "/contato" },
  { label: "Anuncie no Portal", path: "/anuncie" },
  { label: "Termos de Uso", path: "/termos-de-uso" },
  { label: "Privacidade e LGPD", path: "/politica-de-privacidade" },
];

export const TAG_COLORS: Record<string, string> = {
  Review: "bg-[#FF6A00] text-neutral-950 font-bold",
  Manutenção: "bg-[#2A2A2A] text-[#AAAAAA]",
  Rotas: "bg-[#1A3A2A] text-[#6EC49A]",
  Equipamentos: "bg-[#1A2A3A] text-[#6EAAC4]",
  Dicas: "bg-[#252525] text-[#AAAAAA]",
  Lançamentos: "bg-[#E11D48] text-white font-bold",
  Eventos: "bg-[#2563EB] text-white font-bold",
};

export interface Post {
  id: number;
  slug: string;
  tag: string;
  category?: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  img: string;
  content?: string;
}

export const POSTS: Post[] = [
  {
    id: 1,
    slug: "fazer-250-solid-grey-2026-6-meses",
    tag: "Review",
    title: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    excerpt: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    date: "12 Jun 2025",
    readTime: "8 min",
    img: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1200&h=680&fit=crop&auto=format",
    content: `A Fazer 250 Solid Grey chegou na minha garagem no começo de janeiro. Cor nova, motor atualizado e um visual que me convenceu antes mesmo de ligar o motor. Seis meses depois, vou te contar o que a Yamaha acertou, o que ainda incomoda e se eu compraria de novo.

**Motor e desempenho**

O propulsor de 249cc mono segue sendo o mais refinado da categoria. Resposta suave no início da rotação, entrega mais intensa acima de 6.000 rpm. Para o trânsito diário de BH — semáforo, curva fechada, eventual contra-mão — ele cumpre tudo sem reclamar. Na estrada, cruza confortável entre 100 e 120 km/h.

**Consumo real**

Na cidade: 28 km/l. Estrada: 33 km/l. Tanque de 13 litros. Autonomia urbana em torno de 360 km antes do reserva acender — não é o número que a Yamaha divulga, mas é o que eu vivo.

**Ergonomia**

Ponto alto. Selim bem almofadado, pegada do guidão natural, pé bem posicionado. Consigo fazer 300 km sem parar sem sentir as costas.

**O que incomoda**

Espelho retrovisor vibra acima de 9.000 rpm. Cavalhete lateral um pouco curto para terreno levemente inclinado. O painel analógico ficou para trás — qualquer moto do segmento tem display digital hoje.

**Vale comprar?**

Sim. Para quem quer uma naked polivalente — cidade, estrada, curvas — sem gastar R$ 35 mil, a FZ25 Solid Grey é a escolha mais honesta do mercado em 2026.`,
  },
  {
    id: 2,
    slug: "troca-oleo-fz25-passo-a-passo",
    tag: "Manutenção",
    title: "Troca de óleo na FZ25: passo a passo sem enrolação",
    excerpt: "Óleos recomendados, torque do dreno e dicas pra não sujar a escapamento. Custo total: R$ 87.",
    date: "28 Mai 2025",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1200&h=680&fit=crop&auto=format",
    content: `Trocar o óleo da FZ25 em casa é simples, barato e você aprende muito sobre a sua moto no processo. Custo total da minha última troca: R$ 87.

**O que você vai precisar**

- 1,1 litro de óleo Yamalube 10W-40 (ou Motul 5100 10W-40)
- Chave 17mm para o dreno
- Panela ou recipiente de pelo menos 1,5 litro
- Filtro de óleo novo (a cada 2 trocas)
- Pano velho

**Passo a passo**

1. Aqueça o motor por 3 minutos — óleo quente drena melhor.
2. Posicione o recipiente abaixo do dreno (lado direito, baixo do motor).
3. Remova o dreno com a chave 17mm. Cuidado — o óleo sai quente.
4. Aguarde drenar completamente (~5 minutos).
5. Recoloque o dreno. Torque: **20 Nm** — firme, mas não exagere.
6. Despeje 1,0 litro de óleo novo pelo visor lateral.
7. Ligue o motor por 1 minuto, desligue e verifique o nível pelo visor.
8. Complete se necessário até o MAX.

**Dica importante**

Coloque um pano enrolado na escapamento antes de começar. O óleo que escorre pela lateral inevitavelmente chega lá e queima — cheiro horrível por dias.`,
  },
  {
    id: 3,
    slug: "serra-da-canastra-de-moto",
    tag: "Rotas",
    title: "Serra da Canastra de moto: a rota que todo piloto tem que fazer",
    excerpt: "Saí de BH num sábado às 6h. Estradas perfeitas, frio na cara e 620 km de pura satisfação.",
    date: "15 Mai 2025",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1200&h=680&fit=crop&auto=format",
    content: `620 km de ida e volta. Saída às 6h de BH, retorno às 19h. A Serra da Canastra é uma daquelas rotas que você faz uma vez e já está planejando a próxima.

**O roteiro**

BH → Divinópolis (BR-262) → Formiga → São Roque de Minas → Parque Nacional da Serra da Canastra → retorno pela MG-050.

**Estrada**

A MG-050 entre Divinópolis e Formiga está em excelente estado. Curvas de raio médio, ótimas para a geometria da Fazer. A partir de São Roque, o asfalto piora um pouco — nada que preocupe, mas reduza a velocidade nas entradas de curva.

**O Parque**

Entrada de moto: R$ 25. O acesso à Cachoeira Casca D'Anta é 12 km de terra — firme e seca no mês de maio, fiz sem susto na Fazer calçada com o pneu de origem.

**Equipamentos que fiz questão de levar**

Balaclava, luvas de frio e jaqueta com proteção. A temperatura na Serra baixa de forma brutal entre 9h e 11h — mesmo com sol, o vento na descida bate pesado.

**Vale para a Fazer 250?**

Totalmente. Moto leve, consumo baixo, bagageiro traseiro comporta uma mochila de 30 litros tranquilo.`,
  },
  {
    id: 4,
    slug: "hjc-rpha-11-pro-review-1-ano",
    tag: "Equipamentos",
    title: "HJC RPHA 11 Pro depois de 1 ano: vale os R$ 1.400?",
    excerpt: "Review honesto sem jabá. Ventilação, peso, visibilidade e o que mudou depois de muita chuva.",
    date: "3 Mai 2025",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1200&h=680&fit=crop&auto=format",
    content: `Comprei o HJC RPHA 11 Pro sem patrocínio, sem teste de imprensa. Paguei R$ 1.390 no cartão e usei durante 12 meses, em todos os tipos de dia — sol, chuva, frio, calor. Aqui vai o que aprendi.

**Primeiras impressões**

Pesado na mão, leve na cabeça. O RPHA 11 tem fibra de carbono na calota e isso muda tudo em uso prolongado. Acabamento premium — fivela de rolamento, vedação da viseira precisa, ventilação que realmente abre e fecha.

**Ventilação**

Funciona. Diferente de muitos capacetes com entrada de ar decorativa, o RPHA 11 tem canal interno que circula ar real. Em dias acima de 30°C, a diferença é perceptível nos primeiros 20 minutos.

**Chuva**

O kit de vedação original aguenta chuva moderada bem. Em temporal, a água infiltra pela lateral da viseira após ~15 minutos. Solução: Pinlock Max Vision (incluso na caixa) — elimina completamente o embaçamento.

**O que piorou com o tempo**

O espuma interna amoleceu após 8 meses — normal. A viseira arranhada por dentro (limpeza com pano seco descuidada no começo). O forro removível é de fácil lavagem e ajuda muito na higiene.

**Vale R$ 1.400?**

Se você roda mais de 5.000 km por ano, sim. Se você usa moto só no fim de semana, um capacete de R$ 600 cumpre o mesmo papel.`,
  },
  {
    id: 5,
    slug: "michelin-pilot-street-2-fazer",
    tag: "Review",
    title: "Michelin Pilot Street 2 na Fazer: diferença real ou papo de vendedor?",
    excerpt: "Troquei os originais com 12.000 km. A diferença em frenagem na chuva foi imediata.",
    date: "20 Abr 2025",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=680&fit=crop&auto=format",
    content: `Com 12.000 km no relógio, o pneu dianteiro original estava no limite. Aproveitei para testar o Michelin Pilot Street 2 — referência na categoria 250cc há anos. A diferença foi mais real do que esperava.

**Instalação**

Par dianteiro + traseiro: R$ 340 instalado no borracheiro que trabalha com Michelin aqui em BH. O traseiro vinha com desgaste assimétrico pelo meu costume de curvar sempre pelo mesmo lado — erro meu.

**Diferença na chuva**

Esse foi o ponto mais impressionante. O original escorregava levemente no freio em faixas de pedestre molhadas. O Pilot Street 2 eliminou completamente esse comportamento. Não é sensação — é frenagem visivelmente mais curta.

**Seco**

No seco a diferença é menor, mas o feeling de comunicação de pista melhorou. O pneu informa mais sobre o que está acontecendo no asfalto — importantes para dosagem de freio nas curvas.

**Durabilidade esperada**

O original durou 12.000 km no traseiro (estilo de pilotagem moderado). O Pilot Street 2 promete 15% a mais segundo a Michelin. Vou atualizar o post quando chegar no desgaste.

**Vale a troca?**

Sim, especialmente se você roda em cidades com asfalto irregular e muita chuva. A segurança adicional na molhado já justifica o custo.`,
  },
  {
    id: 6,
    slug: "kit-relampago-manutencao-preventiva",
    tag: "Manutenção",
    title: "Kit relâmpago: manutenção preventiva de 30 minutos todo mês",
    excerpt: "O que verificar, apertar e lubrificar antes que vire problema. Salvou minha corrente duas vezes.",
    date: "8 Abr 2025",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=1200&h=680&fit=crop&auto=format",
    content: `30 minutos por mês salvam horas de oficina e centenas de reais em manutenção corretiva. Aqui está minha checklist mensal.

**Corrente (10 min)**

Afrouxamento: empurre a corrente para cima no ponto médio entre as coroas. Folga ideal: 20-30mm na Fazer. Lubrificação: spray de corrente a cada 500 km ou sempre depois de chuva. Verificação de elos: gire a roda traseira lentamente e observe se algum elo trava.

**Pneus (5 min)**

Calibre dianteiro: 29 PSI frio. Traseiro: 33 PSI frio. Verifique a profundidade dos sulcos — indicador de desgaste fica na lateral do pneu. Observe cortes ou bolhas na lateral.

**Freios (5 min)**

Nível do fluido dianteiro: acima do mínimo. Espessura da pastilha: mínimo 2mm. Teste a firmeza da alavanca — se afundar progressivamente, há ar no circuito.

**Fluidos (5 min)**

Nível do óleo: visor lateral com moto na vertical. Nível do líquido de arrefecimento: entre MIN e MAX no reservatório translúcido.

**Elétrica (5 min)**

Farol, lanterna, setas e freio. Verificação rápida que salva de multa e acidente.`,
  },
];

export const CATEGORIES = [
  { label: "Reviews", count: 12, path: "/reviews" },
  { label: "Manutenção", count: 9, path: "/manutencao" },
  { label: "Rotas", count: 7, path: "/rotas" },
  { label: "Equipamentos", count: 11, path: "/equipamentos" },
  { label: "Dicas", count: 6, path: "/" },
  { label: "Customização", count: 4, path: "/" },
];

export function optimizeUnsplashUrl(url: string, width: number, height?: number): string {
  if (!url || !url.includes("images.unsplash.com")) return url;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("w", width.toString());
    if (height) {
      urlObj.searchParams.set("h", height.toString());
      urlObj.searchParams.set("fit", "crop");
    }
    urlObj.searchParams.set("auto", "format");
    urlObj.searchParams.set("q", "75");
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}

export function optimizeImageUrl(url: string, width: number, height?: number): string {
  if (!url) return "";
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop()?.split("?")[0];
    if (filename) {
      return `/uploads/${filename}?w=${width}`;
    }
  }
  if (url.includes("images.unsplash.com")) {
    return optimizeUnsplashUrl(url, width, height);
  }
  return url;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^a-z0-9\u00C0-\u00FF]+/gi, "-") // preserve accented characters but replace spaces/symbols
    .replace(/^-+|-+$/g, "");
}

export function formatPostUrl(slug: string, lang?: string | null): string {
  if (!slug) return "/";
  let clean = slug.trim().replace(/^https?:\/\/[^\/]+/i, "");
  while (/^\/?(posts|post|reviews|resenas|avaliacoes)\//i.test(clean) || clean.startsWith("/")) {
    clean = clean.replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "").replace(/^\/+/, "");
  }
  if (lang === "en") return `/en/post/${clean}`;
  if (lang === "es") return `/es/post/${clean}`;
  return `/post/${clean}`;
}

export function toNumericGroupId(val: any): number {
  if (typeof val === "number" && !isNaN(val)) {
    return Math.floor(val);
  }
  if (!val) {
    return Math.floor(100000 + Math.random() * 900000);
  }
  const rawStr = String(val).trim();
  if (/^\d+$/.test(rawStr)) {
    const parsed = parseInt(rawStr, 10);
    if (!isNaN(parsed)) return parsed;
  }
  const digitsOnly = rawStr.replace(/\D/g, "");
  if (digitsOnly.length >= 4) {
    const parsed = parseInt(digitsOnly.slice(0, 8), 10);
    if (!isNaN(parsed)) return parsed;
  }
  let hash = 0;
  for (let i = 0; i < rawStr.length; i++) {
    hash = ((hash << 5) - hash) + rawStr.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 900000) + 100000;
}

export interface InstitutionalPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  bodyHtml: string;
}

export const STATIC_INSTITUTIONAL_PAGES: Record<string, InstitutionalPage> = {
  "politica-editorial": {
    slug: "politica-editorial",
    title: "Política Editorial & Código de Conduta",
    seoTitle: "Política Editorial & Diretrizes Éticas · Moto na Prática",
    seoDescription: "Conheça nossas diretrizes éticas, independência jornalística, metodologia de testes e política de correções.",
    bodyHtml: `
      <h2>1. Compromisso com a Independência Editorial</h2>
      <p>O <strong>Moto na Prática</strong> é um portal jornalístico independente dedicado à cobertura técnica, informativa e cultural do motociclismo. Nossa missão prioritária é fornecer ao leitor informações autênticas, rigorosas e livres de conflitos de interesse.</p>
      <p>Não aceitamos acordos comerciais que condicionem análises, imponham censura prévia, exijam aprovação de pauta ou obriguem vereditos positivos. Se um produto ou motocicleta apresentar falhas mecânicas, fragilidade construtiva ou consumo incompatível com as especificações declaradas pela montadora, isso será registrado de forma explícita e fundamentada.</p>

      <h2>2. Metodologia de Testes e Medições</h2>
      <p>Todos os testes de consumo de combustível são realizados com abastecimento no bocal sob metodologia tanque-a-tanque na mesma bomba e com a mesma inclinação da moto. Não nos pautamos unicamente por computadores de bordo eletrônicos.</p>
      <p>Nossos testes de rodagem combinam trajetos urbanos pesados, rodovias de serra e vias de trânsito rápido com passageiro e carga para simular o uso real do proprietário brasileiro.</p>

      <h2>3. Política de Transparência e Financiamento</h2>
      <p>O portal é sustentado por publicidade programática, parcerias de mídia claramente identificadas e programas de afiliados. Todo conteúdo patrocinado ou comercial é ostensivamente rotulado com as etiquetas <em>"Publicidade"</em>, <em>"Informe Publicitário"</em> ou <em>"Conteúdo de Parceiro"</em>.</p>

      <h2>4. Política de Retificações e Erratas</h2>
      <p>Nosso compromisso com a verdade implica na correção imediata de qualquer equívoco factual ou técnico apurado pela equipe ou apontado por leitores. Erratas substantivas serão informadas com nota de atualização destacada no início ou rodapé da matéria.</p>
    `
  },
  "equipe": {
    slug: "equipe",
    title: "Equipe Editorial & Redação",
    seoTitle: "Equipe da Redação & Especialistas · Moto na Prática",
    seoDescription: "Conheça os jornalistas, pilotos de teste e técnicos que compõem a redação do Moto na Prática.",
    bodyHtml: `
      <h2>Quem Faz o Moto na Prática</h2>
      <p>Nossa equipe reúne profissionais apaixonados por duas rodas, unindo a prática diária de pilotagem urbana e rodoviária ao rigor da apuração jornalística e do conhecimento mecânico.</p>
      
      <div class="my-6 p-6 bg-card border border-border">
        <h3 class="text-xl font-bold mb-1 text-foreground">Eliezer</h3>
        <p class="text-sm text-primary font-semibold mb-3">Fundador & Responsável pelo Projeto</p>
        <p class="text-muted-foreground text-sm">Piloto e entusiasta com base de operações em Gaspar - SC. Responsável pela coordenação do teste de longa duração da Fazer 250 (FZ25) e pelas avaliações de consumo real na bomba, ergonomia diária e manutenção preventiva.</p>
      </div>

      <div class="my-6 p-6 bg-card border border-border">
        <h3 class="text-xl font-bold mb-1 text-foreground">Redação Técnica & Colaboradores</h3>
        <p class="text-sm text-primary font-semibold mb-3">Mecânica, Motorsport & Viagens</p>
        <p class="text-muted-foreground text-sm">Nossos repórteres técnicos e consultores mecânicos cobrem os lançamentos de mercado, regulamentos esportivos de MotoGP e Superbike, além de rotas de mototurismo pelo Brasil e América do Sul.</p>
      </div>

      <h2>Canal Direto com a Redação</h2>
      <p>Sugestões de pauta, correções técnicas ou dúvidas mecânicas podem ser enviadas diretamente para a equipe através da nossa página de contato.</p>
    `
  },
  "contato": {
    slug: "contato",
    title: "Fale com a Redação",
    seoTitle: "Fale com a Redação & Atendimento · Moto na Prática",
    seoDescription: "Entre em contato com os editores do Moto na Prática para pautas, correções, testes e relacionamento.",
    bodyHtml: `
      <h2>Canais de Atendimento</h2>
      <p>Valorizamos o diálogo constante com nossa comunidade de pilotos e leitores. Escolha o canal mais adequado para a sua mensagem:</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div class="p-6 bg-card border border-border">
          <h3 class="font-bold text-lg mb-2">Pautas & Sugestões de Teste</h3>
          <p class="text-sm text-muted-foreground mb-3">Envie novidades, motos para avaliação ou flagras do setor.</p>
          <p class="text-sm font-semibold text-primary">Fale conosco via Página de Contato</p>
        </div>
        <div class="p-6 bg-card border border-border">
          <h3 class="font-bold text-lg mb-2">Correções & Erratas</h3>
          <p class="text-sm text-muted-foreground mb-3">Identificou um dado impreciso? Notifique nossa equipe imediatamente.</p>
          <p class="text-sm font-semibold text-primary">Fale conosco via Página de Contato</p>
        </div>
        <div class="p-6 bg-card border border-border">
          <h3 class="font-bold text-lg mb-2">Publicidade & Parcerias</h3>
          <p class="text-sm text-muted-foreground mb-3">Propostas de mídia kit, patrocínio de rotas e anúncios institucionais.</p>
          <p class="text-sm font-semibold text-primary">Fale conosco via Página de Contato</p>
        </div>
        <div class="p-6 bg-card border border-border">
          <h3 class="font-bold text-lg mb-2">Privacidade & LGPD</h3>
          <p class="text-sm text-muted-foreground mb-3">Dúvidas sobre tratamento de dados e exercício de direitos legais.</p>
          <p class="text-sm font-semibold text-primary">Fale conosco via Página de Contato</p>
        </div>
      </div>
    `
  },
  "anuncie": {
    slug: "anuncie",
    title: "Anuncie no Portal & Mídia Kit",
    seoTitle: "Anuncie no Portal · Mídia Kit & Parcerias · Moto na Prática",
    seoDescription: "Divulgue sua marca para um público altamente qualificado de motociclistas e entusiastas de duas rodas.",
    bodyHtml: `
      <h2>Conecte sua Marca à Comunidade de Duas Rodas</h2>
      <p>O <strong>Moto na Prática</strong> alcança motociclistas ativos, proprietários de motos urbanas e de viagem, que buscam decisões conscientes de compra de equipamentos, pneus, óleos lubrificantes e motos zero quilômetro.</p>

      <h2>Formatos Disponíveis</h2>
      <ul>
        <li><strong>Banners Display de Alto Impacto:</strong> Posições no topo, sidebar e in-content responsivos.</li>
        <li><strong>Projetos Especiais & Rotas Patrocinadas:</strong> Cobertura de grandes expedições com menção institucional transparente.</li>
        <li><strong>Newsletter Exclusiva:</strong> Comunicação direta com leitores inscritos e segmentados por interesse.</li>
      </ul>

      <p class="mt-6">Para consultar nossos formatos e propostas comerciais, escreva para <strong class="text-primary">Fale conosco via Página de Contato</strong>.</p>
    `
  },
  "termos-de-uso": {
    slug: "termos-de-uso",
    title: "Termos de Uso",
    seoTitle: "Termos de Uso · Moto na Prática",
    seoDescription: "Condições gerais de navegação, direitos autorais e regras de uso do portal Moto na Prática.",
    bodyHtml: `
      <h2>1. Aceitação dos Termos</h2>
      <p>Ao acessar e navegar no portal <strong>Moto na Prática</strong>, o usuário declara concordar integralmente com as condições aqui estabelecidas.</p>

      <h2>2. Propriedade Intelectual</h2>
      <p>Todo o conteúdo publicado — incluindo textos, fotografias originais, dados de testes e elementos gráficos — é protegido pelas leis brasileiras de direitos autorais. A reprodução parcial é permitida exclusivamente com citação expressa da fonte com link ativo do portal.</p>

      <h2>3. Responsabilidade Técnica</h2>
      <p>Os relatos de manutenção preventiva e mecânica refletem a experiência prática da redação. Cada motociclista deve consultar o manual oficial do proprietário e executar reparos com ferramentas e proteções adequadas, não se responsabilizando o portal por procedimentos executados incorretamente por terceiros.</p>
    `
  },
  "politica-de-privacidade": {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade & LGPD",
    seoTitle: "Política de Privacidade & LGPD · Moto na Prática",
    seoDescription: "Como tratamos seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (LGPD).",
    bodyHtml: `
      <h2>1. Conformidade com a LGPD</h2>
      <p>O portal <strong>Moto na Prática</strong> adota rigorosas medidas de segurança para garantir a privacidade e proteção dos dados pessoais de seus leitores, em plena consonância com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).</p>

      <h2>2. Coleta de Dados</h2>
      <p>Coletamos dados de navegação anonimizados para estatísticas de tráfego (via Google Analytics) e endereço de e-mail exclusivamente quando fornecido de forma voluntária para recebimento da newsletter ou publicação de comentários moderados.</p>

      <h2 id="exclusao-dados">3. Seus Direitos & Exclusão de Dados</h2>
      <p>O titular tem o direito de solicitar a qualquer tempo a confirmação da existência de tratamento, o acesso aos dados ou a exclusão definitiva do seu e-mail de nossas listas de newsletter. Para exercer seus direitos, basta entrar em contato através do e-mail <strong>Fale conosco via Página de Contato</strong>.</p>
    `
  }
};

