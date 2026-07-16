import "../styles/index.css";
import { prisma } from "../lib/db";
import { POSTS, TEKO, BODY } from "./data";
import Header from "./components/Header";
import Link from "next/link";
import { ChevronRight, Instagram, Youtube, Facebook } from "lucide-react";
import { Teko as TekoFont, Barlow as BarlowFont } from "next/font/google";
import Script from "next/script";

const tekoFont = TekoFont({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});

const barlowFont = BarlowFont({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Moto na Prática",
  description: "Blog independente · experiência real na estrada",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Buscar páginas dinâmicas e posts recentes com tratamento de falhas para build seguro
  let customPages: { title: string; slug: string }[] = [];
  let recentPosts: { id: string; title: string; slug: string }[] = [];

  try {
    const pages = await prisma.page.findMany({
      where: { isStatic: false },
      select: { title: true, slug: true },
    });
    customPages = pages;

    const posts = await prisma.post.findMany({
      take: 3,
      orderBy: { date: "desc" },
      select: { id: true, title: true, slug: true },
    });
    recentPosts = posts;
  } catch (error) {
    console.warn("Database connection failed during SSR, using static fallbacks.", error);
    // Fallback para posts estáticos
    recentPosts = POSTS.slice(0, 3).map(p => ({
      id: String(p.id),
      title: p.title,
      slug: p.slug
    }));
  }

  // Links fixos padrão
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Reviews", path: "/reviews" },
    { label: "Manutenção", path: "/manutencao" },
    { label: "Rotas", path: "/rotas" },
    { label: "Equipamentos", path: "/equipamentos" },
    { label: "Sobre", path: "/sobre" },
  ];

  return (
    <html lang="pt-BR" className={`dark ${tekoFont.variable} ${barlowFont.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <meta name="google-site-verification" content="fbASypBsg3iwxoSLbdAaR_U4bHoizv_FGbwhS9FBmqQ" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col" style={BODY}>
        {/* Google Analytics */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-WS2JW3944T" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WS2JW3944T');
          `}
        </Script>
        {/* HEADER CLIENT SIDE COMPONENT */}
        <Header customPages={customPages} />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#0A0A0A] border-t border-border mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-1 h-7 bg-primary" />
                <span style={TEKO} className="text-[24px] font-semibold uppercase tracking-wide text-foreground">
                  MOTO<span className="text-primary">NA</span>PRÁTICA
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Blog independente sobre motos. Experiência real, sem filtro e sem patrocínio.
              </p>
              <div className="flex items-center gap-4 mt-5">
                <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={16} /></a>
                <a href="#" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors"><Youtube size={16} /></a>
                <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={16} /></a>
              </div>
            </div>
            
            <div>
              <h3 style={TEKO} className="text-[18px] font-semibold uppercase tracking-widest text-foreground mb-5">Seções</h3>
              <ul className="space-y-2.5">
                {navLinks.map(({ label, path }) => (
                  <li key={path}>
                    <Link href={path} className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                      <ChevronRight size={11} className="text-primary" /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={TEKO} className="text-[18px] font-semibold uppercase tracking-widest text-foreground mb-5">Posts recentes</h3>
              <ul className="space-y-4">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/post/${post.slug}`} className="group flex items-start gap-2 text-left">
                      <span className="block w-0.5 shrink-0 bg-border group-hover:bg-primary transition-colors mt-1" style={{ minHeight: "14px" }} />
                      <span className="text-[12px] text-muted-foreground group-hover:text-foreground leading-snug transition-colors">
                        {stripHtml(post.title)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-4 text-center text-[11px] text-muted-foreground tracking-widest uppercase">
            © 2025 Moto na Prática · Todos os direitos reservados
          </div>
        </footer>
      </body>
    </html>
  );
}
