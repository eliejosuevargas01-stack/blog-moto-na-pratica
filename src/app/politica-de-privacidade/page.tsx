import React from "react";
import { TEKO, BODY } from "../data";
import Link from "next/link";
import {
  Cookie,
  UserCheck,
  ShieldCheck,
  Mail,
  ChevronRight,
  Database,
  EyeOff,
} from "lucide-react";

export const metadata = {
  title: "Política de Privacidade & LGPD · Moto na Prática",
  description:
    "Transparência no tratamento de dados pessoais, uso de cookies e conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="bg-background min-h-screen">
      {/* HERO SECTION */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground uppercase tracking-widest mb-3" style={BODY}>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="text-primary" />
            <span className="text-foreground font-semibold">Política de Privacidade</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="block w-1.5 h-8 bg-primary" />
            <span className="text-primary text-[12px] font-bold uppercase tracking-widest">
              Proteção de Dados & LGPD
            </span>
          </div>

          <h1 style={TEKO} className="text-[48px] md:text-[64px] font-semibold uppercase leading-none tracking-wide text-foreground mb-4">
            Política de Privacidade
          </h1>

          <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-3xl leading-relaxed" style={BODY}>
            No <strong>Moto na Prática</strong>, respeitamos a sua privacidade. Esta política explica de forma transparente como coletamos, utilizamos, armazenamos e protegemos suas informações de acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
          </p>
          <p className="text-[12px] text-muted-foreground mt-2" style={BODY}>
            Vigência: Atualizada em setembro de 2026.
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-10">
        
        {/* 1. PRINCÍPIO DA COLETA MÍNIMA */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Database size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              1. Coleta Mínima de Dados Pessoais
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            Adotamos o princípio da necessidade e minimização de dados. Nós apenas coletamos os dados estritamente indispensáveis para o funcionamento do portal e a prestação dos nossos serviços informativos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-background border border-border space-y-1.5">
              <strong className="text-foreground text-[14px] block font-semibold">Formulários de Contato:</strong>
              <p className="text-[13px] text-muted-foreground">
                Nome completo, e-mail e assunto, fornecidos voluntariamente por você ao enviar mensagens ou pautas à redação.
              </p>
            </div>
            <div className="p-4 bg-background border border-border space-y-1.5">
              <strong className="text-foreground text-[14px] block font-semibold">Inscrição na Newsletter:</strong>
              <p className="text-[13px] text-muted-foreground">
                Apenas o endereço de e-mail com consentimento expresso (opt-in) para envio de artigos semanais e novidades.
              </p>
            </div>
            <div className="p-4 bg-background border border-border space-y-1.5">
              <strong className="text-foreground text-[14px] block font-semibold">Logs de Conexão:</strong>
              <p className="text-[13px] text-muted-foreground">
                Endereço IP anonimizado, registro de data/hora e tipo de navegador, armazenados em cumprimento ao Marco Civil da Internet.
              </p>
            </div>
          </div>
        </div>

        {/* 2. COOKIES E TECNOLOGIAS DE ANALYTICS / ADS */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Cookie size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              2. Uso de Cookies e Tecnologias de Rastreamento
            </h2>
          </div>
          <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo para aprimorar sua experiência de navegação. Utilizamos as seguintes categorias:
            </p>
            <ul className="space-y-2.5 text-foreground list-disc pl-5">
              <li>
                <strong>Cookies Estritamente Necessários:</strong> Permitem funções essenciais do site, como navegação entre páginas, preferências de idioma (<code>NEXT_LOCALE</code>) e segurança de formulários.
              </li>
              <li>
                <strong>Cookies de Análise e Métricas (Google Analytics):</strong> Coletam estatísticas agregadas e anônimas sobre páginas mais lidas, tempo médio de leitura e taxa de rejeição, visando aperfeiçoar nossos artigos técnicos. O recurso de anonimização de IP encontra-se ativo.
              </li>
              <li>
                <strong>Cookies de Publicidade Programática (Google AdSense):</strong> Parceiros de tecnologia utilizam cookies para veicular anúncios não invasivos no portal. Você pode configurar suas preferências de anúncios e desativar anúncios personalizados através das configurações de anúncios da sua Conta Google ou ferramentas de opt-out da indústria.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. FINALIDADE E BASE LEGAL */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              3. Finalidade e Base Legal para o Tratamento
            </h2>
          </div>
          <div className="space-y-2 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Em obediência ao artigo 7º da LGPD, todo tratamento de dados realizado pelo <strong>Moto na Prática</strong> fundamenta-se em bases legais legítimas:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-foreground pt-1">
              <li><strong>Consentimento do Titular:</strong> Para o recebimento de e-mails da newsletter e comunicações autorizadas.</li>
              <li><strong>Execução de Procedimentos Preliminares:</strong> Para responder a mensagens enviadas no formulário de contato a pedido do leitor.</li>
              <li><strong>Cumprimento de Obrigação Legal:</strong> Para retenção de registros de acesso nos termos do art. 15 da Lei nº 12.965/2014 (Marco Civil da Internet).</li>
              <li><strong>Legítimo Interesse:</strong> Para segurança cibernética do portal e prevenção contra fraudes e ataques maliciosos.</li>
            </ul>
          </div>
        </div>

        {/* 4. NÃO COMERCIALIZAÇÃO E COMPARTILHAMENTO */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <EyeOff size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              4. Não Comercialização de Dados
            </h2>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            O <strong>Moto na Prática não vende, aluga ou comercializa</strong> listas de e-mails ou dados pessoais de seus leitores sob nenhuma circunstância. O compartilhamento ocorre única e exclusivamente com provedores de infraestrutura estritamente necessários para a operação do site (ex: servidores de hospedagem e disparadores de e-mails transacionais com contrato de confidencialidade e segurança).
          </p>
        </div>

        {/* 5. DIREITOS DOS TITULARES (ART. 18 LGPD) */}
        <div id="exclusao-dados" className="scroll-mt-24 bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <UserCheck size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              5. Seus Direitos como Titular de Dados
            </h2>
          </div>
          <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Conforme o artigo 18 da LGPD, você possui os seguintes direitos garantidos mediante simples solicitação à nossa equipe:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13.5px] text-foreground pt-1">
              <div className="p-3 border border-border bg-background">
                ✓ <strong>Confirmação e Acesso:</strong> Confirmar se tratamos seus dados e solicitar cópia dos mesmos.
              </div>
              <div className="p-3 border border-border bg-background">
                ✓ <strong>Correção:</strong> Solicitar a retificação de dados incorretos, inexatos ou desatualizados.
              </div>
              <div className="p-3 border border-border bg-background">
                ✓ <strong>Eliminação / Exclusão:</strong> Requerer a exclusão definitiva do seu e-mail de nossas bases da newsletter.
              </div>
              <div className="p-3 border border-border bg-background">
                ✓ <strong>Revogação de Consentimento:</strong> Desinscrever-se a qualquer momento pelo link disponível no rodapé dos e-mails.
              </div>
            </div>
          </div>
        </div>

        {/* 6. ENCARREGADO DE DADOS (DPO) */}
        <div className="bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Mail size={20} />
            <h2 style={TEKO} className="text-[26px] font-semibold uppercase tracking-wide text-foreground">
              6. Canal Direto do Encarregado de Dados (DPO)
            </h2>
          </div>
          <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed" style={BODY}>
            <p>
              Para exercer qualquer um dos seus direitos de titular, esclarecer dúvidas sobre esta Política ou relatar questões de segurança, entre em contato direto com o nosso Encarregado pelo Tratamento de Dados Pessoais (DPO):
            </p>
            <div className="p-4 bg-muted/40 border border-border space-y-1">
              <p className="text-[13px] text-foreground">
                <strong>Encarregado pelo Tratamento de Dados (DPO):</strong> Eliezer Josué Vargas
              </p>
              <p className="text-[13px] text-foreground">
                <strong>E-mail de Contato:</strong>{" "}
                <a href="/contato" className="text-primary font-semibold hover:underline">
                  Fale conosco via Página de Contato
                </a>
              </p>
              <p className="text-[12px] text-muted-foreground">
                Prazo estimado de resposta: até 15 (quinze) dias corridos, em conformidade com as diretrizes da Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
