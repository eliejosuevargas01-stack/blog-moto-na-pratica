import CategoryView from "../components/CategoryView";
import { cookies } from "next/headers";
import { getTranslation } from "../i18n/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  return {
    title: `${t.categories.maintenanceTitle} · Moto na Prática`,
    description: t.categories.maintenanceDesc,
  };
}

export default async function ManutencaoPage() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  const heroImg = "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1400&h=560&fit=crop&auto=format";
  const iconName = "Wrench";

  return (
    <CategoryView
      tag="Manutenção"
      title={t.categories.maintenanceTitle}
      description={t.categories.maintenanceDesc}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
