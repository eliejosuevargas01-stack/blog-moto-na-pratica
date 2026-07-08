import { MapPin } from "lucide-react";
import CategoryPage from "./CategoryPage";

const IMG = "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=1400&h=560&fit=crop&auto=format";

export default function Rotas() {
  return (
    <CategoryPage
      tag="Rotas"
      title="Rotas"
      description="Roteiros que já fiz de moto. Distâncias, tipo de estrada, pontos de abastecimento e o que não pode faltar na bagagem."
      heroImg={IMG}
      icon={<MapPin size={20} />}
    />
  );
}
