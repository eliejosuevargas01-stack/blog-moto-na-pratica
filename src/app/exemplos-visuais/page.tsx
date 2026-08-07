import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TEKO, BODY } from "../data";

export const metadata = {
  title: "Exemplos dos Efeitos Visuais · Moto na Prática",
  description: "Demonstração dos 7 componentes e formatos visuais padronizados para artigos.",
};

export default function ExemplosVisuaisPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-12">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-white uppercase tracking-wider mb-6 transition-colors w-fit"
      >
        <ChevronLeft size={14} /> Voltar para Home
      </Link>

      <div className="mb-10 border-b border-border pb-6">
        <h1 style={TEKO} className="text-[44px] font-semibold uppercase text-foreground leading-none mb-3">
          Guia de Efeitos Visuais Padronizados
        </h1>
        <p className="text-[15px] text-muted-foreground" style={BODY}>
          Demonstração ao vivo dos 7 formatos visuais estilizados para renderização em posts e artigos.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-12" style={BODY}>

        {/* 1. PRÓS E CONTRAS */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #1</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">1. Caixas de Prós e Contras (.box-pros-cons)</h2>
          
          <div className="box-pros-cons">
            <div className="box-pros">
              <h4>👍 Pontos Fortes</h4>
              <ul>
                <li><strong>Consumo excelente:</strong> Média de 30 km/l no uso urbano.</li>
                <li><strong>Ergonomia confortável:</strong> Posição de pilotagem ereta para longas viagens.</li>
              </ul>
            </div>
            <div className="box-cons">
              <h4>👎 Pontos Fracos</h4>
              <ul>
                <li><strong>Painel analógico:</strong> Sem display digital completo.</li>
                <li><strong>Vibração em altas rotações:</strong> Retrovisores tremem acima de 8.000 rpm.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. FICHA TÉCNICA */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #2</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">2. Ficha Técnica de Moto (.ficha-tecnica)</h2>

          <div className="ficha-tecnica">
            <div className="ficha-header">
              <span className="ficha-badge">Ficha Técnica</span>
              <h3 className="ficha-title">Yamaha Fazer 250 (FZ25) 2026</h3>
            </div>
            <div className="ficha-grid">
              <div className="ficha-bloco">
                <div className="ficha-bloco-header">
                  <span className="ficha-bloco-icon">⚡</span>
                  <h4>Motor & Desempenho</h4>
                </div>
                <ul className="ficha-lista">
                  <li>
                    <span class="spec-label">Cilindrada</span>
                    <span class="spec-value">249 cc</span>
                    <span class="spec-asfalto"><strong>Tradução:</strong> Resposta rápida e ágil no trânsito urbano.</span>
                  </li>
                  <li>
                    <span class="spec-label">Potência Máxima</span>
                    <span class="spec-value">21,5 cv a 8.000 rpm</span>
                    <span class="spec-asfalto"><strong>Tradução:</strong> Mantém 110 km/h de cruzeiro com folga.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TABELA COMPARATIVA */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #3</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">3. Tabela Comparativa (.tabela-comparativa)</h2>

          <div className="table-wrapper">
            <table className="tabela-comparativa">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Motor</th>
                  <th>Consumo Médio</th>
                  <th>Preço Estimado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Yamaha FZ25</strong></td>
                  <td>249 cc (21.5 cv)</td>
                  <td>30 km/l</td>
                  <td>R$ 23.500</td>
                </tr>
                <tr>
                  <td><strong>Honda CB 300F</strong></td>
                  <td>293 cc (24.7 cv)</td>
                  <td>28 km/l</td>
                  <td>R$ 24.200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. CAIXAS DE AVISO */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #4</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">4. Caixa de Aviso / Callout (.box-aviso e blockquote)</h2>

          <div className="box-aviso">
            <p><strong>Aviso Importante:</strong> Verifique o nível do óleo a cada 1.000 km. Rodar com o nível abaixo do mínimo pode causar danos graves ao motor.</p>
          </div>

          <blockquote className="mt-4">
            <p><strong>Dica de Segurança:</strong> Em dias de chuva, aumente a distância de seguimento para garantir frenagem segura sobre faixas pintadas no asfalto.</p>
          </blockquote>
        </section>

        {/* 5. TÍTULOS E TIPOGRAFIA */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #5</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">5. Títulos de Seção (h1, h2, h3, h4)</h2>

          <h1>Título H1 com Borda Vermelha Lateral</h1>
          <h2 className="mt-4">Título H2 com Linha Divisória Superior</h2>
          <h3 className="mt-4">Título H3 em Teko Maiúsculo</h3>
          <h4 className="mt-4">Título H4 de Subtópico</h4>
        </section>

        {/* 6. LISTAS REFINADAS */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #6</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">6. Listas com Marcadores Vermelhos (ul, ol)</h2>

          <h3>Lista Não Ordenada (bullets vermelhos):</h3>
          <ul>
            <li><strong>Pneu Dianteiro:</strong> Michelin Pilot Street 2 (100/80-17).</li>
            <li><strong>Pneu Traseiro:</strong> Michelin Pilot Street 2 (140/70-17).</li>
          </ul>

          <h3 className="mt-6">Lista Ordenada (números vermelhos):</h3>
          <ol>
            <li>Remova o parafuso do dreno com chave 17mm.</li>
            <li>Aguarde o óleo escorrer completamente por 5 minutos.</li>
          </ol>
        </section>

        {/* 7. IMAGEM COM LEGENDA */}
        <section className="bg-card border border-border p-6 rounded-md">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #7</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-foreground mb-4">7. Imagem Ilustrativa com Legenda (&lt;figure&gt;)</h2>

          <figure className="my-6 text-center">
            <img src="https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1000" alt="Conjunto de freios ABS" className="w-full h-[320px] object-cover border border-border rounded-sm mx-auto" loading="lazy" />
            <figcaption className="text-xs text-muted-foreground mt-2 italic">Conjunto de freio a disco com ABS de dois canais.</figcaption>
          </figure>
        </section>

      </div>
    </div>
  );
}
