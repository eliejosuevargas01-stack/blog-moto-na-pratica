"use client";

import { useState } from "react";
import { Heart, Share2, Copy, Check, MessageCircle, Twitter, Facebook } from "lucide-react";

interface PostActionsBarProps {
  postId: string;
  postTitle: string;
  initialLikes?: number;
}

export default function PostActionsBar({ postId, postTitle, initialLikes = 0 }: PostActionsBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`Confira este post no blog Moto na Prática: "${postTitle}"`);

  const handleLike = async () => {
    if (hasLiked || loadingLike) return;

    setLoadingLike(true);
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, postTitle }),
      });
    } catch (err) {
      console.error("Erro ao registrar curtida:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Registrar notificação de compartilhamento
      fetch("/api/posts/share-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, postTitle, network: "CopyLink" }),
      }).catch(() => {});
    }
  };

  const handleSocialClick = (network: string) => {
    fetch("/api/posts/share-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, postTitle, network }),
    }).catch(() => {});
  };

  return (
    <div className="bg-card border border-border p-4 my-8 flex flex-wrap items-center justify-between gap-4 rounded-sm">
      {/* Botão de Curtir */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold uppercase tracking-wider transition-all rounded-sm ${
            hasLiked
              ? "bg-primary text-white"
              : "bg-secondary hover:bg-primary/20 text-foreground border border-border hover:border-primary/40"
          }`}
        >
          <Heart size={16} className={hasLiked ? "fill-white" : "text-primary"} />
          <span>{hasLiked ? "Curtido" : "Curtir"}</span>
          <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded text-[11px]">{likes}</span>
        </button>
        <span className="text-[12px] text-muted-foreground hidden sm:inline">
          Gostou do conteúdo? Deixe seu apoio!
        </span>
      </div>

      {/* Botões de Compartilhamento */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
          <Share2 size={13} /> Compartilhar:
        </span>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("WhatsApp")}
          className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors rounded-sm"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle size={16} />
        </a>

        {/* Twitter / X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("X")}
          className="p-2 bg-secondary text-foreground hover:bg-white hover:text-black transition-colors rounded-sm"
          title="Compartilhar no X (Twitter)"
        >
          <Twitter size={16} />
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("Facebook")}
          className="p-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors rounded-sm"
          title="Compartilhar no Facebook"
        >
          <Facebook size={16} />
        </a>

        {/* Copiar Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-3 py-2 bg-secondary text-[12px] text-muted-foreground hover:text-foreground border border-border transition-colors rounded-sm"
          title="Copiar Link do Post"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400 font-semibold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
