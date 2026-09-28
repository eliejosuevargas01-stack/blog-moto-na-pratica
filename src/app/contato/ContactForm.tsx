"use client";

import React, { useState } from "react";
import { TEKO, BODY } from "../data";
import { Send, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const SUBJECT_OPTIONS = [
  "Sugestão de Pauta / Notícia",
  "Correção de Matéria",
  "Imprensa / Press Release",
  "Dúvida Técnica / Mecânica",
  "Parceria Comercial / Publicidade",
  "Questões Gerais",
  "Outro",
];

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Por favor, informe seu nome completo.";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "O nome deve conter ao menos 3 caracteres.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Por favor, informe seu e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Insira um endereço de e-mail válido.";
    }

    if (!formData.subject) {
      newErrors.subject = "Selecione o assunto do contato.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Por favor, digite sua mensagem.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "A mensagem deve conter no mínimo 10 caracteres.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simula o processamento seguro de envio institucional
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border p-8 text-center rounded-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 style={TEKO} className="text-[32px] font-semibold uppercase text-foreground leading-tight mb-2">
          Mensagem Enviada com Sucesso!
        </h3>
        <p className="text-[14px] text-muted-foreground max-w-md mx-auto mb-6" style={BODY}>
          Obrigado pelo contato, <strong className="text-foreground font-semibold">{formData.fullName}</strong>.
          Nossa equipe editorial ou comercial analisará sua solicitação e responderá no e-mail informado
          (<span className="text-foreground">{formData.email}</span>) em até 48 horas úteis.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-[13px] font-semibold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Enviar Nova Mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-card border border-border p-6 md:p-8 space-y-6">
      <div className="border-b border-border pb-4 mb-2">
        <h2 style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground">
          Envie sua Mensagem
        </h2>
        <p className="text-[13px] text-muted-foreground" style={BODY}>
          Preencha os campos abaixo com os detalhes da sua solicitação. Todos os campos são de preenchimento obrigatório.
        </p>
      </div>

      {/* Nome Completo */}
      <div>
        <label htmlFor="fullName" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
          Nome Completo <span className="text-primary">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          aria-required="true"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Ex: João da Silva"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none transition-colors outline-none focus:border-primary ${
            errors.fullName ? "border-destructive bg-destructive/5" : "border-border"
          }`}
          style={BODY}
        />
        {errors.fullName && (
          <p id="fullName-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
            <AlertCircle size={13} /> {errors.fullName}
          </p>
        )}
      </div>

      {/* E-mail */}
      <div>
        <label htmlFor="email" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
          E-mail de Contato <span className="text-primary">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none transition-colors outline-none focus:border-primary ${
            errors.email ? "border-destructive bg-destructive/5" : "border-border"
          }`}
          style={BODY}
        />
        {errors.email && (
          <p id="email-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
            <AlertCircle size={13} /> {errors.email}
          </p>
        )}
      </div>

      {/* Assunto */}
      <div>
        <label htmlFor="subject" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
          Assunto Principal <span className="text-primary">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          aria-required="true"
          value={formData.subject}
          onChange={handleChange}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none transition-colors outline-none focus:border-primary ${
            errors.subject ? "border-destructive bg-destructive/5" : "border-border"
          }`}
          style={BODY}
        >
          <option value="">Selecione uma opção...</option>
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p id="subject-error" className="flex items-center gap-1.5 text-[12px] text-destructive mt-1.5">
            <AlertCircle size={13} /> {errors.subject}
          </p>
        )}
      </div>

      {/* Mensagem */}
      <div>
        <label htmlFor="message" className="block text-[13px] font-semibold text-foreground mb-1.5" style={BODY}>
          Mensagem <span className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-required="true"
          value={formData.message}
          onChange={handleChange}
          placeholder="Descreva detalhadamente sua sugestão, dúvida técnica ou proposta..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`w-full px-3.5 py-2.5 text-[14px] bg-background text-foreground border rounded-none transition-colors outline-none focus:border-primary resize-y ${
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
            <RefreshCw size={18} className="animate-spin" /> Enviando Mensagem...
          </>
        ) : (
          <>
            <Send size={18} /> Enviar Mensagem para a Redação
          </>
        )}
      </button>

      <p className="text-[11.5px] text-muted-foreground text-center" style={BODY}>
        Seus dados são tratados estritamente de acordo com a nossa{" "}
        <a href="/politica-de-privacidade" className="underline hover:text-foreground">
          Política de Privacidade (LGPD)
        </a>
        .
      </p>
    </form>
  );
}
