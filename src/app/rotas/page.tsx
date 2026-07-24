import CategoryView from "../components/CategoryView";
import { cookies } from "next/headers";
import { getTranslation } from "../i18n/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  return {
    title: `${t.categories.routesTitle} · Moto na Prática`,
    description: t.categories.routesDesc,
  };
}

export default async function RotasPage() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  const heroImg = "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1400&h=560&fit=crop&auto=format";
  const iconName = "Navigation";

  return (
    <CategoryView
      tag="Rotas"
      title={t.categories.routesTitle}
      description={t.categories.routesDesc}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
