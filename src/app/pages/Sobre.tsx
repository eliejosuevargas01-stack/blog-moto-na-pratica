import { useNavigate } from "react-router";
import { ArrowRight, MapPin, Calendar, Gauge, Wrench } from "lucide-react";
import { TEKO, BODY, POSTS, TAG_COLORS } from "../data";
import { Clock } from "lucide-react";

const MOTO_IMG = "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=700&fit=crop&auto=format";
const RIDER_IMG = "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format";
const ROAD_IMG = "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=500&fit=crop&auto=format";

const STATS = [
  { icon: <Gauge size={22} />, value: "8.400 km", label: "Rodados na FZ25" },
  { icon: <Calendar size={22} />, value: "Jan 2025", label: "Início com a moto" },
  { icon: <MapPin size={22} />, value: "Belo Horizonte", label: "Base de operações" },
  { icon: <Wrench size={22} />, value: "5", label: "Manutenções feitas em casa" },
];

export default function Sobre() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-border" style={{ height: "320px" }}>
        <img src={ROAD_IMG} alt="Na estrada" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.90) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.15) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-[720px]">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-3">Sobre</span>
          <h1 style={TEKO} className="text-[60px] md:text-[76px] font-semibold uppercase leading-none tracking-wide text-white mb-4">
            O blog e<br />o motociclista
          </h1>
          <p className="text-[14px] text-[#AAAAAA] leading-relaxed">
            Sem patrocínio, sem jabá. Só experiência real de quem usa moto todo dia.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">

        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card p-6 text-center flex flex-col items-center gap-2">
              <span className="text-primary">{s.icon}</span>
              <span style={TEKO} className="text-[30px] font-semibold uppercase leading-none text-foreground">{s.value}</span>
              <span className="text-[12px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* SOBRE MIM */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide">Quem escreve aqui</h2>
            </div>
            <div className="space-y-5 text-[15px] text-muted-foreground leading-relaxed" style={BODY}>
              <p>
                Me chamo Lucas, tenho 29 anos e moro em Belo Horizonte. Comecei a andar de moto em 2019 com uma CG 150 de entrega emprestada do meu tio — a partir daí não parei mais.
              </p>
              <p>
                Em janeiro de 2025 dei o salto para a Fazer 250 Solid Grey, a versão nova. Foi a maior compra que já fiz relacionada a moto e, com ela, veio a vontade de registrar tudo — as dúvidas, os erros, as descobertas.
              </p>
              <p>
                O <span className="text-foreground font-semibold">Moto na Prática</span> nasceu disso. Não sou mecânico, não sou piloto profissional, não tenho patrocínio. Sou apenas alguém que usa moto todo dia e quer compartilhar o que aprende.
              </p>
              <p>
                Aqui você vai encontrar reviews de coisas que comprei com o meu dinheiro, manutenções que fiz na garagem, rotas que percorri e dicas que aprendi na raça. Nada de conteúdo pago ou postagem encomendada.
              </p>
            </div>

            <div className="mt-8 p-5 bg-card border-l-2 border-primary">
              <p className="text-[15px] text-foreground italic leading-relaxed" style={BODY}>
                "Se você está pensando em comprar uma moto, já tem uma ou só curte o assunto — esse blog é pra você."
              </p>
            </div>
          </div>

          {/* Rider photo */}
          <div className="relative">
            <div className="overflow-hidden" style={{ height: "420px" }}>
              <img src={RIDER_IMG} alt="Motociclista na estrada" className="w-full h-full object-cover object-center" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#111111]/90 p-4 border-t border-border">
              <p style={TEKO} className="text-[18px] font-semibold uppercase text-foreground">Lucas · BH</p>
              <p className="text-[12px] text-muted-foreground">Fazer 250 Solid Grey 2026 · 8.400 km</p>
            </div>
          </div>
        </div>

        {/* A MOTO */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide">A moto do blog</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card border border-border overflow-hidden">
            <div className="overflow-hidden" style={{ height: "300px" }}>
              <img src={MOTO_IMG} alt="Fazer 250 Solid Grey 2026" className="w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col justify-center" style={BODY}>
              <span className="text-primary text-[11px] font-bold uppercase tracking-widest mb-2">Minha moto</span>
              <h3 style={TEKO} className="text-[36px] font-semibold uppercase leading-none text-foreground mb-5">
                Yamaha FZ25<br /><span className="text-primary">Solid Grey 2026</span>
              </h3>
              <div className="space-y-3">
                {[
                  ["Motor", "249cc, monocilíndrico, SOHC"],
                  ["Potência", "20,9 cv @ 8.000 rpm"],
                  ["Torque", "2,1 kgf.m @ 6.500 rpm"],
                  ["Tanque", "13 litros"],
                  ["Peso", "154 kg (abastecida)"],
                  ["Cor", "Solid Grey (exclusiva 2026)"],
                ].map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-[13px] text-muted-foreground uppercase tracking-wide">{key}</span>
                    <span className="text-[13px] text-foreground font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ÚLTIMOS POSTS */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="block w-1 h-7 bg-primary" />
              <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide">Posts recentes</h2>
            </div>
            <button onClick={() => navigate("/")} className="text-[12px] font-semibold text-muted-foreground hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {POSTS.slice(0, 3).map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/post/${post.slug}`)}
                className="group bg-card border border-border overflow-hidden cursor-pointer"
                style={{ transition: "transform .25s ease, box-shadow .25s ease" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(0,0,0,.40)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="relative overflow-hidden" style={{ height: "160px" }}>
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${TAG_COLORS[post.tag]}`}>{post.tag}</span>
                </div>
                <div className="p-4">
                  <h3 style={TEKO} className="text-[20px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">{post.title}</h3>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {post.readTime} · {post.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
