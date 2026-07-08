import { Wrench } from "lucide-react";
import CategoryPage from "./CategoryPage";

const IMG = "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1400&h=560&fit=crop&auto=format";

export default function Manutencao() {
  return (
    <CategoryPage
      tag="Manutenção"
      title="Manutenção"
      description="Passo a passo real de manutenção preventiva e corretiva. O que fazer em casa, o que levar na oficina e quanto custa."
      heroImg={IMG}
      icon={<Wrench size={20} />}
    />
  );
}
