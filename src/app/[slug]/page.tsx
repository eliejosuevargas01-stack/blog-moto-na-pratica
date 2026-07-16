import { prisma } from "../../lib/db";
import { notFound } from "next/navigation";
import { TEKO, BODY } from "../data";

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
    if (!page || page.isStatic) return {};
    return {
      title: `${page.seoTitle || page.title} · Moto na Prática`,
      description: page.seoDescription || `Página sobre ${page.title} no blog Moto na Prática.`,
    };
  } catch (e) {
    return {};
  }
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

  // Se não existir ou se for uma página estática estruturada (Home, Sobre) gerenciada por outra rota, dar 404
  if (!page || page.isStatic) {
    return notFound();
  }

  const content = typeof page.content === "string" 
    ? JSON.parse(page.content) 
    : page.content;

  const bodyHtml = content?.bodyHtml || "";

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-16" style={BODY}>
      <h1 style={TEKO} className="text-[44px] md:text-[56px] font-semibold uppercase leading-none text-foreground border-b border-border pb-4 mb-8">
        {page.title}
      </h1>
      <div 
        className="prose prose-invert max-w-none text-muted-foreground text-[15px] leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </div>
  );
}
