"use client";

import React, { useState } from "react";
import { TEKO, BODY } from "../data";
import { Send, CheckCircle2, AlertCircle, RefreshCw, Briefcase } from "lucide-react";

interface AdvertiseFormData {
  contactName: string;
  companyName: string;
  corporateEmail: string;
  phone: string;
  adFormat: string;
  budgetRange: string;
  message: string;
}

interface FormErrors {
  contactName?: string;
  companyName?: string;
  corporateEmail?: string;
  adFormat?: string;
  message?: string;
}

const AD_FORMAT_OPTIONS = [
  "Banners IAB Display (Leaderboard / MPU)",
  "Branded Content / Review Patrocinado",
  "Patrocínio de Newsletter Semanal",
  "Parceria de Teste de Equipamentos / Motopeças",
  "Projeto Especial Sob Medida",
];

const BUDGET_OPTIONS = [
  "Até R$ 3.000 / mês",
  "R$ 3.000 a R$ 8.000 / mês",
  "R$ 8.000 a R$ 20.000 / mês",
  "Acima de R$ 20.000 / mês",
  "A definir conforme proposta",
];

export default function AdvertiseContactForm() {
  const [formData, setFormData] = useState<AdvertiseFormData>({
    contactName: "",
    companyName: "",
    corporateEmail: "",
    phone: "",
    adFormat: "",
    budgetRange: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Por favor, informe o nome do responsável.";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Informe o nome da empresa ou agência.";
    }

    if (!formData.corporateEmail.trim()) {
      newErrors.corporateEmail = "Informe o e-mail de contato corporativo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.corporateEmail.trim())) {
      newErrors.corporateEmail = "Insira um endereço de e-mail válido.";
    }

    if (!formData.adFormat) {
      newErrors.adFormat = "Selecione o formato de mídia pretendido.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Descreva brevemente o objetivo da campanha.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setFormData({
      contactName: "",
      companyName: "",
      corporateEmail: "",
      phone: "",
      adFormat: "",
      budgetRange: "",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border p-8 text-center rounded-none shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 style={TEKO} className="text-[32px] font-semibold uppercase text-foreground leading-tight mb-2">
          Proposta Comercial Recebida!
        </h3>
        <p className="text-[14px] text-muted-foreground max-w-lg mx-auto mb-6" style={BODY}>
          Agradecemos pelo interesse em anunciar no <strong>Moto na Prática</strong>, {formData.contactName}!
          Nosso departamento comercial analisará os objetivos da marca <strong>{formData.companyName}</strong> e
          enviará a tabela de preços detalhada e disponibilidade de inventário em até 24 horas úteis no e-mail{" "}
          <span className="text-foreground font-semibold">{formData.corporateEmail}</span>.
        </p>

      <div className="w-full text-center px-6 py-3.5 bg-muted text-muted-foreground text-[14px] font-semibold uppercase tracking-wider border border-border" style={TEKO}>
        Envio comercial temporariamente indisponível. Use a página de contato quando o canal estiver habilitado.
      </div>

      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-card border border-border p-6 md:p-8 space-y-5">
      <div className="border-b border-border pb-4 mb-2">
        <div className="flex items-center gap-2 text-primary font-semibold text-[12px] uppercase tracking-wider mb-1" style={BODY}>
          <Briefcase size={15} /> Atendimento Comercial & Agências
        </div>
        <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground">
          Solicite uma Proposta ou Mídia Kit
        </h2>
        <p className="text-[13px] text-muted-foreground" style={BODY}>
          Preencha os dados da sua empresa ou agência para receber nosso kit comercial e disponibilidade de inventário.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nome do Contato */}
        <div>
          <label htmlFor="contactName" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            Nome do Responsável <span className="text-primary">*</span>
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            required
            aria-required="true"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Ex: Amanda Silva"
            aria-invalid={!!errors.contactName}
            aria-describedby={errors.contactName ? "contactName-error" : undefined}
            className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none outline-none focus:border-primary ${
              errors.contactName ? "border-destructive bg-destructive/5" : "border-border"
            }`}
            style={BODY}
          />
          {errors.contactName && (
            <p id="contactName-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
              <AlertCircle size={13} /> {errors.contactName}
            </p>
          )}
        </div>

        {/* Empresa / Agência */}
        <div>
          <label htmlFor="companyName" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            Empresa ou Agência <span className="text-primary">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            aria-required="true"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Ex: Marca de Capacetes Brasil"
            aria-invalid={!!errors.companyName}
            aria-describedby={errors.companyName ? "companyName-error" : undefined}
            className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none outline-none focus:border-primary ${
              errors.companyName ? "border-destructive bg-destructive/5" : "border-border"
            }`}
            style={BODY}
          />
          {errors.companyName && (
            <p id="companyName-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
              <AlertCircle size={13} /> {errors.companyName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* E-mail Corporativo */}
        <div>
          <label htmlFor="corporateEmail" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            E-mail Corporativo <span className="text-primary">*</span>
          </label>
          <input
            id="corporateEmail"
            name="corporateEmail"
            type="email"
            required
            aria-required="true"
            value={formData.corporateEmail}
            onChange={handleChange}
            placeholder="amanda@marca.com.br"
            aria-invalid={!!errors.corporateEmail}
            aria-describedby={errors.corporateEmail ? "corporateEmail-error" : undefined}
            className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none outline-none focus:border-primary ${
              errors.corporateEmail ? "border-destructive bg-destructive/5" : "border-border"
            }`}
            style={BODY}
          />
          {errors.corporateEmail && (
            <p id="corporateEmail-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
              <AlertCircle size={13} /> {errors.corporateEmail}
            </p>
          )}
        </div>

        {/* Telefone / WhatsApp */}
        <div>
          <label htmlFor="phone" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            Telefone / WhatsApp Comercial
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className="w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border border-border rounded-none outline-none focus:border-primary"
            style={BODY}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formato de Interesse */}
        <div>
          <label htmlFor="adFormat" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            Formato Desejado <span className="text-primary">*</span>
          </label>
          <select
            id="adFormat"
            name="adFormat"
            required
            aria-required="true"
            value={formData.adFormat}
            onChange={handleChange}
            aria-invalid={!!errors.adFormat}
            aria-describedby={errors.adFormat ? "adFormat-error" : undefined}
            className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none outline-none focus:border-primary ${
              errors.adFormat ? "border-destructive bg-destructive/5" : "border-border"
            }`}
            style={BODY}
          >
            <option value="">Selecione um formato...</option>
            {AD_FORMAT_OPTIONS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
          {errors.adFormat && (
            <p id="adFormat-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
              <AlertCircle size={13} /> {errors.adFormat}
            </p>
          )}
        </div>

        {/* Faixa de Investimento Prevista */}
        <div>
          <label htmlFor="budgetRange" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
            Previsão de Investimento
          </label>
          <select
            id="budgetRange"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border border-border rounded-none outline-none focus:border-primary"
            style={BODY}
          >
            <option value="">Selecione uma faixa aproximada...</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descrição da Campanha */}
      <div>
        <label htmlFor="message" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
          Objetivo da Campanha / Mensagem <span className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          aria-required="true"
          value={formData.message}
          onChange={handleChange}
          placeholder="Descreva o produto, período da veiculação, público-alvo prioritário ou detalhes específicos da ação..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none outline-none focus:border-primary resize-y ${
            errors.message ? "border-destructive bg-destructive/5" : "border-border"
          }`}
          style={BODY}
        />
        {errors.message && (
          <p id="message-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
            <AlertCircle size={13} /> {errors.message}
          </p>
        )}
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-primary text-primary-foreground text-[14px] font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
        style={TEKO}
      >
        {isSubmitting ? (
          <>
            <RefreshCw size={18} className="animate-spin" /> Enviando Solicitação Comercial...
          </>
        ) : (
          <>
            <Send size={18} /> Solicitar Mídia Kit & Proposta
          </>
        )}
      </button>

      <p className="text-[12px] text-muted-foreground text-center" style={BODY}>
        Atendimento direto também por e-mail:{" "}
        <a href="/contato" className="text-primary font-semibold hover:underline">
          Fale conosco via Página de Contato
        </a>
      </p>
    </form>
  );
}
