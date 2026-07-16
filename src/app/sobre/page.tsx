import { prisma } from "../../lib/db";
import { POSTS, TAG_COLORS, TEKO, BODY } from "../data";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { Clock, ArrowRight, Gauge, Calendar, MapPin, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ReactNode> = {
  Gauge: <Gauge size={22} />,
  Calendar: <Calendar size={22} />,
  MapPin: <MapPin size={22} />,
  Wrench: <Wrench size={22} />
};

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: "sobre" }
    });
    return {
      title: page?.seoTitle || "Sobre o Blog e Lucas · Moto na Prática",
      description: page?.seoDescription || "Lucas, piloto diário de BH e dono de uma Fazer 250 Solid Grey 2026, conta sua história na estrada sem filtros.",
    };
  } catch (e) {
    return {
      title: "Sobre o Blog · Moto na Prática",
      description: "Lucas, piloto diário de BH e dono de uma Fazer 250 Solid Grey 2026, conta sua história na estrada sem filtros."
    };
  }
}

export default async function Sobre() {
  let content: any = {
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
    bioContentHtml: `<p class="mb-4">Me chamo Lucas, tenho 29 anos e moro em Belo Horizonte. Comecei a andar de moto in 2019 com uma CG 150 de entrega emprestada do meu tio — a partir daí não parei mais.</p>
<p class="mb-4">Em janeiro de 2025 dei o salto para a Fazer 250 Solid Grey, a versão nova. Foi a maior compra que já fiz relacionada a moto e, com ela, veio a vontade de registrar tudo — as dúvidas, os erros, os descobertas.</p>
<p class="mb-4">O <span class="text-foreground font-semibold font-bold">Moto na Prática</span> nasceu disso. Não sou mecânico, não sou piloto profissional, não tenho patrocínio. Sou apenas alguém que usa moto todo dia e quer compartilhar o que aprende.</p>
<p class="mb-4">Aqui você vai encontrar reviews de coisas que comprei com o meu dinheiro, manutenções que fiz na garagem, rotas que percorri e dicas que aprendi na raça. Nada de conteúdo pago ou postagem encomendada.</p>`,
    bioQuote: "Se você está pensando em comprar uma moto, já tem uma ou só curte o assunto — esse blog é pra você.",
    riderImage: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format",
    riderFocalPoint: "center",
    motoTitle: "A moto do blog",
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
  };

  let recentPosts: any[] = [];

  try {
    const pageDb = await prisma.page.findUnique({
      where: { slug: "sobre" }
    });
    if (pageDb && pageDb.content) {
      content = pageDb.content;
    }

    recentPosts = await prisma.post.findMany({
      take: 3,
      orderBy: { date: "desc" }
    });
  } catch (error) {
    console.warn("Sobre database query failed, using static fallback.", error);
    recentPosts = POSTS.slice(0, 3);
  }

  return (
    <div>
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-border" style={{ height: "320px" }}>
        <img 
          src={content.heroImage} 
          alt={content.heroTitle} 
          className="w-full h-full object-cover object-center" 
          style={{ objectPosition: content.heroFocalPoint || "center" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.90) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-[720px] z-10">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-3">Sobre</span>
          <h1 style={TEKO} className="text-[60px] md:text-[76px] font-semibold uppercase leading-none tracking-wide text-white mb-4">
            O blog e<br />o motociclista
          </h1>
          <p className="text-[14px] text-[#AAAAAA] leading-relaxed">
            {content.heroDescription}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">
        
        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-16">
          {(content.stats || []).map((s: any, idx: number) => (
            <div key={idx} className="bg-card p-6 text-center flex flex-col items-center gap-2">
              <span className="text-primary">{iconMap[s.iconName] || <Wrench size={22} />}</span>
              <span style={TEKO} className="text-[30px] font-semibold uppercase leading-none text-foreground">{s.value}</span>
              <span className="text-[12px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* BIO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide">{content.bioTitle}</h2>
            </div>
            <div 
              className="space-y-5 text-[15px] text-muted-foreground leading-relaxed prose prose-invert" 
              style={BODY}
              dangerouslySetInnerHTML={{ __html: content.bioContentHtml }}
            />

            <div className="mt-8 p-5 bg-card border-l-2 border-primary">
              <p className="text-[15px] text-foreground italic leading-relaxed" style={BODY}>
                "{content.bioQuote}"
              </p>
            </div>
          </div>

          {/* Rider Photo */}
          <div className="relative">
            <div className="overflow-hidden" style={{ height: "420px" }}>
              <img 
                src={content.riderImage} 
                alt="Lucas na estrada" 
                className="w-full h-full object-cover" 
                style={{ objectPosition: content.riderFocalPoint || "center" }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 p-4 border-t border-border z-10">
              <p style={TEKO} className="text-[18px] font-semibold uppercase text-foreground">Lucas · BH</p>
              <p className="text-[12px] text-muted-foreground">Fazer 250 Solid Grey 2026</p>
            </div>
          </div>
        </div>

        {/* MOTO SPECS SECTION */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide">{content.motoTitle}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card border border-border overflow-hidden">
            <div className="overflow-hidden" style={{ height: "300px" }}>
              <img 
                src={content.motoImage} 
                alt={content.motoSpecsTitle} 
                className="w-full h-full object-cover" 
                style={{ objectPosition: content.motoFocalPoint || "center" }}
              />
            </div>
            <div className="p-8 flex flex-col justify-center" style={BODY}>
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">Minha moto</span>
              <h3 style={TEKO} className="text-[36px] font-semibold uppercase leading-none text-foreground mb-5">
                {content.motoSpecsTitle}
              </h3>
              <div className="space-y-3">
                {(content.motoSpecs || []).map((spec: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-[13px] text-muted-foreground uppercase tracking-wide">{spec.name}</span>
                    <span className="text-[13px] text-foreground font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT POSTS AT THE BOTTOM */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">Posts recentes</h2>
            </div>
            <Link href="/" className="text-[12px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentPosts.slice(0, 3).map((post) => (
              <article key={post.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Link href={`/post/${post.slug}`} className="flex flex-col flex-1">
                  <div className="relative overflow-hidden" style={{ height: "160px" }}>
                    <img 
                      src={post.img} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      style={{ objectPosition: post.imgFocalPoint || "center" }}
                    />
                    <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${TAG_COLORS[post.tag] || "bg-[#252525] text-white"}`}>
                      {post.tag}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {post.readTime}
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
