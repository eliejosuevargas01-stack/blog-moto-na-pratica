import { Star } from "lucide-react";
import CategoryPage from "./CategoryPage";

const IMG = "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=560&fit=crop&auto=format";

export default function Reviews() {
  return (
    <CategoryPage
      tag="Review"
      title="Reviews"
      description="Avaliações honestas de motos, pneus, capacetes e acessórios. Comprei, usei e conto o que realmente aconteceu."
      heroImg={IMG}
      icon={<Star size={20} fill="currentColor" />}
    />
  );
}
