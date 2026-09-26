import { prisma } from "../../lib/db";
import { notFound, redirect } from "next/navigation";
import { TEKO, BODY, STATIC_INSTITUTIONAL_PAGES } from "../data";
import SafeHtml from "../components/SafeHtml";

export const dynamic = "force-dynamic";

interface DynamicPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = params;
  try {
    const page = await prisma.page.findUnique({
      where: { slug }
    });
    if (page && !page.isStatic) {
      return {
        title: `${page.seoTitle || page.title} · Moto na Prática`,
        description: page.seoDescription || `Página sobre ${page.title} no blog Moto na Prática.`,
      };
    }
  } catch (e) {}

  if (STATIC_INSTITUTIONAL_PAGES[slug]) {
    const staticPage = STATIC_INSTITUTIONAL_PAGES[slug];
    return {
      title: staticPage.seoTitle,
      description: staticPage.seoDescription,
    };
  }

  return {};
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = params;
  let page: any = null;

  try {
    page = await prisma.page.findUnique({
      where: { slug }
    });
  } catch (error) {
    console.error("Failed to query dynamic page", error);
  }

  // Se existir uma página customizada (não estática) no banco
  if (page && !page.isStatic) {
    const content = typeof page.content === "string" 
      ? JSON.parse(page.content) 
      : page.content;

    const bodyHtml = content?.bodyHtml || "";

    return (
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-16" style={BODY}>
        <h1 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase leading-none text-foreground border-b border-border pb-4 mb-8">
          {page.title}
        </h1>
        <SafeHtml html={bodyHtml} className="prose max-w-none text-foreground text-[15px] leading-relaxed space-y-6" />
      </div>
    );
  }

  // Fallback para páginas institucionais pré-definidas (E-E-A-T)
  if (STATIC_INSTITUTIONAL_PAGES[slug]) {
    const staticPage = STATIC_INSTITUTIONAL_PAGES[slug];
    const bodyHtml = staticPage.bodyHtml;

    return (
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-16" style={BODY}>
        <div className="mb-2">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest">Institucional · Moto na Prática</span>
        </div>
        <h1 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase leading-none text-foreground border-b border-border pb-4 mb-8">
          {staticPage.title}
        </h1>
        <SafeHtml html={bodyHtml} className="prose max-w-none text-foreground text-[15px] leading-relaxed space-y-6" />
      </div>
    );
  }

  // Se não for página customizada, checar se corresponde a um Post por slug ou ID e redirecionar
  let targetPost: any = null;
  try {
    const cleanId = slug.trim();
    const numericGroupId = /^\d+$/.test(cleanId) ? parseInt(cleanId, 10) : undefined;
    targetPost = await prisma.post.findFirst({
      where: {
        OR: [
          { slug: cleanId },
          { id: cleanId },
          ...(numericGroupId ? [{ translationGroupId: numericGroupId }] : [])
        ]
      }
    });
  } catch (e) {
    console.warn("Post lookup fallback in DynamicPage failed", e);
  }

  if (targetPost) {
    const postLang = targetPost.lang || "pt";
    const targetPrefix = postLang === "en" ? "/en/post" : postLang === "es" ? "/es/post" : "/post";
    redirect(`${targetPrefix}/${targetPost.slug}`);
  }

  return notFound();
}

