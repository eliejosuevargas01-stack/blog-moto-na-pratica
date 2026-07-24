import CategoryView from "../components/CategoryView";
import { prisma } from "../../lib/db";
import { cookies } from "next/headers";
import { getTranslation } from "../i18n/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  return {
    title: `${t.categories.reviewsTitle} · Moto na Prática`,
    description: t.categories.reviewsDesc,
  };
}

export default async function ReviewsPage() {
  const cookieStore = cookies();
  const currentLang = cookieStore.get("NEXT_LOCALE")?.value || "pt";
  const t = getTranslation(currentLang);

  const heroImg = "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=560&fit=crop&auto=format";
  const iconName = "Star";

  return (
    <CategoryView
      tag="Review"
      title={t.categories.reviewsTitle}
      description={t.categories.reviewsDesc}
      heroImg={heroImg}
      iconName={iconName}
    />
  );
}
