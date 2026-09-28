"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEKO, BODY } from "../data";
import { 
  Plus, Trash2, Save, Upload, LogOut, FileText, Layout, ArrowLeft, 
  Eye, Edit, Wrench, Sliders, Bell, Mail, ArrowUp, ArrowDown, Users, Heart, Share2, Copy, Check, Lock, GripVertical,
  Globe, ChevronDown, ChevronUp, Languages, ExternalLink, CornerDownRight, Image as ImageIcon, Search, X
} from "lucide-react";
import { plugins } from "../../plugins";
import { 
  savePostAction, 
  deletePostAction, 
  savePageAction, 
  deletePageAction, 
  logoutAction,
  triggerN8nWebhook,
  triggerImprovePostAction,
  triggerImprovePostWithAIAction,
  triggerGenerateImagesAction,
  triggerCreateAudioAction,
  getNotificationsAction,
  getSubscribersAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction
} from "../actions";

interface AdminDashboardProps {
  initialPosts: any[];
  initialPages: any[];
}

function AudioDurationBadge({ url }: { url: string }) {
  const [duration, setDuration] = useState<string>("Calculando...");

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    const handleLoadedMetadata = () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.load();
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [url]);

  return (
    <span className="text-[10px] font-mono text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded-xs border border-primary/20">
      ⏱️ {duration}
    </span>
  );
}

interface StyledActionModalProps {
  modal: {
    isOpen: boolean;
    title: string;
    description: string;
    actionType: "update" | "img" | "audio";
    postData: any;
  } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

function StyledActionModal({ modal, onClose, onConfirm, loading }: StyledActionModalProps) {
  if (!modal || !modal.isOpen) return null;

  const isUpdate = modal.actionType === "update";
  const isImg = modal.actionType === "img";
  const isAudio = modal.actionType === "audio";

  const getBorderColor = () => {
    if (isUpdate) return "border-blue-500/50";
    if (isImg) return "border-purple-500/50";
    return "border-emerald-500/50";
  };

  const getBadgeStyle = () => {
    if (isUpdate) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (isImg) return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  };

  const getActionButtonStyle = () => {
    if (isUpdate) return "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20";
    if (isImg) return "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20";
    return "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-[#141414] border ${getBorderColor()} rounded-sm max-w-lg w-full p-6 space-y-6 shadow-2xl relative overflow-hidden transition-all duration-200`}>
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-xs ${getBadgeStyle()}`}>
              Automação Server-Side
            </span>
            <h3 style={TEKO} className="text-[26px] uppercase tracking-wide text-foreground mt-1">
              {modal.title}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground text-[18px] p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-[13px] text-muted-foreground leading-relaxed">
          <p>{modal.description}</p>
          
          <div className="bg-[#1A1A1A] p-4 border border-border/40 rounded-sm space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">Post Selecionado:</div>
            <div className="text-foreground font-semibold text-[14px]">{modal.postData?.title}</div>
            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
              <span>ID: {modal.postData?.id}</span>
              {modal.postData?.translationGroupId && (
                <span className="text-primary font-bold">| Grupo de Tradução: #{modal.postData.translationGroupId}</span>
              )}
            </div>
          </div>

          <div className="text-[12px] bg-amber-500/10 border border-amber-500/30 p-3 rounded-sm text-amber-300 space-y-1">
            <div className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>⚠️</span> Atenção aos Custos e Rate Limit
            </div>
            <p className="text-[11px] text-amber-200/90 leading-normal">
              Esta ação dispara um webhook no servidor (n8n) que consome créditos de IA e processamento em lote. Aguarde a conclusão antes de disparar novamente.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase tracking-wider rounded-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-[12px] font-bold uppercase tracking-wider rounded-sm shadow-md transition-all flex items-center gap-2 ${getActionButtonStyle()} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Disparo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FocalPointPickerProps {
  imageUrl: string;
  value?: string;
  onChange: (focalPoint: string) => void;
}

function FocalPointPicker({ imageUrl, value = "50% 50%", onChange }: FocalPointPickerProps) {
  const [focal, setFocal] = useState(value);

  useEffect(() => {
    setFocal(value || "50% 50%");
  }, [value]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    const newFocal = `${x}% ${y}%`;
    setFocal(newFocal);
    onChange(newFocal);
  };

  const [xPos, yPos] = focal.split(" ").map(p => parseFloat(p) || 50);

  const presets = [
    { label: "Topo", val: "50% 15%" },
    { label: "Centro", val: "50% 50%" },
    { label: "Base", val: "50% 85%" },
    { label: "Esquerda", val: "15% 50%" },
    { label: "Direita", val: "85% 50%" },
  ];

  return (
    <div className="space-y-3 bg-[#1A1A1A] p-4 border border-border/40 rounded-sm">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold block">
          Ponto Focal da Imagem (Enquadramento Dinâmico)
        </label>
        <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-xs">
          {focal}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Clique na imagem abaixo para definir o ponto de foco visual que não será cortado no mobile ou em cards:
      </p>

      <div 
        onClick={handleContainerClick}
        className="relative w-full h-[160px] bg-black rounded-sm border border-border/80 overflow-hidden cursor-crosshair select-none group"
      >
        <img 
          src={imageUrl} 
          alt="Visualizador Ponto Focal" 
          className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ objectPosition: focal }}
        />
        
        {/* Retículo do Ponto Focal */}
        <div 
          className="absolute w-6 h-6 border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-black/80 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-xs"
          style={{ left: `${xPos}%`, top: `${yPos}%` }}
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider self-center mr-1">Atalhos:</span>
        {presets.map(p => (
          <button
            key={p.val}
            type="button"
            onClick={() => {
              setFocal(p.val);
              onChange(p.val);
            }}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs border transition-colors ${
              focal === p.val 
                ? "bg-primary text-white border-primary" 
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function stripHtml(html?: any): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

function formatDate(dateInput?: any): string {
  if (!dateInput) return "Data não informada";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return String(dateInput);
  }
}

const DEFAULT_FALLBACK_PAGES = [
  {
    slug: "sobre",
    title: "Sobre o Moto na Prática",
    isStatic: true,
    content: "O Moto na Prática nasceu da paixão genuína por duas rodas e da constatação de uma carência: a falta de análises realmente independentes e sem viés comercial."
  },
  {
    slug: "politica-editorial",
    title: "Política Editorial",
    isStatic: true,
    content: "Nossa linha editorial preza pela independência rigorosa, transparência de patrocínios e avaliações mecânicas sem concessões."
  },
  {
    slug: "contato",
    title: "Contato & Redação",
    isStatic: true,
    content: "Dúvidas, sugestões de pautas ou feedbacks? Entre em contato com nossos editores e pilotos de teste."
  },
  {
    slug: "anuncie",
    title: "Mídia Kit & Publicidade",
    isStatic: true,
    content: "Conecte sua marca de motopeças, vestuário ou serviços a uma audiência qualificada e engajada de motociclistas."
  },
  {
    slug: "termos-de-uso",
    title: "Termos de Uso",
    isStatic: true,
    content: "Regulamento de utilização da plataforma, direitos autorais e limites de responsabilidade de tutoriais mecânicos."
  },
  {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    isStatic: true,
    content: "Saiba como tratamos e protegemos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD)."
  },
  {
    slug: "equipe",
    title: "Equipe Editorial & Ficha Técnica",
    isStatic: true,
    content: "Conheça os fundadores, pilotos e consultores mecânicos que produzem os testes e artigos do portal."
  }
];

function AdminDashboardContent({ initialPosts, initialPages }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "pages" | "settings" | "notifications" | "subscribers">("posts");
  const [posts, setPosts] = useState<any[]>(initialPosts || []);
  const [pages, setPages] = useState<any[]>(initialPages || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtros de listagem de posts
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Notificações e Assinantes
  const [notifications, setNotifications] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Carregar Notificações e Assinantes
  const fetchAuxiliaryData = async () => {
    try {
      const [notifRes, subRes] = await Promise.all([
        getNotificationsAction(),
        getSubscribersAction()
      ]);
      if (notifRes.success && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
      if (subRes.success && subRes.subscribers) {
        setSubscribers(subRes.subscribers);
      }
    } catch (e) {
      console.warn("Erro ao buscar dados auxiliares:", e);
    }
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  // Plugins Ativos
  const [activePlugins, setActivePlugins] = useState<Record<string, boolean>>(() => {
    const configPage = initialPages.find(p => p.slug === "config");
    const activeMap: Record<string, boolean> = {};
    
    plugins.forEach(p => {
      activeMap[p.id] = p.defaultActive;
    });

    if (configPage && configPage.content) {
      let contentObj: any = {};
      if (typeof configPage.content === "string") {
        try {
          contentObj = JSON.parse(configPage.content);
        } catch (e) {}
      } else if (typeof configPage.content === "object") {
        contentObj = configPage.content;
      }
      
      if (contentObj.activePlugins) {
        Object.keys(contentObj.activePlugins).forEach(key => {
          activeMap[key] = !!contentObj.activePlugins[key];
        });
      }
    }
    return activeMap;
  });

  const router = useRouter();

  const handleTogglePlugin = async (pluginId: string, checked: boolean) => {
    const updatedMap = {
      ...activePlugins,
      [pluginId]: checked
    };
    setActivePlugins(updatedMap);
    setLoading(true);
    setMessage(null);
    
    const existingConfigPage = pages.find(p => p.slug === "config") || {
      slug: "config",
      title: "Configurações do Sistema",
      isStatic: true,
      content: {}
    };

    const updatedConfigPage = {
      ...existingConfigPage,
      content: {
        ...((typeof existingConfigPage.content === "object" ? existingConfigPage.content : {}) as any),
        activePlugins: updatedMap
      }
    };

    const res = await savePageAction(updatedConfigPage);
    if (!res.error) {
      setPages(prev => {
        const idx = prev.findIndex(p => p.slug === "config");
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = updatedConfigPage;
          return copy;
        } else {
          return [...prev, updatedConfigPage];
        }
      });
      setMessage({ type: "success", text: "Recurso atualizado com sucesso!" });
    } else {
      setMessage({ type: "error", text: "Erro ao salvar configuração: " + res.error });
    }
    setLoading(false);
  };

  // --- CONTROLE DA GALERIA DE MÍDIAS / IMAGENS ---
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryTargetCallback, setGalleryTargetCallback] = useState<((url: string) => void) | null>(null);

  const openGalleryModal = (callback: (url: string) => void) => {
    setGalleryTargetCallback(() => (url: string) => callback(url));
    setIsGalleryModalOpen(true);
    setGalleryLoading(true);
    fetch("/api/upload")
      .then(res => res.json())
      .then(data => {
        if (data.images && Array.isArray(data.images)) {
          setGalleryImages(data.images);
        }
      })
      .catch(err => console.error("Erro ao carregar galeria:", err))
      .finally(() => setGalleryLoading(false));
  };

  const selectGalleryImage = (url: string) => {
    if (galleryTargetCallback) {
      galleryTargetCallback(url);
    }
    setIsGalleryModalOpen(false);
  };

  // --- CONTROLE DE POSTS ---
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    tag: "Reviews",
    category: "Reviews",
    excerpt: "",
    readTime: "5 min",
    img: "",
    imgFocalPoint: "50% 50%",
    audioUrl: "",
    status: "publicado",
    lang: "pt",
    translationGroupId: null as number | null,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    blocks: [] as Array<{ text: string; image?: string; focalPoint?: string; alt?: string }>,
  });

  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: "update" | "img" | "audio";
    postData: any;
  } | null>(null);

  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [draggableBlockIdx, setDraggableBlockIdx] = useState<number | null>(null);

  const movePostBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= postForm.blocks.length) return;
    const newBlocks = [...postForm.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    setPostForm({ ...postForm, blocks: newBlocks });
  };

  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === targetIndex) return;
    const newBlocks = [...postForm.blocks];
    const [dragged] = newBlocks.splice(draggedBlockIndex, 1);
    newBlocks.splice(targetIndex, 0, dragged);
    setPostForm({ ...postForm, blocks: newBlocks });
    setDraggedBlockIndex(null);
  };

  const handleAddPostBlock = () => {
    setPostForm({
      ...postForm,
      blocks: [...postForm.blocks, { text: "", image: "", focalPoint: "center", alt: "" }]
    });
  };

  const handleRemovePostBlock = (index: number) => {
    const newBlocks = postForm.blocks.filter((_, idx) => idx !== index);
    setPostForm({ ...postForm, blocks: newBlocks });
  };

  const handlePostBlockChange = (index: number, field: string, value: string) => {
    const newBlocks = [...postForm.blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setPostForm({ ...postForm, blocks: newBlocks });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    let parsedBlocks = [];
    if (post.blocks) {
      if (Array.isArray(post.blocks)) {
        parsedBlocks = post.blocks;
      } else if (typeof post.blocks === "string") {
        try {
          parsedBlocks = JSON.parse(post.blocks);
        } catch (e) {
          parsedBlocks = [];
        }
      }
    }

    setPostForm({
      title: post.title || "",
      slug: post.slug || "",
      tag: post.tag || "Reviews",
      category: post.category || "Reviews",
      excerpt: post.excerpt || "",
      readTime: post.readTime || "5 min",
      img: post.img || "",
      imgFocalPoint: post.imgFocalPoint || "50% 50%",
      audioUrl: post.audioUrl || "",
      status: post.status || "publicado",
      lang: post.lang || "pt",
      translationGroupId: post.translationGroupId || null,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || "",
      blocks: parsedBlocks,
    });
  };

  const handleCancelPostEdit = () => {
    setEditingPost(null);
    setPostForm({
      title: "",
      slug: "",
      tag: "Reviews",
      category: "Reviews",
      excerpt: "",
      readTime: "5 min",
      img: "",
      imgFocalPoint: "50% 50%",
      audioUrl: "",
      status: "publicado",
      lang: "pt",
      translationGroupId: null,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      blocks: [],
    });
  };

  const generateSlugFromTitle = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const slug = postForm.slug.trim() || generateSlugFromTitle(postForm.title);
    let postData = { ...postForm, slug };

    plugins.forEach(plugin => {
      const isActive = !!activePlugins[plugin.id];
      if (plugin.onBeforeSavePost) {
        postData = plugin.onBeforeSavePost(postData, isActive);
      }
    });

    const payload = {
      ...(editingPost ? { id: editingPost.id } : {}),
      ...postData
    };

    const res = await savePostAction(payload);
    if (!res.error) {
      setMessage({ type: "success", text: "Post salvo com sucesso!" });
      handleCancelPostEdit();
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Erro ao salvar post: " + res.error });
    }
    setLoading(false);
  };

  const handleDeletePost = async (id: number | string) => {
    if (!window.confirm("Tem certeza que deseja excluir este post? Todas as traduções vinculadas também serão excluídas.")) return;
    setLoading(true);
    setMessage(null);

    const res = await deletePostAction(id);
    if (!res.error) {
      setPosts(prev => prev.filter(p => p.id !== id && p.translationGroupId !== id));
      setMessage({ type: "success", text: "Post excluído com sucesso!" });
    } else {
      setMessage({ type: "error", text: "Erro ao excluir post: " + res.error });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        callback(data.url);
        setMessage({ type: "success", text: "Upload realizado com sucesso!" });
      } else {
        setMessage({ type: "error", text: "Erro no upload: " + (data.error || "Falha desconhecida") });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao conectar com servidor para upload." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={BODY}>
      {/* Top Header */}
      <header className="border-b border-border bg-[#141414] sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase tracking-wider transition-colors">
              <ArrowLeft size={16} /> Voltar ao Portal
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 style={TEKO} className="text-[24px] uppercase tracking-wide text-foreground">
                Painel Administrativo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logoutAction()}
              className="flex items-center gap-2 text-muted-foreground hover:text-red-400 text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 border border-border/80 hover:border-red-500/40 rounded-sm transition-all"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="border-b border-border bg-[#181818]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-4 text-[13px] font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "posts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText size={16} /> Posts & Notícias ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`py-4 text-[13px] font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "pages"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout size={16} /> Páginas Institucionais ({pages.length})
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-4 text-[13px] font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell size={16} /> Notificações ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`py-4 text-[13px] font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "subscribers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail size={16} /> Newsletter ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 text-[13px] font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders size={16} /> Funções & Configurações
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        {message && (
          <div className={`p-4 mb-6 rounded-sm text-[13px] font-semibold border ${
            message.type === "success" 
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60" 
              : "bg-red-950/40 text-red-300 border-red-800/60"
          }`}>
            {message.text}
          </div>
        )}

        {/* --- ABA 1: POSTS --- */}
        {activeTab === "posts" && (
          <div className="space-y-8">
            {/* Formulário de Criação/Edição */}
            <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary" />
                  <h2 style={TEKO} className="text-[24px] uppercase tracking-wide text-foreground">
                    {editingPost ? "Editar Post" : "Criar Novo Post"}
                  </h2>
                </div>
                {editingPost && (
                  <button
                    type="button"
                    onClick={handleCancelPostEdit}
                    className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Título do Post *</label>
                    <input
                      type="text"
                      required
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      placeholder="Ex: Análise Completa Yamaha FZ25 2026"
                      className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">URL Amigável (Slug)</label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="Deixe em branco para gerar do título"
                      className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 font-mono outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Categoria *</label>
                    <select
                      value={postForm.tag}
                      onChange={(e) => setPostForm({ ...postForm, tag: e.target.value, category: e.target.value })}
                      className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-3 py-2.5 outline-none focus:border-primary/50"
                    >
                      <option value="Reviews">Reviews</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Rotas">Rotas</option>
                      <option value="Equipamentos">Equipamentos</option>
                      <option value="Eventos">Eventos</option>
                      <option value="MotoGP">MotoGP</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Idioma *</label>
                    <select
                      value={postForm.lang}
                      onChange={(e) => setPostForm({ ...postForm, lang: e.target.value })}
                      className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-3 py-2.5 outline-none focus:border-primary/50"
                    >
                      <option value="pt">Português (PT)</option>
                      <option value="en">Inglês (EN)</option>
                      <option value="es">Espanhol (ES)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Tempo de Leitura</label>
                    {activePlugins["autoReadTime"] ? (
                      <div className="w-full bg-[#1A1A1A] border border-border rounded-sm text-[14px] text-muted-foreground px-4 py-2.5 select-none font-medium">
                        {(() => {
                          const plugin = plugins.find(p => p.id === "autoReadTime");
                          if (plugin && plugin.onBeforeSavePost) {
                            const tempPost = plugin.onBeforeSavePost(postForm, true);
                            return tempPost.readTime;
                          }
                          return "Calculando...";
                        })()} <span className="text-[11px] text-primary ml-1.5 uppercase font-bold">(Calculado Automaticamente)</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={postForm.readTime}
                        onChange={(e) => setPostForm({ ...postForm, readTime: e.target.value })}
                        placeholder="Ex: 5 min"
                        className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Status *</label>
                    <select
                      value={postForm.status}
                      onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                      className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground px-3 py-2.5 outline-none focus:border-primary/50"
                    >
                      <option value="publicado">Publicado</option>
                      <option value="em_edicao">Em Edição</option>
                      <option value="rascunho">Rascunho</option>
                      <option value="arquivado">Arquivado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Resumo / Gancho do Post *</label>
                  <textarea
                    rows={2}
                    required
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    placeholder="Breve descrição ou lead do artigo para cards e redes sociais"
                    className="w-full bg-[#181818] border border-border rounded-sm text-[14px] text-foreground p-3 outline-none focus:border-primary/50 resize-y"
                  />
                </div>

                {/* Imagem de Capa e Focal Point */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground">Imagem de Capa (Hero)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">URL da Imagem</label>
                      <input
                        type="url"
                        value={postForm.img}
                        onChange={(e) => setPostForm({ ...postForm, img: e.target.value })}
                        placeholder="https://images.unsplash.com/... ou URL /uploads/..."
                        className="w-full bg-[#181818] border border-border rounded-sm text-[13px] text-foreground px-4 py-2 font-mono outline-none focus:border-primary/50"
                      />

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold w-full">Upload Local</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, (url) => setPostForm({ ...postForm, img: url }))}
                          className="hidden"
                          id="hero-file-upload"
                        />
                        <label
                          htmlFor="hero-file-upload"
                          className="flex items-center gap-2 bg-secondary border border-border text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase tracking-wider px-4 py-2.5 cursor-pointer transition-colors"
                        >
                          <Upload size={14} /> Selecionar Arquivo
                        </label>

                        <button
                          type="button"
                          onClick={() => openGalleryModal((url) => setPostForm(prev => ({ ...prev, img: url })))}
                          className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-[12px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm transition-all shadow-sm"
                        >
                          <ImageIcon size={14} /> Escolher da Galeria
                        </button>

                        <span className="text-[12px] text-muted-foreground truncate max-w-[200px]">
                          {postForm.img ? "Imagem definida" : "Nenhuma imagem"}
                        </span>
                      </div>
                    </div>

                    <div>
                      {postForm.img && (
                        <FocalPointPicker
                          imageUrl={postForm.img}
                          value={postForm.imgFocalPoint}
                          onChange={(val) => setPostForm({ ...postForm, imgFocalPoint: val })}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Blocos de Conteúdo */}
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground">Blocos do Artigo ({postForm.blocks.length})</h3>
                      <p className="text-[12px] text-muted-foreground">Adicione parágrafos, subtítulos (H2/H3), imagens de seção e formatação rica em HTML.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPostBlock}
                      className="flex items-center gap-1.5 bg-secondary hover:bg-white/[0.04] text-foreground text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 border border-border rounded-sm transition-colors"
                    >
                      <Plus size={14} /> Adicionar Bloco
                    </button>
                  </div>

                  <div className="space-y-4">
                    {postForm.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        draggable={draggableBlockIdx === idx}
                        onDragStart={(e) => handleBlockDragStart(e, idx)}
                        onDragOver={(e) => handleBlockDragOver(e, idx)}
                        onDrop={(e) => handleBlockDrop(e, idx)}
                        onDragEnd={() => {
                          setDraggableBlockIdx(null);
                          setDraggedBlockIndex(null);
                        }}
                        className={`border p-6 bg-[#161616] rounded-sm space-y-4 relative transition-all ${
                          draggedBlockIndex === idx ? "border-primary opacity-50 bg-primary/10" : "border-border hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors"
                              title="Clique e arraste para mudar a posição deste bloco"
                              onMouseDown={() => setDraggableBlockIdx(idx)}
                              onMouseUp={() => setDraggableBlockIdx(null)}
                            >
                              <GripVertical size={18} />
                            </div>
                            <span style={TEKO} className="text-[17px] font-semibold text-primary uppercase">
                              Bloco #{idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => movePostBlock(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Mover para cima"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => movePostBlock(idx, "down")}
                              disabled={idx === postForm.blocks.length - 1}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Mover para baixo"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePostBlock(idx)}
                              className="p-1 text-red-400 hover:text-red-300 ml-2"
                              title="Remover Bloco"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] text-muted-foreground uppercase tracking-widest block font-bold">Conteúdo HTML do Bloco</label>
                          <textarea
                            rows={4}
                            value={block.text}
                            onChange={(e) => handlePostBlockChange(idx, "text", e.target.value)}
                            placeholder="<h2>Subtítulo</h2><p>Parágrafo explicativo...</p>"
                            className="w-full bg-[#1C1C1C] border border-border rounded-sm text-[13px] text-foreground p-3 font-mono outline-none focus:border-primary/50 resize-y"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] text-muted-foreground uppercase tracking-widest block font-bold">Imagem Opcional do Bloco</label>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`block-file-${idx}`}
                                onChange={(e) => handleFileUpload(e, (url) => handlePostBlockChange(idx, "image", url))}
                              />
                              <label
                                htmlFor={`block-file-${idx}`}
                                className="bg-secondary hover:bg-white/[0.04] text-muted-foreground hover:text-foreground text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-border rounded-sm cursor-pointer flex items-center gap-1.5 transition-all"
                              >
                                <Upload size={12} /> Upload
                              </label>
                              <button
                                type="button"
                                onClick={() => openGalleryModal((url) => handlePostBlockChange(idx, "image", url))}
                                className="flex items-center gap-1 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-[11px] font-bold uppercase tracking-wider px-2.5 py-2 rounded-sm transition-all shadow-sm"
                                title="Escolher imagem da galeria"
                              >
                                <ImageIcon size={12} /> Galeria
                              </button>
                              <input
                                type="text"
                                value={block.image || ""}
                                onChange={(e) => handlePostBlockChange(idx, "image", e.target.value)}
                                placeholder="https://... ou /uploads/..."
                                className="flex-1 bg-[#1C1C1C] border border-border rounded-sm text-[12px] text-foreground px-3 py-1.5 font-mono outline-none focus:border-primary/50"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] text-muted-foreground uppercase tracking-widest block font-bold">Texto Alternativo (Alt Text)</label>
                            <input
                              type="text"
                              value={block.alt || ""}
                              onChange={(e) => handlePostBlockChange(idx, "alt", e.target.value)}
                              placeholder="Descrição da imagem para SEO e acessibilidade"
                              className="w-full bg-[#1C1C1C] border border-border rounded-sm text-[12px] text-foreground px-3 py-1.5 outline-none focus:border-primary/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Salvar */}
                <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
                  {editingPost && (
                    <button
                      type="button"
                      onClick={handleCancelPostEdit}
                      className="px-6 py-2.5 border border-border text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase tracking-wider rounded-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[12px] font-bold uppercase tracking-wider px-8 py-2.5 rounded-sm transition-all shadow-md"
                  >
                    <Save size={16} /> {loading ? "Salvando..." : (editingPost ? "Atualizar Post" : "Publicar Post")}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Posts Cadastrados */}
            <div className="bg-card border border-border rounded-sm overflow-hidden space-y-4 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary" />
                  <h2 style={TEKO} className="text-[24px] uppercase tracking-wide text-foreground">
                    Artigos Cadastrados
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título ou slug..."
                    className="bg-[#181818] border border-border rounded-sm text-[12px] text-foreground px-3 py-1.5 outline-none focus:border-primary/50 min-w-[200px]"
                  />
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-[#181818] border border-border rounded-sm text-[12px] text-foreground px-2 py-1.5 outline-none focus:border-primary/50"
                  >
                    <option value="all">Todos Idiomas</option>
                    <option value="pt">Português (PT)</option>
                    <option value="en">Inglês (EN)</option>
                    <option value="es">Espanhol (ES)</option>
                  </select>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-[#181818] border border-border rounded-sm text-[12px] text-foreground px-2 py-1.5 outline-none focus:border-primary/50"
                  >
                    <option value="all">Todas Categorias</option>
                    <option value="Reviews">Reviews</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Rotas">Rotas</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Eventos">Eventos</option>
                    <option value="MotoGP">MotoGP</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-[#181818] text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                      <th className="p-3">Artigo</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Idioma</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {posts
                      .filter(p => {
                        if (selectedLang !== "all" && p.lang !== selectedLang) return false;
                        if (selectedTag !== "all" && p.tag !== selectedTag) return false;
                        if (searchQuery.trim()) {
                          const q = searchQuery.toLowerCase();
                          return (p.title || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((post) => (
                        <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-foreground text-[14px]">{post.title}</div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                              <span>/post/{post.slug}</span>
                              {post.translationGroupId && (
                                <span className="text-primary font-bold">| Grupo #{post.translationGroupId}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 border border-border rounded-xs">
                              {post.tag || post.category}
                            </span>
                          </td>
                          <td className="p-3 uppercase font-mono text-[11px] font-bold text-muted-foreground">
                            {post.lang || "pt"}
                          </td>
                          <td className="p-3">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
                              post.status === "publicado" 
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60"
                                : post.status === "em_edicao"
                                ? "bg-amber-950/40 text-amber-400 border-amber-800/60"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              {post.status || "publicado"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                title="Editar Post"
                              >
                                <Edit size={16} />
                              </button>
                              <Link
                                href={`/post/${post.slug}`}
                                target="_blank"
                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                title="Ver no Site"
                              >
                                <ExternalLink size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                                title="Excluir Post"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 2: PÁGINAS INSTITUCIONAIS --- */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Páginas Institucionais (E-E-A-T)</h2>
              <p className="text-[13px] text-muted-foreground">Gerencie o conteúdo estático, páginas de compliance e políticas do portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DEFAULT_FALLBACK_PAGES.map((defPage) => {
                const livePage = pages.find(p => p.slug === defPage.slug) || defPage;
                return (
                  <div key={defPage.slug} className="bg-card border border-border p-5 rounded-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h3 style={TEKO} className="text-[20px] uppercase text-foreground">{livePage.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">/{livePage.slug}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground line-clamp-3 leading-relaxed">
                      {typeof livePage.content === "string" ? livePage.content : JSON.stringify(livePage.content)}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Link
                        href={`/${livePage.slug}`}
                        target="_blank"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Visualizar <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- ABA 3: FUNÇÕES (CONFIGURAÇÕES DO SISTEMA) --- */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-3">
              <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Funções e Recursos Opcionais (Plugins)</h2>
              <p className="text-[13px] text-muted-foreground">Ative ou desative recursos especiais do sistema de forma modular.</p>
            </div>

            <div className="space-y-6">
              {plugins.map((plugin) => (
                <div key={plugin.id} className="bg-card border border-border p-6 rounded-sm space-y-4">
                  <div className="flex items-start justify-between gap-6 pb-4 border-b border-border/60">
                    <div className="space-y-1">
                      <h3 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground">{plugin.name}</h3>
                      <p className="text-[13px] text-muted-foreground max-w-[620px] leading-relaxed">
                        {plugin.description}
                      </p>
                    </div>
                    <div className="flex items-center pt-2">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={!!activePlugins[plugin.id]}
                          onChange={(e) => handleTogglePlugin(plugin.id, e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  {plugin.detailedDescription && (
                    <div className="text-[12px] text-muted-foreground bg-[#1A1A1A] p-4 border border-border/40 rounded-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: plugin.detailedDescription }} />
                  )}
                </div>
              ))}
            </div>

            {/* SEÇÃO DE INTEGRAÇÕES & WEBHOOKS */}
            <div className="border-t border-border pt-8 space-y-6">
              <div className="border-b border-border pb-3">
                <h3 style={TEKO} className="text-[24px] uppercase tracking-wide text-foreground">Integrações de Automação & Webhooks</h3>
                <p className="text-[13px] text-muted-foreground">Configurações de infraestrutura e disparo automatizado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Webhook N8N */}
                <div className="space-y-3">
                  <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Automação de Webhooks n8n</h4>
                  <p className="text-[12px] text-muted-foreground">
                    O endpoint do webhook é gerenciado exclusivamente no servidor via variável de ambiente <code className="text-foreground font-mono">N8N_WEBHOOK_URL</code>.
                  </p>
                </div>

                {/* Endpoint API de Automação */}
                <div className="space-y-3 bg-[#141414] p-4 border border-border/60 rounded-sm">
                  <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Endpoint de Automação API</h4>
                  <p className="text-[12px] text-muted-foreground">
                    Para fazer chamadas de criação automática de notícias (via n8n ou Python):
                  </p>
                  <div className="bg-black/50 p-2.5 rounded text-[11px] font-mono text-primary select-all border border-border/40">
                    POST /api/posts
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <p><strong>Header de Autenticação:</strong> <code className="text-foreground">x-api-key: &lt;API_SECRET_KEY&gt;</code></p>
                    <p><strong>Payload:</strong> Aceita o JSON exato com <code className="text-foreground">title, slug, tag, category, excerpt, readTime, img, blocks</code>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 4: NOTIFICAÇÕES --- */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Registro de Eventos & Notificações</h2>
                <p className="text-[13px] text-muted-foreground">Histórico de ações disparadas, respostas de IA e avisos de sistema.</p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={async () => {
                    await markAllNotificationsAsReadAction();
                    fetchAuxiliaryData();
                  }}
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p>Nenhuma notificação recente.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="bg-card border border-border p-4 rounded-sm flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[13px] text-foreground font-medium">{notif.message}</div>
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-3">
                        <span>Tipo: {notif.type}</span>
                        <span>{formatDate(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ABA 5: ASSINANTES NEWSLETTER --- */}
        {activeTab === "subscribers" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Assinantes da Newsletter ({subscribers.length})</h2>
              <p className="text-[13px] text-muted-foreground">Lista de e-mails cadastrados para receber novidades e atualizações.</p>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-[#181818] text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Data de Inscrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-foreground">{sub.email}</td>
                      <td className="p-3 text-muted-foreground text-[12px]">{formatDate(sub.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DE AÇÕES DE IA --- */}
      <StyledActionModal
        modal={activeModal}
        onClose={() => setActiveModal(null)}
        onConfirm={async () => {
          if (!activeModal) return;
          setLoading(true);
          try {
            if (activeModal.actionType === "update") {
              await triggerImprovePostWithAIAction({
                id: activeModal.postData.id,
                translationGroupId: activeModal.postData.translationGroupId,
                title: activeModal.postData.title,
                excerpt: activeModal.postData.excerpt,
                slug: activeModal.postData.slug,
                lang: activeModal.postData.lang,
                tag: activeModal.postData.tag,
                category: activeModal.postData.category,
                force: true
              });
            } else if (activeModal.actionType === "img") {
              await triggerGenerateImagesAction({
                id: activeModal.postData.id,
                translationGroupId: activeModal.postData.translationGroupId,
                title: activeModal.postData.title,
                excerpt: activeModal.postData.excerpt,
                blocks: activeModal.postData.blocks
              });
            } else if (activeModal.actionType === "audio") {
              await triggerCreateAudioAction({
                id: activeModal.postData.id,
                translationGroupId: activeModal.postData.translationGroupId,
                title: activeModal.postData.title,
                excerpt: activeModal.postData.excerpt,
                blocks: activeModal.postData.blocks
              });
            }
            setMessage({ type: "success", text: "Comando enviado com sucesso para o servidor!" });
            setActiveModal(null);
          } catch (e: any) {
            setMessage({ type: "error", text: "Erro ao executar ação: " + e.message });
          }
          setLoading(false);
        }}
        loading={loading}
      />

      {/* --- MODAL DE GALERIA DE IMAGENS --- */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-border rounded-sm max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-[#141414]">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-primary" size={20} />
                <h3 style={TEKO} className="text-[22px] uppercase tracking-wide text-foreground">
                  Galeria de Mídias & Imagens
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-sm transition-colors"
                title="Fechar Galeria"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-[#1A1A1A] flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Pesquisar imagem por nome ou URL..."
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground pl-9 pr-4 py-2 outline-none focus:border-primary/50"
                />
              </div>
              <span className="text-[12px] text-muted-foreground whitespace-nowrap font-mono hidden sm:inline">
                {galleryImages.length} imagens na biblioteca
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto min-h-[300px] bg-[#121212]">
              {galleryLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[12px]">Carregando imagens da galeria...</span>
                </div>
              ) : (
                (() => {
                  const filtered = galleryImages.filter(imgUrl =>
                    imgUrl.toLowerCase().includes(gallerySearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-muted-foreground space-y-2">
                        <ImageIcon size={32} className="mx-auto text-muted-foreground/40" />
                        <p className="text-[14px]">Nenhuma imagem encontrada.</p>
                        <p className="text-[12px] text-muted-foreground/60">Faça upload de uma imagem nova ou cole a URL externa.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filtered.map((imgUrl, index) => {
                        const filename = imgUrl.split("/").pop() || imgUrl;
                        return (
                          <div
                            key={index}
                            onClick={() => selectGalleryImage(imgUrl)}
                            className="group relative bg-[#1B1B1B] border border-border hover:border-primary rounded-sm overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-lg flex flex-col h-[135px]"
                          >
                            <div className="relative flex-1 bg-black/40 overflow-hidden flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300";
                                }}
                              />
                              <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-md">
                                  Usar esta Imagem
                                </span>
                              </div>
                            </div>
                            <div className="p-1.5 bg-[#161616] border-t border-border/50 text-[10px] text-muted-foreground truncate font-mono" title={imgUrl}>
                              {filename}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            <div className="p-3 border-t border-border bg-[#141414] flex justify-end">
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="px-4 py-2 bg-secondary border border-border text-muted-foreground hover:text-foreground text-[12px] font-bold uppercase rounded-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard(props: AdminDashboardProps) {
  return <AdminDashboardContent {...props} />;
}
