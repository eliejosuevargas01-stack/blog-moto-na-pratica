import "./globals.css";
import { prisma } from "../lib/db";
import { TEKO, BODY } from "./data";
import Header from "./components/Header";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Teko as TekoFont, Barlow as BarlowFont } from "next/font/google";
import GoogleAnalytics from "./components/GoogleAnalytics";
import SocialLinks from "./components/SocialLinks";
import { cookies } from "next/headers";
import { getTranslation } from "./i18n/translations";
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

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Moto na Prática",
  description: "Blog independente · experiência real na estrada",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  let customPages: { title: string; slug: string }[] = [];

  try {
    const pages = await prisma.page.findMany({
      where: { isStatic: false },
      select: { title: true, slug: true },
    });
    customPages = pages;
  } catch (error) {
    console.warn("Database connection failed during SSR, using static fallbacks.", error);
  }

  const newsMediaSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Moto na Prática",
    "alternateName": "Portal Moto na Prática",
    "url": "https://motonapratica.com.br",
    "logo": {
      "@type": "ImageObject",
      "url": "https://motonapratica.com.br/favicon.png",
      "width": 512,
      "height": 512
    },
    "description": "Portal informativo e jornalismo independente de motociclismo. Testes reais sem patrocínio velado, medição real de consumo na bomba, oficina prática e cobertura esportiva com compromisso E-E-A-T.",
    "foundingDate": "2026-01-01",
    "founder": {
      "@type": "Person",
      "name": "Eliezer"
    },
    "ethicsPolicy": "https://motonapratica.com.br/politica-editorial",
    "publishingPrinciples": "https://motonapratica.com.br/politica-editorial",
    "correctionsPolicy": "https://motonapratica.com.br/politica-editorial#correcoes",
    "diversityPolicy": "https://motonapratica.com.br/politica-editorial#diversidade",
    "verificationFactCheckingPolicy": "https://motonapratica.com.br/politica-editorial#checagem",
    "sameAs": [
      "https://instagram.com/motonapratica",
      "https://youtube.com/@motonapratica"
    ]
  };

  return (
    <html lang={currentLang} suppressHydrationWarning className={`${tekoFont.variable} ${barlowFont.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="fbASypBsg3iwxoSLbdAaR_U4bHoizv_FGbwhS9FBmqQ" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsMediaSchema) }}
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8759260479603327"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <GoogleAnalytics gaId="G-WS2JW3944T" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground flex flex-col" style={BODY}>
        <Header customPages={customPages} />

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-card border-t border-border mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Coluna 1 (Identidade & Manifesto) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="block w-1 h-7 bg-primary" />
                <span style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
                  MOTO<span className="text-primary">NA</span>PRÁTICA
                </span>
              </div>
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Jornalismo Independente
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
                Portal de jornalismo independente especializado no universo das duas rodas. Análises técnicas rigorosas, testes reais sem patrocínio velado, manutenção na oficina e cobertura esportiva com credibilidade, transparência e respeito inegociável ao motociclista.
              </p>
              <div className="mt-auto">
                <SocialLinks iconSize={16} />
              </div>
            </div>

            {/* Coluna 2 (Editorias de Notícias & Testes) */}
            <div>
              <h3 style={TEKO} className="text-[19px] font-semibold uppercase tracking-widest text-foreground mb-4">
                Editorias & Testes
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/posts?tag=Lançamentos" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Lançamentos
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Testes & Avaliações
                  </Link>
                </li>
                <li>
                  <Link href="/eventos" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> MotoGP & Motorsport
                  </Link>
                </li>
                <li>
                  <Link href="/manutencao" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Oficina & Manutenção
                  </Link>
                </li>
                <li>
                  <Link href="/rotas" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Rotas & Viagens
                  </Link>
                </li>
                <li>
                  <Link href="/equipamentos" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Equipamentos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3 (Institucional & E-E-A-T) */}
            <div>
              <h3 style={TEKO} className="text-[19px] font-semibold uppercase tracking-widest text-foreground mb-4">
                Institucional & E-E-A-T
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/sobre" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Quem Somos
                  </Link>
                </li>
                <li>
                  <Link href="/politica-editorial" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Política Editorial
                  </Link>
                </li>
                <li>
                  <Link href="/equipe" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Equipe Editorial
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Fale com a Redação
                  </Link>
                </li>
                <li>
                  <Link href="/anuncie" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Mídia Kit / Anuncie
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 4 (Transparência & Legal) */}
            <div>
              <h3 style={TEKO} className="text-[19px] font-semibold uppercase tracking-widest text-foreground mb-4">
                Transparência & Legal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/termos-de-uso" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-privacidade" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Política de Privacidade & LGPD
                  </Link>
                </li>
                <li>
                  <Link href="/politica-editorial#metodologia" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Metodologia de Testes
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-privacidade#exclusao-dados" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={11} className="text-primary shrink-0" /> Exclusão de Dados
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border py-5 px-4 text-center text-[11.5px] text-muted-foreground tracking-wider uppercase">
            © 2026 Moto na Prática · Portal Informativo e Jornalismo Independente de Motociclismo · {t.footer.rights}
          </div>
        </footer>
      </body>
    </html>
  );
}
