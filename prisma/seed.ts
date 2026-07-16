import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POSTS_DATA = [
  {
    slug: "fazer-250-solid-grey-2026-6-meses",
    tag: "Review",
    category: "Reviews",
    title: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    excerpt: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    date: new Date("2025-06-12"),
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

Sim. Para quem quer uma naked polivalente — cidade, estrada, curvas — sem gastar R$ 35 mil, a FZ25 Solid Grey é a escolha mais honesta do mercado em 2026.`
  },
  {
    slug: "troca-oleo-fz25-passo-a-passo",
    tag: "Manutenção",
    category: "Manutenção",
    title: "Troca de óleo na FZ25: passo a passo sem enrolação",
    excerpt: "Óleos recomendados, torque do dreno e dicas pra não sujar a escapamento. Custo total: R$ 87.",
    date: new Date("2025-05-28"),
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

Coloque um pano enrolado na escapamento antes de começar. O óleo que escorre pela lateral inevitavelmente chega lá e queima — cheiro horrível por dias.`
  },
  {
    slug: "serra-da-canastra-de-moto",
    tag: "Rotas",
    category: "Rotas",
    title: "Serra da Canastra de moto: a rota que todo piloto tem que fazer",
    excerpt: "Saí de BH num sábado às 6h. Estradas perfeitas, frio na cara e 620 km de pura satisfação.",
    date: new Date("2025-05-15"),
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

Totalmente. Moto leve, consumo baixo, bagageiro traseiro comporta uma mochila de 30 litros tranquilo.`
  },
  {
    slug: "hjc-rpha-11-pro-review-1-ano",
    tag: "Equipamentos",
    category: "Equipamentos",
    title: "HJC RPHA 11 Pro depois de 1 ano: vale os R$ 1.400?",
    excerpt: "Review honesto sem jabá. Ventilação, peso, visibilidade e o que mudou depois de muita chuva.",
    date: new Date("2025-05-03"),
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

Se você roda mais de 5.000 km por ano, sim. Se você usa moto só no fim de semana, um capacete de R$ 600 cumpre o mesmo papel.`
  },
  {
    slug: "michelin-pilot-street-2-fazer",
    tag: "Review",
    category: "Reviews",
    title: "Michelin Pilot Street 2 na Fazer: diferença real ou papo de vendedor?",
    excerpt: "Troquei os originais com 12.000 km. A diferença em frenagem na chuva foi imediata.",
    date: new Date("2025-04-20"),
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

Sim, especialmente se você roda em cidades com asfalto irregular e muita chuva. A segurança adicional na molhado já justifica o custo.`
  },
  {
    slug: "kit-relampago-manutencao-preventiva",
    tag: "Manutenção",
    category: "Manutenção",
    title: "Kit relâmpago: manutenção preventiva de 30 minutos todo mês",
    excerpt: "O que verificar, apertar e lubrificar antes que vire problema. Salvou minha corrente duas vezes.",
    date: new Date("2025-04-08"),
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

Farol, lanterna, setas e freio. Verificação rápida que salva de multa e acidente.`
  }
];

function parseContentToBlocks(content: string): any[] {
  const paragraphs = content.split("\n\n").filter(Boolean);
  const blocks: any[] = [];
  
  // Converter markdown simples para tags HTML puras (sem classes em linha)
  const htmlParagraphs = paragraphs.map((p) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      const clean = p.replace(/\*\*/g, "");
      return `<h2>${clean}</h2>`;
    }
    
    // Listagem simples
    if (p.includes("\n- ") || p.startsWith("- ")) {
      const items = p.split(/\n?- /).filter(Boolean);
      const listItems = items.map(item => `<li>${item.trim()}</li>`).join("");
      return `<ul>${listItems}</ul>`;
    }

    if (p.match(/^\d+\./)) {
      const items = p.split(/\n?\d+\.\s+/).filter(Boolean);
      const listItems = items.map(item => `<li>${item.trim()}</li>`).join("");
      return `<ol>${listItems}</ol>`;
    }

    // Negrito inline
    const boldFormatted = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `<p>${boldFormatted}</p>`;
  });

  // Dividir igualmente os parágrafos em 3 blocos
  const total = htmlParagraphs.length;
  const size = Math.ceil(total / 3);
  
  for (let i = 0; i < 3; i++) {
    const chunk = htmlParagraphs.slice(i * size, (i + 1) * size);
    blocks.push({
      text: chunk.join("\n"),
      image: "",
      focalPoint: "center"
    });
  }

  return blocks;
}

async function main() {
  console.log("Iniciando semeadura do banco de dados...");

  // 1. Limpar banco existente
  await prisma.post.deleteMany({});
  await prisma.page.deleteMany({});

  // 2. Semear Posts
  for (const post of POSTS_DATA) {
    const blocks = parseContentToBlocks(post.content);
    await prisma.post.create({
      data: {
        slug: post.slug,
        tag: post.tag,
        category: post.category,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        readTime: post.readTime,
        img: post.img,
        imgFocalPoint: "center",
        blocks: blocks,
        seoTitle: post.title,
        seoDescription: post.excerpt,
        seoKeywords: `${post.tag}, Fazer250, Moto, BH`
      }
    });
    console.log(`Post semeado: ${post.title}`);
  }

  // 3. Semear Página Home
  await prisma.page.create({
    data: {
      slug: "home",
      title: "Página Inicial",
      isStatic: true,
      content: {
        heroTitle: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
        heroSubtitle: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
        heroImage: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format",
        heroFocalPoint: "center",
        breakingText: "Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?",
        breakingSlug: "michelin-pilot-street-2-fazer",
        bannerTitle: "Yamaha FZ25 · Solid Grey 2026",
        bannerSubtitle: "8.400 km rodados · Motor 249cc · Minha companheira diária",
        bannerImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1400&h=500&fit=crop&auto=format",
        bannerFocalPoint: "center"
      },
      seoTitle: "Moto na Prática - Blog de Motos, Dicas e Reviews",
      seoDescription: "Blog de motociclista sobre a Yamaha Fazer 250 Solid Grey 2026. Reviews honestas de equipamentos, dicas de manutenção e relatos de rotas reais."
    }
  });
  console.log("Página Home semeada.");

  // 4. Semear Página Sobre
  await prisma.page.create({
    data: {
      slug: "sobre",
      title: "Sobre o Blog",
      isStatic: true,
      content: {
        heroTitle: "O blog e o motociclista",
        heroDescription: "Sem patrocínio, sem jabá. Só experiência real de quem usa moto todo dia.",
        heroImage: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=500&fit=crop&auto=format",
        heroFocalPoint: "center",
        stats: [
          { value: "8.400 km", label: "Rodados na FZ25", iconName: "Gauge" },
          { value: "Jan 2025", label: "Início com a moto", iconName: "Calendar" },
          { value: "Belo Horizonte", label: "Base de operações", iconName: "MapPin" },
          { value: "5", label: "Manutenções feitas em casa", iconName: "Wrench" }
        ],
        bioTitle: "Quem escreve aqui",
        bioContentHtml: `<p class="mb-4">Me chamo Lucas, tenho 29 anos e moro em Belo Horizonte. Comecei a andar de moto em 2019 com uma CG 150 de entrega emprestada do meu tio — a partir daí não parei mais.</p>
<p class="mb-4">Em janeiro de 2025 dei o salto para a Fazer 250 Solid Grey, a versão nova. Foi a maior compra que já fiz relacionada a moto e, com ela, veio a vontade de registrar tudo — as dúvidas, os erros, as descobertas.</p>
<p class="mb-4">O <span class="text-foreground font-semibold">Moto na Prática</span> nasceu disso. Não sou mecânico, não sou piloto profissional, não tenho patrocínio. Sou apenas alguém que usa moto todo dia e quer compartilhar o que aprende.</p>
<p class="mb-4">Aqui você vai encontrar reviews de coisas que comprei com o meu dinheiro, manutenções que fiz na garagem, rotas que percorri e dicas que aprendi na raça. Nada de conteúdo pago ou postagem encomendada.</p>`,
        bioQuote: "Se você está pensando em comprar uma moto, já tem uma ou só curte o assunto — esse blog é pra você.",
        riderImage: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format",
        riderFocalPoint: "center",
        motoTitle: "Minha moto",
        motoSpecsTitle: "Yamaha FZ25 Solid Grey 2026",
        motoImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=700&fit=crop&auto=format",
        motoFocalPoint: "center",
        motoSpecs: [
          { name: "Motor", value: "249cc, monocilíndrico, SOHC" },
          { name: "Potência", value: "20,9 cv @ 8.000 rpm" },
          { name: "Torque", value: "2,1 kgf.m @ 6.500 rpm" },
          { name: "Tanque", value: "13 litros" },
          { name: "Peso", value: "154 kg (abastecida)" },
          { name: "Cor", value: "Solid Grey (exclusiva 2026)" }
        ]
      },
      seoTitle: "Sobre o Lucas e a Fazer 250 - Moto na Prática",
      seoDescription: "Conheça o Lucas, criador do Moto na Prática, e veja a ficha técnica detalhada da Yamaha FZ25 Solid Grey 2026 do blog."
    }
  });
  console.log("Página Sobre semeada.");

  // 5. Semear Páginas de Categoria
  const CATEGORIES_SEEDS = [
    {
      slug: "reviews",
      title: "Reviews",
      content: {
        description: "Reviews honestos de peças, acessórios e motos feitos por quem usa no dia a dia, sem patrocínio.",
        heroImg: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1200&h=680&fit=crop&auto=format",
        iconName: "Star"
      },
      seoTitle: "Reviews de Motos e Equipamentos - Moto na Prática",
      seoDescription: "Opiniões sinceras e testes reais de longa duração com motos, pneus, peças e vestuário motociclístico."
    },
    {
      slug: "manutencao",
      title: "Manutenção",
      content: {
        description: "Dicas passo a passo de manutenção preventiva, troca de componentes e cuidados essenciais com a moto.",
        heroImg: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1200&h=680&fit=crop&auto=format",
        iconName: "Wrench"
      },
      seoTitle: "Dicas de Manutenção de Motocicleta - Moto na Prática",
      seoDescription: "Guia completo de como cuidar e fazer a manutenção preventiva na sua moto em casa e gastando pouco."
    },
    {
      slug: "rotas",
      title: "Rotas",
      content: {
        description: "Relatos de viagens, rotas para motociclistas, condições de estrada e pontos turísticos imperdíveis.",
        heroImg: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1200&h=680&fit=crop&auto=format",
        iconName: "Navigation"
      },
      seoTitle: "Rotas de Moto e Viagens - Moto na Prática",
      seoDescription: "As melhores estradas para rodar de moto, roteiros turísticos, motoviagem e relatos de rotas pelo Brasil."
    },
    {
      slug: "equipamentos",
      title: "Equipamentos",
      content: {
        description: "Avaliações detalhadas de jaquetas, capacetes, luvas e tudo que você precisa para rodar com segurança.",
        heroImg: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1200&h=680&fit=crop&auto=format",
        iconName: "ShieldCheck"
      },
      seoTitle: "Equipamentos de Segurança para Motociclista - Moto na Prática",
      seoDescription: "Reviews sinceros de capacetes, jaquetas, luvas, botas e proteção para o piloto no dia a dia ou viagens."
    }
  ];

  for (const catPage of CATEGORIES_SEEDS) {
    await prisma.page.create({
      data: {
        slug: catPage.slug,
        title: catPage.title,
        isStatic: true,
        content: catPage.content,
        seoTitle: catPage.seoTitle,
        seoDescription: catPage.seoDescription
      }
    });
    console.log(`Página de Categoria semeada: ${catPage.title}`);
  }

  console.log("Semeadura concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante semeadura:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
