import { prisma } from "../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY, optimizeImageUrl } from "../data";
import SafeHtml from "../components/SafeHtml";
import SocialLinks from "../components/SocialLinks";
import Link from "next/link";
import { 
  Clock, 
  ArrowRight, 
  Gauge, 
  Calendar, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  Fuel, 
  FileText, 
  Users, 
  Mail, 
  Sparkles,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ReactNode> = {
  Gauge: <Gauge size={22} />,
  Calendar: <Calendar size={22} />,
  MapPin: <MapPin size={22} />,
  Wrench: <Wrench size={22} />,
  ShieldCheck: <ShieldCheck size={22} />,
  Fuel: <Fuel size={22} />
};

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "sobre" }
    });
    return {
      title: page?.seoTitle || "Quem Somos · Jornalismo Independente & E-E-A-T · Moto na Prática",
      description: page?.seoDescription || "Moto na Prática: portal informativo e jornalismo independente de motociclismo. Testes reais, oficina prática, rotas e cobertura esportiva.",
    };
  } catch (e) {
    return {
      title: "Quem Somos · Jornalismo Independente & E-E-A-T · Moto na Prática",
      description: "Moto na Prática: portal informativo e jornalismo independente de motociclismo. Testes reais, oficina prática, rotas e cobertura esportiva."
    };
  }
}

export default async function Sobre() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";

  const langFilter = {
    OR: [
      { lang: currentLang },
      ...(currentLang === "pt" ? [{ lang: null }] : []),
    ],
  };

  let content: any = {
    heroTitle: "Moto na Prática · Portal Informativo e Jornalismo Independente de Motociclismo",
    heroSubtitle: "PORTAL INFORMATIVO · E-E-A-T & JORNALISMO INDEPENDENTE",
    heroDescription: "Nascido da vivência real diária sobre duas rodas com o fundador Eliezer e consolidado como portal de referência técnica, testes sem patrocínio velado, medição real de consumo na bomba e cobertura do motociclismo nacional e mundial.",
    heroImage: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=600&fit=crop&auto=format",
    heroFocalPoint: "center",
    stats: [
      { value: "100% INDEPENDENTE", label: "Testes sem patrocínio velado", iconName: "ShieldCheck" },
      { value: "CONSUMO NA BOMBA", label: "Medição real tanque a tanque", iconName: "Fuel" },
      { value: "+8.400 KM", label: "Teste FZ25 Longa Duração", iconName: "Gauge" },
      { value: "RIGOR E-E-A-T", label: "Jornalismo & Oficina Prática", iconName: "Wrench" }
    ],
    bioTitle: "Manifesto & História: Da Prática Real ao Portal Informativo",
    bioContentHtml: `<p class="mb-4 text-[15px] leading-relaxed text-muted-foreground">O <strong>Moto na Prática</strong> nasceu da vivência real diária sobre duas rodas. Em janeiro de 2026, o fundador <strong>Eliezer</strong> iniciou o projeto a partir de sua rotina de deslocamento no Vale do Itajaí (Gaspar e litoral de Santa Catarina) a bordo da sua <strong>Yamaha Fazer 250 (FZ25) Solid Grey 2026</strong> recém-adquirida.</p>
<p class="mb-4 text-[15px] leading-relaxed text-muted-foreground">A motivação surgiu diante de uma lacuna evidente na imprensa especializada: o excesso de testes encomendados, avaliações superficiais de um dia e números de consumo replicados de painéis digitais ou manuais das montadoras. Faltava a perspectiva de quem usa moto todo santo dia, enfrenta trânsito pesado, sol e chuva torrencial, faz manutenção na garagem e banca o próprio combustível.</p>
<p class="mb-4 text-[15px] leading-relaxed text-muted-foreground">A receptividade dos motociclistas impulsionou a evolução do relato pessoal para um <strong>Portal Informativo e Jornalístico Estruturado</strong>. Hoje, o Moto na Prática reúne cobertura ágil de lançamentos do mercado brasileiro e internacional, guias de manutenção mecânica preventiva, avaliações honestas de equipamentos, rotas de mototurismo testadas em detalhes e a cobertura de grandes competições como MotoGP e Superbike mundial.</p>
<p class="mb-4 text-[15px] leading-relaxed text-muted-foreground">Mesmo com a expansão da equipe e da abrangência editorial, o princípio fundacional permanece inegociável: <strong>toda análise reflete a prática real do asfalto</strong>, com compromisso ético e respeito absoluto ao leitor.</p>`,
    bioQuote: "Nosso compromisso é com o motociclista na ponta da linha: se a moto tem falhas mecânicas, acabamento frágil ou consumo fora do anunciado, apontamos com clareza. Não vendemos notas, não fazemos publicidade disfarçada de teste.",
    riderImage: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format",
    riderFocalPoint: "center",
    motoTitle: "Coluna Teste de Longa Duração",
    motoSpecsTitle: "Yamaha Fazer 250 (FZ25) Solid Grey 2026",
    motoSubtitle: "Projeto Piloto Oficial de Teste de Longa Quilometragem da Redação",
    motoDescription: "A Fazer 250 Solid Grey 2026 é o nosso projeto piloto e laboratório contínuo sobre duas rodas. Comprada com recursos próprios da redação — sem empréstimo ou comodato de fabricante —, ela é monitorada quilômetro a quilômetro em condições severas de tráfego urbano, rodovias de serra e viagens com carga, servindo de parâmetro para desgaste de pneus, folga de válvulas e custo real por quilômetro rodado.",
    motoImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=700&fit=crop&auto=format",
    motoFocalPoint: "center",
    motoSpecs: [
      { name: "Motor", value: "249 cm³, monocilíndrico, 2V, SOHC, Arrefecimento com radiador de óleo" },
      { name: "Potência Dinamometrada", value: "20,9 cv @ 8.000 rpm (gasolina/etanol)" },
      { name: "Torque Máximo", value: "2,1 kgf.m @ 6.500 rpm" },
      { name: "Tanque / Reserva", value: "13,0 litros (reserva de 3,0 litros)" },
      { name: "Consumo Médio Aferido", value: "Cidade: 28,4 km/l · Estrada: 33,2 km/l (na bomba)" },
      { name: "Quilometragem Acumulada", value: "+8.420 km sob teste contínuo da redação" },
      { name: "Pneumáticos em Avaliação", value: "Michelin Pilot Street 2 (100/80-17 D e 140/70-17 T)" },
      { name: "Manutenções Realizadas", value: "Trocas de óleo a cada 2.500 km, revisão de balança e pastilhas" }
    ]
  };

  let recentPosts: any[] = [];

  try {
    const pageDb = await prisma.page.findUnique({
      where: { slug: "sobre" }
    });
    if (pageDb && pageDb.content) {
      const parsedContent = typeof pageDb.content === "string" ? JSON.parse(pageDb.content) : pageDb.content;
      content = { ...content, ...parsedContent };
    }

    recentPosts = await prisma.post.findMany({
      where: langFilter,
      take: 3,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.warn("Sobre database query failed, using static fallback.", error);
    recentPosts = POSTS.slice(0, 3);
  }

  const pilares = [
    {
      title: "Testes Sem Patrocínio Velado",
      desc: "Nossas avaliações de motocicletas e equipamentos são 100% independentes. Não aceitamos roteiros pré-aprovados por assessorias ou contratos que imponham elogios a produtos.",
      icon: <ShieldCheck size={28} className="text-primary shrink-0" />
    },
    {
      title: "Consumo Real Aferido na Bomba",
      desc: "Não confiamos apenas no computador de bordo. Medimos o consumo real de combustível abastecendo até o bocal na mesma posição, aferindo a média real em rotas urbanas e rodovias.",
      icon: <Fuel size={28} className="text-primary shrink-0" />
    },
    {
      title: "Rigor Mecânico & Oficina Prática",
      desc: "Desmontamos, medimos desgaste e realizamos manutenções preventivas com dados técnicos de torque, custos de peças e ferramentas adequadas para orientar o leitor com exatidão.",
      icon: <Wrench size={28} className="text-primary shrink-0" />
    },
    {
      title: "Transparência & Respeito ao Leitor",
      desc: "Padrão E-E-A-T em todas as publicações: autoria identificada, erratas públicas imediatas, separação visual rigorosa de publicidade e conformidade com a LGPD.",
      icon: <CheckCircle2 size={28} className="text-primary shrink-0" />
    }
  ];

  return (
    <div>
      {/* HERO INSTITUCIONAL */}
      <div className="relative overflow-hidden border-b border-border" style={{ minHeight: "360px" }}>
        <img 
          src={optimizeImageUrl(content.heroImage, 1400)} 
          alt={content.heroTitle} 
          className="w-full h-full object-cover object-center absolute inset-0" 
          style={{ objectPosition: content.heroFocalPoint || "center" }}
          fetchPriority="high"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.92) 0%, rgba(0,0,0,.70) 55%, rgba(0,0,0,.35) 100%)" }} />
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-16 flex flex-col justify-center min-h-[360px] z-10">
          <div className="max-w-[780px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
              <span>{content.heroSubtitle}</span>
            </div>
            <h1 style={TEKO} className="text-[44px] sm:text-[60px] md:text-[72px] font-semibold uppercase leading-none tracking-wide text-white mb-4">
              {content.heroTitle}
            </h1>
            <p className="text-[14.5px] sm:text-[16px] text-gray-200 leading-relaxed max-w-[700px]">
              {content.heroDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">
        
        {/* STATS BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mb-16 shadow-sm">
          {(content.stats || []).map((s: any, idx: number) => (
            <div key={idx} className="bg-card p-6 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-primary">{iconMap[s.iconName] || <Wrench size={22} />}</span>
              <span style={TEKO} className="text-[26px] sm:text-[30px] font-semibold uppercase leading-none text-foreground">{s.value}</span>
              <span className="text-[11.5px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* MANIFESTO E HISTÓRIA */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-1.5 h-8 bg-primary" />
              <h2 style={TEKO} className="text-[34px] md:text-[40px] font-semibold uppercase tracking-wide text-foreground">
                {content.bioTitle}
              </h2>
            </div>
            
            <SafeHtml html={content.bioContentHtml} />

            <div className="mt-8 p-6 bg-card border-l-4 border-primary rounded-r shadow-sm">
              <p className="text-[15.5px] text-foreground font-medium italic leading-relaxed" style={BODY}>
                "{content.bioQuote}"
              </p>
              <div className="mt-3 text-[12px] font-bold uppercase tracking-wider text-primary">
                — Compromisso Editorial Moto na Prática
              </div>
            </div>
          </div>

          {/* FUNDADOR & BASE DE OPERAÇÕES */}
          <div className="flex flex-col">
            <div className="bg-card border border-border overflow-hidden rounded shadow-sm">
              <div className="relative overflow-hidden" style={{ height: "360px" }}>
                <img 
                  src={optimizeImageUrl(content.riderImage, 600)} 
                  alt="Eliezer - Fundador do Moto na Prática" 
                  className="w-full h-full object-cover" 
                  style={{ objectPosition: content.riderFocalPoint || "center" }}
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Fundador & Redação</span>
                </div>
              </div>
              <div className="p-5 border-t border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground leading-none">
                    Eliezer
                  </h3>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Editor-Chefe</span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Piloto de testes com base de operações em Gaspar - SC. Conduz os ensaios de longa quilometragem e o teste de consumo tanque a tanque da FZ25.
                </p>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                    <MapPin size={13} className="text-primary" /> Gaspar · SC
                  </span>
                  <SocialLinks iconSize={15} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PILARES EDITORIAIS (E-E-A-T) */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1.5 h-8 bg-primary" />
            <div>
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest block">Governança Jornalística</span>
              <h2 style={TEKO} className="text-[34px] md:text-[40px] font-semibold uppercase tracking-wide text-foreground">
                Nossos Pilares Editoriais (E-E-A-T)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pilares.map((p, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded shadow-sm hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded border border-primary/20 shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <h3 style={TEKO} className="text-[22px] font-semibold uppercase tracking-wide text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA TESTE DE LONGA DURAÇÃO */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1.5 h-8 bg-primary" />
            <div>
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest block">Frota da Redação</span>
              <h2 style={TEKO} className="text-[34px] md:text-[40px] font-semibold uppercase tracking-wide text-foreground">
                {content.motoTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-card border border-border overflow-hidden rounded shadow-sm">
            <div className="relative min-h-[340px] lg:min-h-full">
              <img 
                src={optimizeImageUrl(content.motoImage, 900)} 
                alt={content.motoSpecsTitle} 
                className="w-full h-full object-cover absolute inset-0" 
                style={{ objectPosition: content.motoFocalPoint || "center" }}
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded border border-white/10">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Teste Contínuo em Andamento
                </span>
              </div>
            </div>

            <div className="p-8 flex flex-col justify-center" style={BODY}>
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-1">
                {content.motoSubtitle}
              </span>
              <h3 style={TEKO} className="text-[32px] sm:text-[38px] font-semibold uppercase leading-tight text-foreground mb-3">
                {content.motoSpecsTitle}
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-6">
                {content.motoDescription}
              </p>

              <div className="space-y-2.5">
                {(content.motoSpecs || []).map((spec: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-2 gap-0.5">
                    <span className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">{spec.name}</span>
                    <span className="text-[13px] text-foreground font-medium text-left sm:text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO INSTITUCIONAL DIRETA */}
        <div className="mb-20 bg-card border border-border p-8 rounded">
          <div className="max-w-[700px] mb-6">
            <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-1">Transparência & Canais Oficiais</span>
            <h2 style={TEKO} className="text-[28px] sm:text-[32px] font-semibold uppercase text-foreground">
              Conheça a Governança e Diretrizes do Portal
            </h2>
            <p className="text-[13.5px] text-muted-foreground">
              Acesse os documentos institucionais, fale com os jornalistas e saiba como mantemos nosso padrão de independência.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/politica-editorial" 
              className="p-4 bg-card border border-border rounded hover:border-primary hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <FileText size={20} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-[14px] text-foreground mb-1">Política Editorial</h3>
                <p className="text-[12px] text-muted-foreground">Diretrizes éticas, independência e política de correções.</p>
              </div>
              <span className="mt-3 text-[11px] font-bold uppercase text-primary flex items-center gap-1">
                Acessar <ArrowRight size={11} />
              </span>
            </Link>

            <Link 
              href="/equipe" 
              className="p-4 bg-card border border-border rounded hover:border-primary hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <Users size={20} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-[14px] text-foreground mb-1">Equipe da Redação</h3>
                <p className="text-[12px] text-muted-foreground">Conheça os repórteres, pilotos de teste e mecânicos.</p>
              </div>
              <span className="mt-3 text-[11px] font-bold uppercase text-primary flex items-center gap-1">
                Conhecer equipe <ArrowRight size={11} />
              </span>
            </Link>

            <Link 
              href="/contato" 
              className="p-4 bg-card border border-border rounded hover:border-primary hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <Mail size={20} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-[14px] text-foreground mb-1">Fale com a Redação</h3>
                <p className="text-[12px] text-muted-foreground">Sugestões de pautas, dúvidas técnicas e ouvidoria.</p>
              </div>
              <span className="mt-3 text-[11px] font-bold uppercase text-primary flex items-center gap-1">
                Enviar mensagem <ArrowRight size={11} />
              </span>
            </Link>

            <Link 
              href="/anuncie" 
              className="p-4 bg-card border border-border rounded hover:border-primary hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <Sparkles size={20} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-[14px] text-foreground mb-1">Anuncie no Portal</h3>
                <p className="text-[12px] text-muted-foreground">Oportunidades de mídia kit e formatos comerciais.</p>
              </div>
              <span className="mt-3 text-[11px] font-bold uppercase text-primary flex items-center gap-1">
                Mídia Kit <ArrowRight size={11} />
              </span>
            </Link>
          </div>
        </div>

        {/* POSTS RECENTES */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="block w-1.5 h-8 bg-primary" />
              <h2 style={TEKO} className="text-[30px] font-semibold uppercase tracking-wide text-foreground">
                Últimas Publicações da Redação
              </h2>
            </div>
            <Link href="/" className="text-[12px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((post) => (
              <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded">
                <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                  <div className="relative overflow-hidden" style={{ height: "170px" }}>
                    <img 
                      src={optimizeImageUrl(post.img, 450, 260)} 
                      alt={post.title.replace(/<[^>]*>/g, "")} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      style={{ objectPosition: post.imgFocalPoint || "center" }}
                      loading="lazy"
                    />
                    <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${TAG_COLORS[post.tag] || "bg-[#252525] text-white"}`}>
                      {post.tag}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <SafeHtml tag="h3" style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-2 group-hover:text-primary transition-colors" html={post.title} />
                    <span className="text-[11.5px] text-muted-foreground flex items-center gap-1">
                      <Clock size={11} className="text-primary" /> {post.readTime}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
