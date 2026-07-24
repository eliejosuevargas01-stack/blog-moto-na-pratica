import CategoryView from "../components/CategoryView";
import { cookies } from "next/headers";
import { getTranslation } from "../i18n/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  return {
    title: `${t.categories.gearTitle} · Moto na Prática`,
    description: t.categories.gearDesc,
  };
}

export default async function EquipamentosPage() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  const heroImg = "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=560&fit=crop&auto=format";
  const iconName = "ShieldCheck";

  return (
    <CategoryView
      tag="Equipamentos"
      title={t.categories.gearTitle}
      description={t.categories.gearDesc}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
