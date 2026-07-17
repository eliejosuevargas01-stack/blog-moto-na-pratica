"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, User as UserIcon, LogOut, Trash2, ShieldAlert } from "lucide-react";
import { TEKO, BODY } from "../data";

interface CommentUser {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: string;
  user: CommentUser;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [commentError, setCommentError] = useState("");
  
  // Auth Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Load user session and comments
  useEffect(() => {
    fetchSession();
    fetchComments();
  }, [postId]);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Erro ao obter sessão:", e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Erro ao buscar comentários:", e);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = authMode === "login" 
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.error) {
        setAuthError(data.error);
      } else if (data.success) {
        setUser(data.user);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setAuthError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId })
      });
      const data = await res.json();

      if (data.error) {
        setCommentError(data.error);
      } else if (data.success && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setContent("");
      }
    } catch (err) {
      setCommentError("Não foi possível enviar o comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Deseja deletar seu comentário?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(data.error || "Erro ao deletar comentário.");
      }
    } catch (err) {
      alert("Erro de conexão ao deletar comentário.");
    }
  };

  const getAvatarChar = (nameStr: string) => {
    return nameStr ? nameStr.trim().charAt(0).toUpperCase() : "?";
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="border-t border-border mt-14 pt-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-1 h-6 bg-primary" />
        <h3 style={TEKO} className="text-[24px] font-semibold uppercase tracking-wide flex items-center gap-2">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Auth and Comment Form Area */}
      <div className="bg-[#0A0A0A] border border-border/80 rounded-sm p-6 mb-10">
        {user ? (
          // Logged In Form
          <form onSubmit={handlePostComment} className="space-y-4">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Logado como <strong className="text-foreground">{user.name}</strong> ({user.email})</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-primary hover:underline transition-colors uppercase tracking-wider font-semibold"
              >
                <LogOut size={12} /> Sair
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Escreva seu comentário</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que você achou desse post? Deixe sua opinião..."
                rows={4}
                className="w-full bg-[#111111] border border-border rounded-sm text-[14px] p-3 outline-none focus:border-primary/50 text-foreground resize-none transition-colors"
                maxLength={1000}
              />
            </div>

            {commentError && (
              <div className="text-primary text-[12px] flex items-center gap-1.5 bg-primary/10 border border-primary/20 p-2.5 rounded-sm">
                <ShieldAlert size={14} /> {commentError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-primary hover:bg-[#c2181d] text-white text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors disabled:opacity-40 disabled:hover:bg-primary"
            >
              {loading ? "Enviando..." : "Publicar Comentário"}
            </button>
          </form>
        ) : (
          // Guest Box - Authentication Tabs
          <div>
            <div className="text-center mb-6">
              <h4 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground mb-1">
                Participe da discussão
              </h4>
              <p className="text-[12px] text-muted-foreground max-w-[400px] mx-auto">
                Faça login ou cadastre-se rapidamente para enviar seu comentário. É simples e leva menos de 1 minuto!
              </p>
            </div>

            <div className="flex border-b border-border/40 mb-6">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-2 text-center text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "login" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-2 text-center text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "register" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 max-w-[380px] mx-auto">
              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full bg-[#111111] border border-border rounded-sm text-[13px] px-3 py-2 outline-none focus:border-primary/50 text-foreground transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#111111] border border-border rounded-sm text-[13px] px-3 py-2 outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full bg-[#111111] border border-border rounded-sm text-[13px] px-3 py-2 outline-none focus:border-primary/50 text-foreground transition-colors"
                />
              </div>

              {authError && (
                <div className="text-primary text-[12px] flex items-center gap-1.5 bg-primary/10 border border-primary/20 p-2.5 rounded-sm">
                  <ShieldAlert size={14} /> {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#c2181d] text-white text-[12px] font-bold uppercase tracking-wider py-2.5 transition-colors"
              >
                {loading ? "Aguarde..." : authMode === "login" ? "Entrar e Comentar" : "Cadastrar e Comentar"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/60 rounded-sm">
            <MessageSquare size={32} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">Nenhum comentário por enquanto. Seja o primeiro a opinar!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && user.id === comment.userId;
            return (
              <div 
                key={comment.id} 
                className="flex items-start gap-4 p-4 border border-border/40 bg-[#0c0c0c] rounded-sm hover:border-border/80 transition-all duration-300"
              >
                {/* User Avatar Bubble */}
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-bold text-foreground">{getAvatarChar(comment.user?.name)}</span>
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-bold text-foreground">{comment.user?.name || "Usuário"}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Excluir Comentário"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[13.5px] text-[#BBBBBB] leading-relaxed break-words" style={BODY}>
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
