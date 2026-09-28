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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("No momento nosso sistema de formulário está passando por atualizações. Por favor, tente novamente mais tarde.");
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

      <div className="w-full text-center px-6 py-3.5 bg-muted text-muted-foreground text-[14px] font-semibold uppercase tracking-wider border border-border" style={TEKO}>
        Envio pelo site indisponível. Utilize nosso e-mail.
      </div>


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
