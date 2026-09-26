import Link from "next/link";
import { ChevronLeft, AlertTriangle, CheckCircle2, CheckSquare, Check } from "lucide-react";
import { TEKO, BODY } from "../data";

export const metadata = {
  title: "Exemplos dos Efeitos Visuais · Moto na Prática",
  description: "Demonstração dos componentes e formatos visuais padronizados para artigos e matérias técnicas.",
};

export default function ExemplosVisuaisPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-12">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-[12px] text-[#4B5563] hover:text-[#111827] uppercase tracking-wider mb-6 transition-colors w-fit font-medium"
      >
        <ChevronLeft size={14} /> Voltar para Home
      </Link>

      <div className="mb-10 border-b border-[#E5E7EB] pb-6">
        <h1 style={TEKO} className="text-[44px] font-semibold uppercase text-[#111827] leading-none mb-3">
          Guia de Efeitos Visuais Padronizados
        </h1>
        <p className="text-[15px] text-[#4B5563]" style={BODY}>
          Demonstração ao vivo dos componentes e formatos visuais estilizados para renderização em posts, testes e matérias técnicas.
        </p>
      </div>

      <div className="prose max-w-none space-y-12" style={BODY}>

        {/* A. CARD DE ALERTA MECÂNICO */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Novo Componente</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">Card de Alerta Mecânico (.box-alerta-mecanico)</h2>
          
          <div className="box-alerta-mecanico border-l-4 border-l-[#DC2626] bg-[#FEF2F2] rounded-r-lg p-5 my-4 text-[#1F2937] shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-[#DC2626] shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-[#991B1B] font-bold text-base uppercase tracking-wide m-0 mb-1.5">
                  Alerta Mecânico Crítico: Torque Excessivo no Buchão do Cárter
                </h4>
                <p className="text-[#1F2937] text-sm leading-relaxed m-0">
                  Nunca aperte o parafuso de dreno de óleo sem chave dinamométrica aferida. O torque recomendado de fábrica varia entre <strong>20 a 24 Nm</strong>. O aperto manual excessivo rompe os filetes da rosca no bloco de alumínio, provocando vazamento em alta temperatura e risco gravíssimo de queda de óleo sobre o pneu traseiro.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* B. CARD DE VEREDITO / DICA */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Novo Componente</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">Card de Veredito / Dica (.box-veredito)</h2>
          
          <div className="box-veredito border-l-4 border-l-[#16A34A] bg-[#F0FDF4] rounded-r-lg p-5 my-4 text-[#1F2937] shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#16A34A] shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-[#166534] font-bold text-base uppercase tracking-wide m-0 mb-1.5">
                  Veredito da Oficina: Durabilidade e Custo de Manutenção
                </h4>
                <p className="text-[#1F2937] text-sm leading-relaxed m-0">
                  Conjunto aprovado para trabalho diário e longas viagens urbanas. O sistema de lubrificação sob pressão e comando roletado garantem desgaste mínimo. Com substituições rigorosas do filtro de óleo a cada <strong>6.000 km</strong>, o propulsor alcança a marca de <strong>100.000 km</strong> com folgas perfeitamente toleradas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* C. TABELA DE CUSTOS E PEÇAS RESPONSIVA */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Novo Componente</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">Tabela de Custos e Peças Responsiva (.table-wrapper)</h2>
          
          <div className="table-wrapper overflow-x-auto scroll-smooth border border-[#E5E7EB] rounded-lg shadow-xs my-4 bg-white">
            <table className="w-full text-left text-sm border-collapse min-w-[640px]">
              <thead className="bg-[#F3F4F6] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">Item / Peça de Reposição</th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">Intervalo Recomendado</th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider text-right">Qtd.</th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider text-right">Preço Unitário</th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider text-right">Total Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937]">
                <tr className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">Óleo 10W-40 Semissintético API SN</td>
                  <td className="py-3 px-4 text-[#4B5563]">A cada 3.000 km</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">1,5 L</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">R$ 48,00</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#111827]">R$ 72,00</td>
                </tr>
                <tr className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">Elemento do Filtro de Óleo</td>
                  <td className="py-3 px-4 text-[#4B5563]">A cada 6.000 km</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">1 un</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">R$ 35,00</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#111827]">R$ 35,00</td>
                </tr>
                <tr className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">Vela de Ignição Especial Iridium</td>
                  <td className="py-3 px-4 text-[#4B5563]">A cada 12.000 km</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">1 un</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">R$ 89,00</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#111827]">R$ 89,00</td>
                </tr>
                <tr className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">Pastilhas Sinterizadas Dianteiras</td>
                  <td className="py-3 px-4 text-[#4B5563]">Inspeção periódica (10k km)</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">1 par</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">R$ 145,00</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#111827]">R$ 145,00</td>
                </tr>
                <tr className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827]">Kit Transmissão c/ O-ring Selado</td>
                  <td className="py-3 px-4 text-[#4B5563]">A cada 20.000 km</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">1 kit</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#4B5563]">R$ 380,00</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#111827]">R$ 380,00</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#F9FAFB] border-t-2 border-[#E5E7EB] text-[#111827]">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right text-xs uppercase tracking-wider text-[#4B5563] font-semibold">Custo Estimado da Cesta de Peças:</td>
                  <td className="py-3 px-4 text-right tabular-nums text-primary text-base font-bold">R$ 721,00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* D. CHECKLIST DE INSPEÇÃO */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Novo Componente</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">Checklist de Inspeção (.checklist)</h2>
          
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-5 rounded-lg my-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E7EB]">
              <CheckSquare className="text-[#16A34A]" size={20} />
              <h4 className="text-[#111827] font-bold text-base uppercase tracking-wide m-0">
                Checklist de 5 Minutos Antes de Pegar a Rodovia
              </h4>
            </div>
            <ul className="checklist space-y-3 pl-0 list-none my-0">
              <li className="flex items-start gap-3 text-[#1F2937] text-sm">
                <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <div>
                  <strong className="text-[#111827]">Pressão dos Pneus (a frio):</strong> 29 PSI dianteiro / 33 PSI traseiro (com garupa ou carga: 36 PSI na traseira).
                </div>
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] text-sm">
                <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <div>
                  <strong className="text-[#111827]">Folga da Corrente de Transmissão:</strong> Folga vertical livre de 20 a 30 mm aferida no centro da balança.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] text-sm">
                <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <div>
                  <strong className="text-[#111827]">Nível do Fluido de Freio:</strong> Verificação do visor translúcido acima da linha MIN com guidão alinhado.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] text-sm">
                <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <div>
                  <strong className="text-[#111827]">Espessura do Material de Atrito:</strong> Pastilhas dianteiras e sapatas traseiras acima de 2 mm de espessura útil.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[#1F2937] text-sm">
                <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <div>
                  <strong className="text-[#111827]">Sistema Elétrico e Sinalização:</strong> Farol baixo/alto, acionamento do freio dianteiro e traseiro e setas direcionais.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* E. MÍDIA 16:9 COM LEGENDA CENTRALIZADA */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Novo Componente</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">Mídia 16:9 com Legenda Centralizada</h2>
          
          <figure className="my-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] relative">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80"
                alt="Aferição técnica na bancada de oficina"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="text-center text-xs text-[#6B7280] mt-2">
              Posicionamento padrão do micrômetro para medição do desgaste dos dentes da coroa e folga axial do pinhão.
            </figcaption>
          </figure>
        </section>

        {/* 1. PRÓS E CONTRAS */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #1</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">1. Caixas de Prós e Contras (.box-pros-cons)</h2>
          
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
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #2</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">2. Ficha Técnica de Moto (.ficha-tecnica)</h2>

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
                    <span className="spec-label">Cilindrada</span>
                    <span className="spec-value">249 cc</span>
                    <span className="spec-asfalto"><strong>Tradução:</strong> Resposta rápida e ágil no trânsito urbano.</span>
                  </li>
                  <li>
                    <span className="spec-label">Potência Máxima</span>
                    <span className="spec-value">21,5 cv a 8.000 rpm</span>
                    <span className="spec-asfalto"><strong>Tradução:</strong> Mantém 110 km/h de cruzeiro com folga.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TABELA COMPARATIVA */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #3</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">3. Tabela Comparativa (.tabela-comparativa)</h2>

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
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #4</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">4. Caixa de Aviso / Callout (.box-aviso e blockquote)</h2>

          <div className="box-aviso">
            <p><strong>Aviso Importante:</strong> Verifique o nível do óleo a cada 1.000 km. Rodar com o nível abaixo do mínimo pode causar danos graves ao motor.</p>
          </div>

          <blockquote className="mt-4">
            <p><strong>Dica de Segurança:</strong> Em dias de chuva, aumente a distância de seguimento para garantir frenagem segura sobre faixas pintadas no asfalto.</p>
          </blockquote>
        </section>

        {/* 5. TÍTULOS E TIPOGRAFIA */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #5</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">5. Títulos de Seção (h1, h2, h3, h4)</h2>

          <h1>Título H1 com Borda Vermelha Lateral</h1>
          <h2 className="mt-4">Título H2 com Linha Divisória Superior</h2>
          <h3 className="mt-4">Título H3 em Teko Maiúsculo</h3>
          <h4 className="mt-4">Título H4 de Subtópico</h4>
        </section>

        {/* 6. LISTAS REFINADAS */}
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #6</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">6. Listas com Marcadores Vermelhos (ul, ol)</h2>

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
        <section className="bg-white border border-[#E5E7EB] p-6 rounded-lg shadow-xs">
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest block mb-2">Efeito #7</span>
          <h2 style={TEKO} className="text-[28px] uppercase text-[#111827] mb-4">7. Imagem Ilustrativa com Legenda (&lt;figure&gt;)</h2>

          <figure className="my-6 text-center">
            <img src="https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1000" alt="Conjunto de freios ABS" className="w-full h-[320px] object-cover border border-[#E5E7EB] rounded-lg mx-auto" loading="lazy" />
            <figcaption className="text-xs text-[#6B7280] mt-2 italic">Conjunto de freio a disco com ABS de dois canais.</figcaption>
          </figure>
        </section>

      </div>
    </div>
  );
}
