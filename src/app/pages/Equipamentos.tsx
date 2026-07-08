import { Shield } from "lucide-react";
import CategoryPage from "./CategoryPage";

const IMG = "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=560&fit=crop&auto=format";

export default function Equipamentos() {
  return (
    <CategoryPage
      tag="Equipamentos"
      title="Equipamentos"
      description="Capacetes, jaquetas, luvas, botas e acessórios que uso no dia a dia. Reviews sem jabá — comprei com o meu dinheiro."
      heroImg={IMG}
      icon={<Shield size={20} />}
    />
  );
}
