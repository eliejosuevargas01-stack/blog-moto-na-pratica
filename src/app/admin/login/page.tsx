"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../../actions";
import { TEKO, BODY } from "../../data";
import { Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        // Redireciona para o painel principal do admin
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao tentar logar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={BODY}>
      <div className="w-full max-w-[420px] bg-card border border-border p-8 rounded-sm shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="block w-1.5 h-6 bg-primary" />
            <span style={TEKO} className="text-[28px] font-semibold uppercase tracking-wide text-foreground">
              MOTO <span className="text-primary">NA PRÁTICA</span>
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground uppercase tracking-widest">Painel Administrativo</p>
        </div>

        {error && (
          <div className="bg-primary/10 border border-primary/20 text-foreground text-[13px] px-4 py-3 rounded-sm mb-6 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Usuário</label>
            <div className="relative flex items-center bg-[#222222] border border-border rounded-sm">
              <User size={15} className="absolute left-3 text-muted-foreground" />
              <input
                required
                type="text"
                name="username"
                placeholder="Ex: admin"
                className="w-full bg-transparent text-[14px] text-foreground pl-10 pr-4 py-2.5 outline-none focus:border-primary/50 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Senha</label>
            <div className="relative flex items-center bg-[#222222] border border-border rounded-sm">
              <Lock size={15} className="absolute left-3 text-muted-foreground" />
              <input
                required
                type="password"
                name="password"
                placeholder="Sua senha secreta"
                className="w-full bg-transparent text-[14px] text-foreground pl-10 pr-4 py-2.5 outline-none focus:border-primary/50 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            style={TEKO}
            className="w-full bg-primary hover:bg-[#E05300] text-white text-[19px] font-medium uppercase tracking-widest py-2.5 transition-colors mt-6 block disabled:bg-primary/60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
