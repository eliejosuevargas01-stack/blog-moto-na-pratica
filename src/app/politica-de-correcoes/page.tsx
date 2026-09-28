import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import { ChevronRight, RotateCcw, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Política de Correções · Moto na Prática",
  description:
    "Saiba como o Moto na Prática lida com erros, atualizações e correções de matérias, e como você pode reportar um problema.",
};

export default function PoliticaCorrecoesPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Correções</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Compromisso com a Verdade
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Política de Correções
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            Acreditamos que a credibilidade se constrói assumindo e corrigindo erros com transparência. Nossa Política de Correções define como tratamos imprecisões factuais, atualizações de conteúdo e como você pode nos ajudar a manter a qualidade das nossas matérias.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-14">

        {/* TIPOS DE ALTERAÇÕES */}
        <section className="space-y-6">
          <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground mb-6">
            Como Lidamos com Alterações
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                <AlertCircle size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Erros Factuais e Erratas
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                Se publicarmos uma informação factualmente incorreta (ex: ficha técnica errada, preço defasado, erro de autoria), a matéria será corrigida o mais rápido possível. Adicionaremos uma nota explícita informando o que foi alterado e a data da correção, para que a retificação não seja escondida do leitor.
              </p>
            </div>

            <div className="bg-card border border-border p-6 space-y-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
                <RotateCcw size={22} />
              </div>
              <h3 style={TEKO} className="text-[22px] font-semibold uppercase text-foreground">
                Atualizações Normais
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
                O mercado de motocicletas é dinâmico. Atualizamos matérias com novos dados (ex: novos recalls, novas versões de um modelo, ou mudanças em leis de trânsito) para manter o conteúdo relevante e útil. Nestes casos, o artigo exibirá a data da última atualização.
              </p>
            </div>
          </div>
        </section>

        {/* COMO REPORTAR */}
        <section className="bg-card border border-border p-6 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-7 bg-primary" />
            <h2 style={TEKO} className="text-[32px] font-semibold uppercase tracking-wide text-foreground">
              Como Reportar um Problema
            </h2>
          </div>

          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-sm bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-1">
                <FileCheck size={22} />
             </div>
             <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed w-full" style={BODY}>
                <p>
                  A comunidade é parte fundamental da nossa verificação. Se você encontrar um erro, uma imprecisão ou um link quebrado, queremos saber.
                </p>
                <p>
                  Para reportar uma necessidade de correção, por favor, utilize nosso formulário de contato oficial. Selecione a opção <strong>"Correção de Matéria"</strong> no assunto.
                </p>

                <div className="pt-4">
                  <Link href="/contato" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm">
                    Reportar um Erro na Redação <ChevronRight size={16} />
                  </Link>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
