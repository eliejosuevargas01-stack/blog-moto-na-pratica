"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  savePostAction, 
  deletePostAction, 
  savePageAction, 
  deletePageAction, 
  logoutAction,
  getNotificationsAction,
  getSubscribersAction,
  markNotificationAsReadAction
} from "../actions";
import { TEKO, BODY } from "../data";
import { 
  Plus, Trash2, Save, Upload, LogOut, FileText, Layout, ArrowLeft, 
  Eye, Edit, Wrench, Sliders, Bell, Mail, ArrowUp, ArrowDown, Users, Heart, Share2, Copy, Check, Lock, GripVertical
} from "lucide-react";
import { plugins } from "../../plugins";


interface FocalPointPickerProps {
  imageUrl: string;
  value: string;
  onChange: (val: string) => void;
}

function FocalPointPicker({ imageUrl, value, onChange }: FocalPointPickerProps) {
  let posX = 50;
  let posY = 50;

  if (value) {
    if (value === "center") {
      posX = 50;
      posY = 50;
    } else if (value === "top") {
      posX = 50;
      posY = 0;
    } else if (value === "bottom") {
      posX = 50;
      posY = 100;
    } else if (value === "left") {
      posX = 0;
      posY = 50;
    } else if (value === "right") {
      posX = 100;
      posY = 50;
    } else if (value.includes("%")) {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 2) {
        posX = parseFloat(parts[0]);
        posY = parseFloat(parts[1]);
      } else if (parts.length === 1) {
        posX = parseFloat(parts[0]);
        posY = 50;
      }
    }
  }

  if (isNaN(posX)) posX = 50;
  if (isNaN(posY)) posY = 50;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    onChange(`${x}% ${y}%`);
  };

  if (!imageUrl) {
    return (
      <div className="w-full h-32 border border-dashed border-border flex items-center justify-center text-[13px] text-muted-foreground bg-[#1A1A1A] rounded-sm">
        Insira uma URL de imagem válida para definir o ponto focal
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Clique na imagem abaixo para definir o ponto focal (X: {posX}%, Y: {posY}%)</span>
        <button
          type="button"
          onClick={() => onChange("50% 50%")}
          className="text-primary hover:underline text-[10px] uppercase font-bold"
        >
          Resetar ao Centro
        </button>
      </div>

      <div 
        onClick={handleImageClick}
        className="relative w-full h-48 border border-border overflow-hidden bg-[#222222] rounded-sm cursor-crosshair group select-none"
      >
        <img
          src={imageUrl}
          alt="Ponto Focal Editor"
          className="w-full h-full object-cover pointer-events-none opacity-90 transition-opacity group-hover:opacity-100"
          style={{ objectPosition: `${posX}% ${posY}%` }}
        />

        {/* 3x3 Grid Overlay (Régua de terços) */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/5 opacity-40 group-hover:opacity-80 transition-opacity">
          <div className="border-r border-b border-dashed border-white/20"></div>
          <div className="border-r border-b border-dashed border-white/20"></div>
          <div className="border-b border-dashed border-white/20"></div>
          <div className="border-r border-b border-dashed border-white/20"></div>
          <div className="border-r border-b border-dashed border-white/20"></div>
          <div className="border-b border-dashed border-white/20"></div>
          <div className="border-r border-dashed border-white/20"></div>
          <div className="border-r border-dashed border-white/20"></div>
          <div></div>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white/80 font-mono pointer-events-none">
          {posX}% {posY}%
        </div>

        {/* Target Bullseye Marker */}
        <div 
          className="absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none flex items-center justify-center transition-all duration-150"
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          </div>
          <div className="absolute w-8 h-0.5 bg-primary/40"></div>
          <div className="absolute h-8 w-0.5 bg-primary/40"></div>
        </div>
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

const DEFAULT_FALLBACK_PAGES = [
  {
    id: "fallback-home",
    slug: "home",
    title: "Página Inicial",
    isStatic: true,
    content: {
      heroTitle: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
      heroSubtitle: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
      heroImage: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format",
      heroFocalPoint: "center",
      breakingText: "Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?",
      breakingSlug: "michelin-pilot-street-2-fazer",
      bannerTitle: "Yamaha FZ25 · Solid Grey 2026",
      bannerSubtitle: "3.500 km rodados · Motor 249cc · Minha companheira diária",
      bannerImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1400&h=500&fit=crop&auto=format",
      bannerFocalPoint: "center"
    },
    seoTitle: "Moto na Prática - Blog de Motos, Dicas e Reviews",
    seoDescription: "Blog de motociclista sobre a Yamaha Fazer 250 Solid Grey 2026. Reviews honestas de equipamentos, dicas de manutenção e relatos de rotas reais."
  },
  {
    id: "fallback-sobre",
    slug: "sobre",
    title: "Sobre o Blog",
    isStatic: true,
    content: {
      heroTitle: "O blog e o motociclista",
      heroDescription: "Sem patrocínio, sem jabá. Só experiência real de quem usa moto todo dia.",
      heroImage: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=500&fit=crop&auto=format",
      heroFocalPoint: "center",
      stats: [
        { value: "3.500 km", label: "Rodados na FZ25", iconName: "Gauge" },
        { value: "Jan 2026", label: "Início com a moto", iconName: "Calendar" },
        { value: "Gaspar - SC", label: "Base de operações", iconName: "MapPin" },
        { value: "5", label: "Manutenções feitas em casa", iconName: "Wrench" }
      ],
      bioTitle: "Quem escreve aqui",
      bioContentHtml: `<p class="mb-4">Me chamo Eliezer, moro em Gaspar - SC. Comecei a andar de moto e a partir daí não parei mais.</p>\n<p class="mb-4">Em janeiro de 2025 dei o salto para a Fazer 250 Solid Grey, a versão nova. Foi a maior compra que já fiz relacionada a moto e, com ela, veio a vontade de registrar tudo — as dúvidas, os erros, as descobertas.</p>\n<p class="mb-4">O <span class="text-foreground font-semibold">Moto na Prática</span> nasceu disso. Não sou mecânico, não sou piloto profissional, não tenho patrocínio. Sou apenas alguém que usa moto todo dia e quer compartilhar o que aprende.</p>\n<p class="mb-4">Aqui você vai encontrar reviews de coisas que comprei com o meu dinheiro, manutenções que fiz na garagem, rotas que percorri e dicas que aprendi na raça. Nada de conteúdo pago ou postagem encomendada.</p>`,
      bioQuote: "Se você está pensando em comprar uma moto, já tem uma ou só curte o assunto — esse blog é pra você.",
      riderImage: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format",
      riderFocalPoint: "center",
      motoTitle: "Minha moto",
      motoSpecsTitle: "Yamaha FZ25 Solid Grey 2026",
      motoImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=700&fit=crop&auto=format",
      motoFocalPoint: "center",
      motoSpecs: [
        { name: "Motor", value: "249cc, monocilíndrico, SOHC" },
        { name: "Potência", value: "20,9 cv @ 8.000 rpm" },
        { name: "Torque", value: "2,1 kgf.m @ 6.500 rpm" },
        { name: "Tanque", value: "13 litros" },
        { name: "Peso", value: "154 kg (abastecida)" },
        { name: "Cor", value: "Solid Grey (exclusiva 2026)" }
      ]
    },
    seoTitle: "Sobre o Eliezer e a Fazer 250 - Moto na Prática",
    seoDescription: "Conheça o Eliezer, criador do Moto na Prática, e veja a ficha técnica detalhada da Yamaha FZ25 Solid Grey 2026 do blog."
  },
  {
    id: "fallback-reviews",
    slug: "reviews",
    title: "Reviews",
    isStatic: true,
    content: {
      description: "Reviews honestos de peças, acessórios e motos feitos por quem usa no dia a dia, sem patrocínio.",
      heroImg: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1200&h=680&fit=crop&auto=format",
      iconName: "Star"
    },
    seoTitle: "Reviews de Motos e Equipamentos - Moto na Prática",
    seoDescription: "Opiniões sinceras e testes reais de longa duração com motos, pneus, peças e vestuário motociclístico."
  },
  {
    id: "fallback-manutencao",
    slug: "manutencao",
    title: "Manutenção",
    isStatic: true,
    content: {
      description: "Dicas passo a passo de manutenção preventiva, troca de componentes e cuidados essenciais com a moto.",
      heroImg: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1200&h=680&fit=crop&auto=format",
      iconName: "Wrench"
    },
    seoTitle: "Dicas de Manutenção de Motocicleta - Moto na Prática",
    seoDescription: "Guia completo de como cuidar e fazer a manutenção preventiva na sua moto em casa e gastando pouco."
  },
  {
    id: "fallback-rotas",
    slug: "rotas",
    title: "Rotas",
    isStatic: true,
    content: {
      description: "Relatos de viagens, rotas para motociclistas, condições de estrada e pontos turísticos imperdíveis.",
      heroImg: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1200&h=680&fit=crop&auto=format",
      iconName: "Navigation"
    },
    seoTitle: "Rotas de Moto e Viagens - Moto na Prática",
    seoDescription: "As melhores estradas para rodar de moto, roteiros turísticos, motoviagem e relatos de rotas pelo Brasil."
  },
  {
    id: "fallback-equipamentos",
    slug: "equipamentos",
    title: "Equipamentos",
    isStatic: true,
    content: {
      description: "Avaliações detalhadas de jaquetas, capacetes, luvas e tudo que você precisa para rodar com segurança.",
      heroImg: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1200&h=680&fit=crop&auto=format",
      iconName: "ShieldCheck"
    },
    seoTitle: "Equipamentos de Segurança para Motociclista - Moto na Prática",
    seoDescription: "Reviews sinceros de capacetes, jaquetas, luvas, botas e proteção para o piloto no dia a dia ou viagens."
  }
];

interface AdminDashboardProps {
  initialPosts: any[];
  initialPages: any[];
}

export default function AdminDashboard({ initialPosts, initialPages }: AdminDashboardProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [pages, setPages] = useState(initialPages.length > 0 ? initialPages : DEFAULT_FALLBACK_PAGES);
  const [activeTab, setActiveTab] = useState<"posts" | "pages" | "settings" | "notifications">("posts");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>(() => {
    const configPage = initialPages.find(p => p.slug === "config");
    if (configPage && configPage.content) {
      const content = typeof configPage.content === "string" ? JSON.parse(configPage.content) : configPage.content;
      return content.n8nWebhookUrl || "";
    }
    return "";
  });

  useEffect(() => {
    // Carregar notificações e inscritos
    getNotificationsAction().then(res => {
      if (res.success && res.notifications) setNotifications(res.notifications);
    });
    getSubscribersAction().then(res => {
      if (res.success && res.subscribers) setSubscribers(res.subscribers);
    });
  }, []);


  const [activePlugins, setActivePlugins] = useState<Record<string, boolean>>(() => {
    const configPage = initialPages.find(p => p.slug === "config");
    const activeMap: Record<string, boolean> = {};
    
    // Set defaults from registry
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
      } else if (typeof contentObj.autoReadTime === "boolean") {
        // Fallback for legacy database settings
        activeMap["autoReadTime"] = contentObj.autoReadTime;
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
      setMessage({ type: "success", text: `Recurso atualizado com sucesso!` });
    } else {
      setMessage({ type: "error", text: "Erro ao salvar configuração: " + res.error });
    }
    setLoading(false);
  };

  // --- CONTROLE DE POSTS ---
  const [editingPost, setEditingPost] = useState<any | null>(null); // null significa listagem, {} significa novo post
  const [postForm, setPostForm] = useState({
    id: "",
    title: "",
    slug: "",
    tag: "Review",
    category: "Reviews",
    excerpt: "",
    readTime: "5 min",
    img: "",
    imgFocalPoint: "center",
    blocks: [
      { text: "", image: "", focalPoint: "center" },
      { text: "", image: "", focalPoint: "center" },
      { text: "", image: "", focalPoint: "center" }
    ],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: ""
  });

  // --- CONTROLE DE PÁGINAS ---
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("");
  const [editingPage, setEditingPage] = useState<any | null>(null);

  // --- FUNÇÕES DE ARQUIVO ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        callback(data.url);
        setMessage({ type: "success", text: "Imagem enviada com sucesso!" });
      } else {
        setMessage({ type: "error", text: data.error || "Erro no upload." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao enviar arquivo." });
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES DE POSTS ---
  const startNewPost = () => {
    setPostForm({
      id: "",
      title: "",
      slug: "",
      tag: "Review",
      category: "Reviews",
      excerpt: "",
      readTime: "5 min",
      img: "",
      imgFocalPoint: "center",
      blocks: [
        { text: "", image: "", focalPoint: "center" },
        { text: "", image: "", focalPoint: "center" },
        { text: "", image: "", focalPoint: "center" }
      ],
      seoTitle: "",
      seoDescription: "",
      seoKeywords: ""
    });
    setEditingPost({});
    setMessage(null);
  };

  const startEditPost = (post: any) => {
    let parsedBlocks = [];
    if (Array.isArray(post.blocks)) {
      parsedBlocks = post.blocks;
    } else {
      try {
        parsedBlocks = JSON.parse(post.blocks);
      } catch (e) {
        parsedBlocks = [];
      }
    }

    // Garantir pelo menos 3 blocos
    while (parsedBlocks.length < 3) {
      parsedBlocks.push({ text: "", image: "", focalPoint: "center" });
    }

    setPostForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      tag: post.tag,
      category: post.category || "Reviews",
      excerpt: post.excerpt,
      readTime: post.readTime,
      img: post.img,
      imgFocalPoint: post.imgFocalPoint || "center",
      blocks: parsedBlocks,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || ""
    });
    setEditingPost(post);
    setMessage(null);
  };

  const handlePostBlockChange = (index: number, field: string, value: string) => {
    const updatedBlocks = [...postForm.blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setPostForm({ ...postForm, blocks: updatedBlocks });
  };
function BlockLinkMapper({
  text,
  blockIndex,
}: {
  text: string;
  blockIndex: number;
}) {
  const [links, setLinks] = useState<{ text: string; href: string }[]>([]);
  const [tick, setTick] = useState(0);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const id = setTimeout(() => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text || "", "text/html");
        const nodeList = Array.from(doc.querySelectorAll("a"));
        const parsed = nodeList.map((a) => ({ text: a.textContent || "", href: a.getAttribute("href") || "" }));
        if (mounted) {
          setLinks(parsed);
          const init = parsed.map((pl) => {
            const match = posts.find((p) => `/post/${p.slug}` === pl.href || p.slug === pl.href);
            return match ? match.slug : "";
          });
          setSelectedSlugs(init);
        }
      } catch (e) {
        const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
        const parsed: { text: string; href: string }[] = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(text || "")) !== null) {
          parsed.push({ href: m[1], text: m[2].replace(/<[^>]*>/g, "") });
        }
        if (mounted) {
          setLinks(parsed);
          const init = parsed.map((pl) => {
            const match = posts.find((p) => `/post/${p.slug}` === pl.href || p.slug === pl.href);
            return match ? match.slug : "";
          });
          setSelectedSlugs(init);
        }
      }
    }, 300);
    return () => {
      mounted = false;
      clearTimeout(id);
    };
  }, [text, tick]);

  if (!links || links.length === 0) return null;

  const handleSelectChange = (linkIdx: number, val: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text || "", "text/html");
      const nodeList = Array.from(doc.querySelectorAll("a"));
      const target = nodeList[linkIdx];
      if (!target) return;
      if (!val) {
        // mantém original
      } else {
        target.setAttribute("href", `/post/${val}`);
      }
      const newHtml = doc.body.innerHTML;
      handlePostBlockChange(blockIndex, "text", newHtml);
      setSelectedSlugs((prev) => {
        const copy = [...prev];
        copy[linkIdx] = val;
        return copy;
      });
      setTick((t) => t + 1);
    } catch (e) {
      // noop
    }
  };

  return (
    <div className="mt-3 bg-[#0F0F0F] border border-border/30 p-3 rounded-sm">
      <div className="text-[12px] text-muted-foreground uppercase font-bold mb-2">Links encontrados neste bloco</div>
      <div className="space-y-3">
        {links.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_220px] gap-3 items-center">
            <div>
              <div className="text-[13px] text-foreground font-semibold break-words">{l.text || "(sem texto)"}</div>
              <div className="text-[12px] text-muted-foreground font-mono break-words">{l.href}</div>
            </div>
            <div className="flex justify-end">
              <select
                value={selectedSlugs[i] || ""}
                onChange={(e) => handleSelectChange(i, e.target.value)}
                className="w-full bg-[#111111] border border-border rounded-sm text-[12px] text-foreground px-3 py-2"
              >
                <option value="">Manter link padrão/original</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.slug}>{stripHtml(p.title)}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  const addBlock = () => {
    setPostForm({
      ...postForm,
      blocks: [...postForm.blocks, { text: "", image: "", focalPoint: "center" }]
    });
  };

  const removeBlock = (index: number) => {
    if (postForm.blocks.length <= 3) {
      alert("O post deve conter pelo menos 3 blocos de conteúdo.");
      return;
    }
    const updatedBlocks = [...postForm.blocks];
    updatedBlocks.splice(index, 1);
    setPostForm({ ...postForm, blocks: updatedBlocks });
  };

  // --- REORDENAÇÃO DE BLOCOS DE POSTS (SUBIR, DESCER & DRAG AND DROP) ---
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [draggableBlockIdx, setDraggableBlockIdx] = useState<number | null>(null);

  const movePostBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= postForm.blocks.length) return;
    const updatedBlocks = [...postForm.blocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[targetIndex];
    updatedBlocks[targetIndex] = temp;
    setPostForm({ ...postForm, blocks: updatedBlocks });
  };

  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === targetIndex) return;

    const updatedBlocks = [...postForm.blocks];
    const [removed] = updatedBlocks.splice(draggedBlockIndex, 1);
    updatedBlocks.splice(targetIndex, 0, removed);

    setPostForm({ ...postForm, blocks: updatedBlocks });
    setDraggedBlockIndex(null);
  };


  const generateSlugFromTitle = (titleStr: string) => {
    const cleanTitle = stripHtml(titleStr);
    return cleanTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const slug = postForm.slug.trim() || generateSlugFromTitle(postForm.title);
    let postData = { ...postForm, slug };
    // Run hooks from registry plugins
    plugins.forEach(plugin => {
      const isActive = !!activePlugins[plugin.id];
      if (plugin.onBeforeSavePost) {
        postData = plugin.onBeforeSavePost(postData, isActive);
      }
    });

    const res = await savePostAction(postData);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Post salvo com sucesso!" });
      // Atualizar lista local
      const refreshRes = await fetch("/api/posts-refresh"); // podemos atualizar puxando a página de novo
      router.refresh();
      setTimeout(() => {
        setEditingPost(null);
        window.location.reload();
      }, 1000);
    }
    setLoading(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Deseja realmente excluir este post? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    const res = await deletePostAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      alert("Post excluído com sucesso!");
      window.location.reload();
    }
    setLoading(false);
  };

  // --- AÇÕES DE PÁGINAS ---
  const handleSelectPage = (slug: string) => {
    setSelectedPageSlug(slug);
    if (!slug) {
      setEditingPage(null);
      return;
    }

    const page = pages.find(p => p.slug === slug);
    if (page) {
      let content = page.content;
      if (typeof content === "string") {
        try {
          content = JSON.parse(content);
        } catch (e) {
          content = {};
        }
      }
      setEditingPage({
        id: page.id,
        slug: page.slug,
        title: page.title,
        isStatic: page.isStatic,
        content: content,
        seoTitle: page.seoTitle || "",
        seoDescription: page.seoDescription || ""
      });
    } else {
      // Nova página customizada
      setEditingPage({
        id: "",
        slug: slug === "new" ? "" : slug,
        title: "",
        isStatic: false,
        content: { bodyHtml: "" },
        seoTitle: "",
        seoDescription: ""
      });
    }
    setMessage(null);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await savePageAction(editingPage);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Página salva com sucesso!" });
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    setLoading(false);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta página customizada?")) return;
    setLoading(true);
    const res = await deletePageAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      alert("Página excluída!");
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12" style={BODY}>
      
      {/* HEADER DO PAINEL */}
      <div className="flex items-center justify-between border-b border-border pb-6 mb-10">
        <div>
          <h1 style={TEKO} className="text-[44px] font-semibold uppercase leading-none tracking-wide text-foreground">
            <span className="text-primary">Palien</span> CMS
          </h1>
          <p className="text-[12px] text-muted-foreground uppercase tracking-widest mt-1.5">Gerencie posts, imagens e páginas</p>
        </div>
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-1.5 bg-secondary hover:bg-red-950/30 hover:text-primary text-[12px] font-bold uppercase tracking-wider px-4 py-2 border border-border transition-colors text-muted-foreground"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>

      {/* MENSAGEM GLOBAL */}
      {message && (
        <div className={`p-4 rounded-sm mb-8 text-[13px] border ${
          message.type === "success" 
            ? "bg-green-950/20 border-green-800/40 text-green-400" 
            : "bg-primary/10 border-primary/20 text-primary"
        }`}>
          {message.text}
        </div>
      )}

      {/* ABAS SELETORAS (SE NÃO ESTIVER EDITANDO NADA) */}
      {!editingPost && !editingPage && (
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("posts")}
            style={TEKO}
            className={`px-6 py-2.5 text-[20px] font-medium uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "posts" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2"><FileText size={16} /> Gerar Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            style={TEKO}
            className={`px-6 py-2.5 text-[20px] font-medium uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "pages" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2"><Layout size={16} /> Editar Páginas</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            style={TEKO}
            className={`px-6 py-2.5 text-[20px] font-medium uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "notifications" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2 relative">
              <Bell size={16} /> Notificações & Métricas
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            style={TEKO}
            className={`px-6 py-2.5 text-[20px] font-medium uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "settings" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2"><Sliders size={16} /> Funções</span>
          </button>
        </div>
      )}


      {/* --- ABA 1: GERENCIAR POSTS --- */}
      {activeTab === "posts" && !editingPost && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Todos os Artigos</h2>
            <button
              onClick={startNewPost}
              className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[13px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors"
            >
              <Plus size={15} /> Novo Artigo
            </button>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-[#1A1A1A] text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 font-semibold">Título</th>
                    <th className="p-4 font-semibold">Categoria</th>
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-foreground">{stripHtml(post.title)}</td>
                      <td className="p-4 text-muted-foreground">{post.tag}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => startEditPost(post)}
                          className="inline-flex items-center gap-1 bg-secondary hover:bg-primary/20 hover:text-primary border border-border p-1.5 rounded-sm text-muted-foreground transition-colors"
                          title="Editar"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="inline-flex items-center gap-1 bg-secondary hover:bg-primary hover:text-white border border-border p-1.5 rounded-sm text-muted-foreground transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Nenhum post cadastrado. Clique em "Novo Artigo" para começar!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- EDITAR/CRIAR POST --- */}
      {editingPost && (
        <form onSubmit={handleSavePost} className="space-y-8 bg-card border border-border p-8 rounded-sm">
          <div className="flex items-center gap-3 border-b border-border pb-5 mb-5">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="p-1.5 bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-sm transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">
              {postForm.id ? "Editar Artigo" : "Novo Artigo"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Título do Post</label>
              <input
                required
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="Ex: Fazer 250 Solid Grey 2026: 6 meses de uso real"
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Slug URL (Opcional - Gerado Automático)</label>
              <input
                type="text"
                value={postForm.slug}
                onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                placeholder="Ex: fazer-250-solid-grey-2026"
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Tag Principal (Categoria URL)</label>
              <select
                value={postForm.tag}
                onChange={(e) => setPostForm({ ...postForm, tag: e.target.value, category: e.target.value + "s" })}
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
              >
                <option value="Review">Review</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Rotas">Rotas</option>
                <option value="Equipamentos">Equipamentos</option>
              </select>
            </div>

            <div className="space-y-1.5">
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
                  required
                  type="text"
                  value={postForm.readTime}
                  onChange={(e) => setPostForm({ ...postForm, readTime: e.target.value })}
                  placeholder="Ex: 8 min"
                  className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Resumo / Excerpt</label>
            <textarea
              required
              rows={2}
              value={postForm.excerpt}
              onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
              placeholder="Uma descrição curta que aparece na página inicial e nos resultados do Google."
              className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
            />
          </div>

          {/* HERO IMAGE + FOCAL POINT */}
          <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
            <h3 style={TEKO} className="text-[19px] uppercase tracking-wide border-b border-border pb-2 text-foreground">
              Imagem de Destaque / Hero
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Upload Local</label>
                <div className="flex items-center gap-3">
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
                  <span className="text-[12px] text-muted-foreground truncate max-w-[200px]">
                    {postForm.img ? "Upload ativo" : "Nenhum arquivo enviado"}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2.5">
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Ou insira a URL da Imagem Externa</label>
                  <input
                    type="text"
                    value={postForm.img}
                    onChange={(e) => setPostForm({ ...postForm, img: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Ponto Focal da Imagem (Ajuste Visual)</label>
                <FocalPointPicker
                  imageUrl={postForm.img}
                  value={postForm.imgFocalPoint}
                  onChange={(val) => setPostForm({ ...postForm, imgFocalPoint: val })}
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT BLOCKS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 style={TEKO} className="text-[22px] uppercase tracking-wide text-foreground">
                Blocos de Conteúdo
              </h3>
              <button
                type="button"
                onClick={addBlock}
                className="flex items-center gap-1.5 bg-secondary hover:bg-white/[0.04] text-[12px] font-bold uppercase tracking-wider px-3.5 py-2 border border-border rounded-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <Plus size={13} /> Adicionar Bloco
              </button>
            </div>

            <div className="space-y-6">
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
                        Bloco {idx + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        (Arraste o ícone à esquerda para reposicionar)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePostBlock(idx, "up")}
                        className="px-2 py-1 bg-secondary border border-border text-[11px] uppercase font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 rounded-sm flex items-center gap-1"
                        title="Mover bloco para cima"
                      >
                        <ArrowUp size={12} /> Subir
                      </button>

                      <button
                        type="button"
                        disabled={idx === postForm.blocks.length - 1}
                        onClick={() => movePostBlock(idx, "down")}
                        className="px-2 py-1 bg-secondary border border-border text-[11px] uppercase font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 rounded-sm flex items-center gap-1"
                        title="Mover bloco para baixo"
                      >
                        <ArrowDown size={12} /> Descer
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBlock(idx)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 ml-2"
                        title="Deletar Bloco"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">
                        Conteúdo HTML
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={block.text}
                        onChange={(e) => handlePostBlockChange(idx, "text", e.target.value)}
                        placeholder="Cole aqui o HTML do bloco: <h2>, <p>, <figure>, <a> etc."
                        className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground p-3 outline-none focus:border-primary/50"
                      />
                      {/* Seletor dinâmico de links encontrado neste bloco */}
                      <BlockLinkMapper text={block.text} blockIndex={idx} />
                    </div>

                    <div className="space-y-3 bg-[#202020] p-4 border border-border/40 rounded-sm">
                      <label className="text-[11px] text-muted-foreground uppercase tracking-widest block font-bold">Imagem do Bloco (Opcional)</label>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, (url) => handlePostBlockChange(idx, "image", url))}
                          className="hidden"
                          id={`block-file-upload-${idx}`}
                        />
                        <label
                          htmlFor={`block-file-upload-${idx}`}
                          className="flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#353535] text-[11px] font-bold uppercase tracking-wider px-3 py-2 cursor-pointer transition-colors border border-border"
                        >
                          <Upload size={12} /> Upload
                        </label>
                        <input
                          type="text"
                          value={block.image}
                          onChange={(e) => handlePostBlockChange(idx, "image", e.target.value)}
                          placeholder="Ou insira a URL da imagem"
                          className="flex-1 bg-[#1a1a1a] border border-border rounded-sm text-[11px] text-foreground px-2 py-2"
                        />
                      </div>

                      {block.image && (
                        <div className="space-y-2 mt-2">
                          <label className="text-[11px] text-muted-foreground block">Ponto Focal do Bloco (Ajuste Visual)</label>
                          <FocalPointPicker
                            imageUrl={block.image}
                            value={block.focalPoint}
                            onChange={(val) => handlePostBlockChange(idx, "focalPoint", val)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* METADADOS DE SEO */}
          <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
            <h3 style={TEKO} className="text-[19px] uppercase tracking-wide border-b border-border pb-2 text-foreground">
              Configurações de SEO Específicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Meta Title Customizado</label>
                <input
                  type="text"
                  value={postForm.seoTitle}
                  onChange={(e) => setPostForm({ ...postForm, seoTitle: e.target.value })}
                  placeholder="Se deixar vazio, usará o título do post."
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Meta Palavras-chave (Keywords)</label>
                <input
                  type="text"
                  value={postForm.seoKeywords}
                  onChange={(e) => setPostForm({ ...postForm, seoKeywords: e.target.value })}
                  placeholder="moto, fazer, 250, review"
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Meta Description Customizado</label>
              <textarea
                rows={2}
                value={postForm.seoDescription}
                onChange={(e) => setPostForm({ ...postForm, seoDescription: e.target.value })}
                placeholder="Se deixar vazio, usará o resumo do post."
                className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
              />
            </div>
          </div>

          {/* BOTÕES SALVAR/VOLTAR */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="bg-secondary hover:bg-white/[0.03] text-muted-foreground hover:text-foreground text-[13px] font-bold uppercase tracking-wider px-5 py-3 border border-border rounded-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[13px] font-bold uppercase tracking-wider px-6 py-3 rounded-sm transition-colors disabled:bg-primary/50"
            >
              <Save size={14} /> {loading ? "Salvando..." : "Salvar Post"}
            </button>
          </div>
        </form>
      )}

      {/* --- ABA 2: EDITAR PÁGINAS --- */}
      {activeTab === "pages" && !editingPage && (
        <div className="space-y-8 bg-card border border-border p-8 rounded-sm">
          <div className="flex items-center justify-between border-b border-border pb-5 mb-5">
            <div>
              <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Estrutura de Páginas</h2>
              <p className="text-[12px] text-muted-foreground">Escolha a página que deseja atualizar</p>
            </div>
            <button
              onClick={() => handleSelectPage("new")}
              className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[13px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors"
            >
              <Plus size={15} /> Criar Nova Página Customizada
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Selecionar Página Existente</label>
              <select
                value={selectedPageSlug}
                onChange={(e) => handleSelectPage(e.target.value)}
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
              >
                <option value="">-- Escolha uma página --</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title} {p.isStatic ? "(Fixo - Layout Estruturado)" : "(Customizada - Conteúdo HTML)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE PÁGINA */}
      {editingPage && (
        <form onSubmit={handleSavePage} className="space-y-8 bg-card border border-border p-8 rounded-sm">
          <div className="flex items-center justify-between border-b border-border pb-5 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="p-1.5 bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-sm transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">
                Editar Página: {editingPage.title || "Nova Página"}
              </h2>
            </div>
            {!editingPage.isStatic && editingPage.id && (
              <button
                type="button"
                onClick={() => handleDeletePage(editingPage.id)}
                className="flex items-center gap-1.5 bg-red-950/20 hover:bg-primary border border-border hover:border-transparent text-primary hover:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors rounded-sm"
              >
                <Trash2 size={13} /> Deletar Página
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Título da Página</label>
              <input
                required
                type="text"
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                placeholder="Ex: Contato"
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block font-bold">Slug URL</label>
              <input
                required
                type="text"
                disabled={editingPage.isStatic}
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: generateSlugFromTitle(e.target.value) })}
                placeholder="Ex: contato (Bloqueado para Home/Sobre)"
                className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* --- CONTEÚDO DA HOME (ESTÁTICA/ESTRUTURADA) --- */}
          {editingPage.slug === "home" && (
            <div className="space-y-6 pt-4 border-t border-border">
              <h3 style={TEKO} className="text-[21px] uppercase tracking-wide text-foreground border-b border-border pb-1">Campos Estruturados - Home</h3>
              
              {/* HIERARQUIA REORDENÁVEL DE BLOCOS */}
              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-primary flex items-center gap-2">
                  Organização da Hierarquia de Blocos da Home
                </h4>
                <p className="text-[12px] text-muted-foreground">
                  Use os botões <strong>Subir</strong> e <strong>Descer</strong> para reorganizar livremente a ordem das seções na página inicial.
                </p>
                {(() => {
                  const sectionLabels: Record<string, string> = {
                    hero: "Hero Inicial (Destaque Principal)",
                    breaking: "Faixa de Notícia Rápida (Breaking Bar)",
                    posts: "Seção de Últimos Posts + Sidebar",
                    banner: "Banner Promocional da Moto"
                  };
                  const currentOrder: string[] = Array.isArray(editingPage.content.sectionOrder) && editingPage.content.sectionOrder.length > 0
                    ? editingPage.content.sectionOrder
                    : ["hero", "breaking", "posts", "banner"];

                  const moveSection = (idx: number, direction: "up" | "down") => {
                    const newOrder = [...currentOrder];
                    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
                    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
                    const temp = newOrder[idx];
                    newOrder[idx] = newOrder[targetIdx];
                    newOrder[targetIdx] = temp;
                    setEditingPage({
                      ...editingPage,
                      content: {
                        ...editingPage.content,
                        sectionOrder: newOrder
                      }
                    });
                  };

                  return (
                    <div className="space-y-2">
                      {currentOrder.map((key, index) => (
                        <div key={key} className="flex items-center justify-between bg-[#222222] border border-border px-4 py-2.5 rounded-sm">
                          <span className="text-[13px] font-semibold text-foreground uppercase tracking-wide">
                            {index + 1}. {sectionLabels[key] || key}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveSection(index, "up")}
                              className="px-2 py-1 bg-secondary border border-border text-[11px] uppercase font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 rounded-sm flex items-center gap-1"
                            >
                              <ArrowUp size={12} /> Subir
                            </button>
                            <button
                              type="button"
                              disabled={index === currentOrder.length - 1}
                              onClick={() => moveSection(index, "down")}
                              className="px-2 py-1 bg-secondary border border-border text-[11px] uppercase font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 rounded-sm flex items-center gap-1"
                            >
                              <ArrowDown size={12} /> Descer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* TAGS GLOBAIS DO SITE */}
              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-3">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Tags Estáticas / Globais do Site</h4>
                <label className="text-[11px] text-muted-foreground block uppercase">
                  Separe as tags principais por vírgula (ex: Fazer250, FZ25, Review, Manutenção, Rotas, Eventos)
                </label>
                <input
                  type="text"
                  value={editingPage.content.siteTags || ""}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    content: { ...editingPage.content, siteTags: e.target.value }
                  })}
                  placeholder="Fazer250, FZ25, Review, Manutenção, Rotas, Eventos, 2026"
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-3 py-2 outline-none focus:border-primary/50"
                />
              </div>

              
              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Seção do Hero Inicial</h4>
                
                <div className="space-y-2 bg-[#202020] p-4 border border-border/40 rounded-sm mb-4">
                  <label className="text-[11px] text-primary block uppercase font-bold tracking-widest">Promover Artigo no Hero</label>
                  <select
                    value={editingPage.content.heroPostId || ""}
                    onChange={(e) => {
                      const postId = e.target.value;
                      const selectedPost = posts.find(p => p.id === postId);
                      if (selectedPost) {
                        setEditingPage({
                          ...editingPage,
                          content: {
                            ...editingPage.content,
                            heroPostId: postId,
                            heroTitle: selectedPost.title,
                            heroSubtitle: selectedPost.excerpt,
                            heroImage: selectedPost.img,
                            heroFocalPoint: selectedPost.imgFocalPoint || "center"
                          }
                        });
                      } else {
                        setEditingPage({
                          ...editingPage,
                          content: {
                            ...editingPage.content,
                            heroPostId: ""
                          }
                        });
                      }
                    }}
                    className="w-full bg-[#111111] border border-border rounded-sm text-[13px] px-3 py-2 outline-none focus:border-primary/50 text-foreground"
                  >
                    <option value="">-- Nenhum (Usar textos estáticos abaixo) --</option>
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>{stripHtml(p.title)}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Selecionar um post irá preencher dinamicamente a imagem, título, resumo e link do Hero com as informações desse artigo.
                  </p>
                </div>

                <div className="opacity-70 space-y-4">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block border-b border-border/40 pb-1">Textos de Fallback (Caso não promova um post acima)</span>
                  <div className="space-y-3">
                    <label className="text-[11px] text-muted-foreground block uppercase">Título do Hero (Quebra de linha aceita)</label>
                    <textarea
                      rows={2}
                      value={editingPage.content.heroTitle || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroTitle: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-3 py-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] text-muted-foreground block uppercase">Subtítulo / Parágrafo do Hero</label>
                    <textarea
                      rows={3}
                      value={editingPage.content.heroSubtitle || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroSubtitle: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] text-muted-foreground block uppercase">Imagem do Hero (URL ou Upload)</label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingPage({
                            ...editingPage,
                            content: { ...editingPage.content, heroImage: url }
                          }))}
                          className="hidden"
                          id="home-hero-file"
                        />
                        <label htmlFor="home-hero-file" className="bg-[#2a2a2a] border border-border text-[11px] px-3 py-2 cursor-pointer">Upload</label>
                        <input
                          type="text"
                          value={editingPage.content.heroImage || ""}
                          onChange={(e) => setEditingPage({
                            ...editingPage,
                            content: { ...editingPage.content, heroImage: e.target.value }
                          })}
                          className="flex-1 bg-[#222222] border border-border rounded-sm text-[12px] text-foreground px-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-muted-foreground block uppercase">Ponto Focal Hero (Ajuste Visual)</label>
                      <FocalPointPicker
                        imageUrl={editingPage.content.heroImage || ""}
                        value={editingPage.content.heroFocalPoint || "center"}
                        onChange={(val) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, heroFocalPoint: val }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Faixa de Notícia Rápida (Breaking Bar)</h4>
                
                <div className="space-y-2 bg-[#202020] p-4 border border-border/40 rounded-sm mb-4">
                  <label className="text-[11px] text-primary block uppercase font-bold tracking-widest">Promover Artigo na Breaking Bar</label>
                  <select
                    value={editingPage.content.breakingPostId || ""}
                    onChange={(e) => {
                      const postId = e.target.value;
                      const selectedPost = posts.find(p => p.id === postId);
                      if (selectedPost) {
                        setEditingPage({
                          ...editingPage,
                          content: {
                            ...editingPage.content,
                            breakingPostId: postId,
                            breakingText: selectedPost.title,
                            breakingSlug: selectedPost.slug
                          }
                        });
                      } else {
                        setEditingPage({
                          ...editingPage,
                          content: {
                            ...editingPage.content,
                            breakingPostId: ""
                          }
                        });
                      }
                    }}
                    className="w-full bg-[#111111] border border-border rounded-sm text-[13px] px-3 py-2 outline-none focus:border-primary/50 text-foreground"
                  >
                    <option value="">-- Nenhum (Usar textos estáticos abaixo) --</option>
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>{stripHtml(p.title)}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Selecionar um post exibirá dinamicamente o título do artigo selecionado na barra vermelha "Novo".
                  </p>
                </div>

                <div className="opacity-70 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Texto Informativo de Fallback</label>
                    <input
                      type="text"
                      value={editingPage.content.breakingText || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, breakingText: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Slug do Post de Fallback</label>
                    <input
                      type="text"
                      value={editingPage.content.breakingSlug || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, breakingSlug: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Banner do Rodapé da Home</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Título do Banner</label>
                    <input
                      type="text"
                      value={editingPage.content.bannerTitle}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, bannerTitle: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Subtítulo / Ficha Curta</label>
                    <input
                      type="text"
                      value={editingPage.content.bannerSubtitle}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, bannerSubtitle: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Imagem do Banner (URL ou Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, bannerImage: url }
                        }))}
                        className="hidden"
                        id="home-banner-file"
                      />
                      <label htmlFor="home-banner-file" className="bg-[#2a2a2a] border border-border text-[11px] px-3 py-2 cursor-pointer">Upload</label>
                      <input
                        type="text"
                        value={editingPage.content.bannerImage}
                        onChange={(e) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, bannerImage: e.target.value }
                        })}
                        className="flex-1 bg-[#222222] border border-border rounded-sm text-[12px] text-foreground px-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Ponto Focal Banner (Ajuste Visual)</label>
                    <FocalPointPicker
                      imageUrl={editingPage.content.bannerImage || ""}
                      value={editingPage.content.bannerFocalPoint || "center"}
                      onChange={(val) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, bannerFocalPoint: val }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTEÚDO DA PÁGINA SOBRE (ESTÁTICA/ESTRUTURADA) --- */}
          {editingPage.slug === "sobre" && (
            <div className="space-y-6 pt-4 border-t border-border">
              <h3 style={TEKO} className="text-[21px] uppercase tracking-wide text-foreground border-b border-border pb-1">Campos Estruturados - Sobre</h3>

              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Hero da Seção</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Título Principal</label>
                    <input
                      type="text"
                      value={editingPage.content.heroTitle}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroTitle: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Descrição</label>
                    <input
                      type="text"
                      value={editingPage.content.heroDescription}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroDescription: e.target.value }
                      })}
                      className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Imagem do Hero (URL ou Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, heroImage: url }
                        }))}
                        className="hidden"
                        id="sobre-hero-file"
                      />
                      <label htmlFor="sobre-hero-file" className="bg-[#2a2a2a] border border-border text-[11px] px-3 py-2 cursor-pointer">Upload</label>
                      <input
                        type="text"
                        value={editingPage.content.heroImage}
                        onChange={(e) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, heroImage: e.target.value }
                        })}
                        className="flex-1 bg-[#222222] border border-border rounded-sm text-[12px] text-foreground px-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Ponto Focal Hero (Ajuste Visual)</label>
                    <FocalPointPicker
                      imageUrl={editingPage.content.heroImage || ""}
                      value={editingPage.content.heroFocalPoint || "center"}
                      onChange={(val) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroFocalPoint: val }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Barras de Estatísticas (4 itens)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(editingPage.content.stats || []).map((s: any, idx: number) => (
                    <div key={idx} className="bg-[#222222] p-3 rounded-sm space-y-2">
                      <span className="text-[11px] text-primary font-bold">Item {idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Valor (ex: 3.500 km)"
                        value={s.value}
                        onChange={(e) => {
                          const statsCopy = [...editingPage.content.stats];
                          statsCopy[idx] = { ...statsCopy[idx], value: e.target.value };
                          setEditingPage({ ...editingPage, content: { ...editingPage.content, stats: statsCopy } });
                        }}
                        className="w-full bg-[#111111] border border-border text-[12px] px-2 py-1"
                      />
                      <input
                        type="text"
                        placeholder="Rótulo (ex: Rodados)"
                        value={s.label}
                        onChange={(e) => {
                          const statsCopy = [...editingPage.content.stats];
                          statsCopy[idx] = { ...statsCopy[idx], label: e.target.value };
                          setEditingPage({ ...editingPage, content: { ...editingPage.content, stats: statsCopy } });
                        }}
                        className="w-full bg-[#111111] border border-border text-[12px] px-2 py-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Biografia e Foto do Lucas */}
              <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Biografia do Autor</h4>
                <div className="space-y-2">
                  <label className="text-[11px] text-muted-foreground block uppercase">Título da Biografia</label>
                  <input
                    type="text"
                    value={editingPage.content.bioTitle}
                    onChange={(e) => setEditingPage({
                      ...editingPage,
                      content: { ...editingPage.content, bioTitle: e.target.value }
                    })}
                    className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-muted-foreground block uppercase">Texto da Biografia (Suporta HTML)</label>
                  <textarea
                    rows={6}
                    value={editingPage.content.bioContentHtml}
                    onChange={(e) => setEditingPage({
                      ...editingPage,
                      content: { ...editingPage.content, bioContentHtml: e.target.value }
                    })}
                    className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-muted-foreground block uppercase">Frase em Destaque (Citação)</label>
                  <input
                    type="text"
                    value={editingPage.content.bioQuote}
                    onChange={(e) => setEditingPage({
                      ...editingPage,
                      content: { ...editingPage.content, bioQuote: e.target.value }
                    })}
                    className="w-full bg-[#222222] border border-border rounded-sm text-[13px] px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Foto do Autor (Eliezer)</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, riderImage: url }
                        }))}
                        className="hidden"
                        id="sobre-rider-file"
                      />
                      <label htmlFor="sobre-rider-file" className="bg-[#2a2a2a] border border-border text-[11px] px-3 py-2 cursor-pointer">Upload</label>
                      <input
                        type="text"
                        value={editingPage.content.riderImage}
                        onChange={(e) => setEditingPage({
                          ...editingPage,
                          content: { ...editingPage.content, riderImage: e.target.value }
                        })}
                        className="flex-1 bg-[#222222] border border-border rounded-sm text-[12px] text-foreground px-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground block uppercase">Ponto Focal Foto (Ajuste Visual)</label>
                    <FocalPointPicker
                      imageUrl={editingPage.content.riderImage || ""}
                      value={editingPage.content.riderFocalPoint || "center"}
                      onChange={(val) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, riderFocalPoint: val }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTEÚDO DE PÁGINAS DE CATEGORIA --- */}
          {(editingPage.slug === "reviews" || 
            editingPage.slug === "manutencao" || 
            editingPage.slug === "rotas" || 
            editingPage.slug === "equipamentos") && (
            <div className="space-y-6 pt-4 border-t border-border">
              <h3 style={TEKO} className="text-[21px] uppercase tracking-wide text-foreground border-b border-border pb-1">
                Configurações da Página de Categoria
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-[12px] text-muted-foreground uppercase block font-bold">
                  Descrição Curta (Apresentação da Categoria)
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingPage.content?.description || ""}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    content: { ...editingPage.content, description: e.target.value }
                  })}
                  placeholder="Ex: Análises detalhadas de jaquetas, capacetes..."
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground p-3 outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-muted-foreground uppercase block font-bold">
                    Imagem de Fundo (Hero Banner)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroImg: url }
                      }))}
                      className="hidden"
                      id="category-hero-file"
                    />
                    <label htmlFor="category-hero-file" className="bg-[#2a2a2a] border border-border text-[11px] px-3 py-2.5 cursor-pointer">
                      Upload
                    </label>
                    <input
                      type="text"
                      value={editingPage.content?.heroImg || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, heroImg: e.target.value }
                      })}
                      className="flex-1 bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-3 py-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] text-muted-foreground uppercase block font-bold">
                    Ícone da Categoria
                  </label>
                  <select
                    value={editingPage.content?.iconName || "Star"}
                    onChange={(e) => setEditingPage({
                      ...editingPage,
                      content: { ...editingPage.content, iconName: e.target.value }
                    })}
                    className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
                  >
                    <option value="Star">Estrela (Reviews)</option>
                    <option value="Wrench">Chave Inglesa (Manutenção)</option>
                    <option value="Navigation">Navegação/Seta (Rotas)</option>
                    <option value="ShieldCheck">Escudo com Check (Equipamentos)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTEÚDO DE PÁGINAS CUSTOMIZADAS (DINÂMICAS) --- */}
          {!editingPage.isStatic && (
            <div className="space-y-6 pt-4 border-t border-border">
              <h3 style={TEKO} className="text-[21px] uppercase tracking-wide text-foreground border-b border-border pb-1">
                Conteúdo HTML da Página
              </h3>
              <div className="space-y-2">
                <label className="text-[12px] text-muted-foreground uppercase block font-bold">
                  Corpo da Página (Suporta HTML completo: títulos, imagens, parágrafos)
                </label>
                <textarea
                  required
                  rows={15}
                  value={editingPage.content?.bodyHtml || ""}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    content: { ...editingPage.content, bodyHtml: e.target.value }
                  })}
                  placeholder="Insira o HTML da sua página. Ex: <h2>Fale Conosco</h2> <p>Entre em contato pelo e-mail...</p>"
                  className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground p-3 outline-none focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {/* SEO DA PÁGINA */}
          <div className="border border-border p-5 bg-[#181818] rounded-sm space-y-4">
            <h3 style={TEKO} className="text-[19px] uppercase tracking-wide border-b border-border pb-2 text-foreground">
              Configurações de SEO da Página
            </h3>
            <div className="space-y-3">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Título de Metadados (Meta Title)</label>
              <input
                type="text"
                value={editingPage.seoTitle}
                onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                placeholder="Se vazio, usará o título da página."
                className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block">Descrição de Metadados (Meta Description)</label>
              <textarea
                rows={2}
                value={editingPage.seoDescription}
                onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                placeholder="Insira uma descrição resumida para exibição em buscadores."
                className="w-full bg-[#222222] border border-border rounded-sm text-[13px] text-foreground px-4 py-2"
              />
            </div>
          </div>

          {/* BOTÕES SALVAR/VOLTAR */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="bg-secondary hover:bg-white/[0.03] text-muted-foreground hover:text-foreground text-[13px] font-bold uppercase tracking-wider px-5 py-3 border border-border rounded-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-[#E05300] text-white text-[13px] font-bold uppercase tracking-wider px-6 py-3 rounded-sm transition-colors disabled:bg-primary/50"
            >
              <Save size={14} /> {loading ? "Salvando..." : "Salvar Página"}
            </button>
          </div>
        </form>
      )}

      {/* --- ABA 3: FUNÇÕES (CONFIGURAÇÕES DO SISTEMA) --- */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-3">
            <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Funções</h2>
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
        </div>
      )}

      {/* --- ABA 4: NOTIFICAÇÕES, MÉTRICAS & NEWSLETTER --- */}
      {activeTab === "notifications" && (
        <div className="space-y-8">
          <div className="border-b border-border pb-3">
            <h2 style={TEKO} className="text-[26px] uppercase tracking-wide">Métricas & Notificações</h2>
            <p className="text-[13px] text-muted-foreground">Acompanhe acessos reais de leitores (sem inflar por admin), inscrições de leitores e curtidas.</p>
          </div>

          {/* QUADROS DE MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-card border border-border p-5 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Visualizações Reais</span>
                <span style={TEKO} className="text-[32px] font-bold leading-none text-foreground">
                  {posts.reduce((acc, p) => acc + (p.views || 0), 0)}
                </span>
                <span className="text-[10px] text-green-400 block mt-1">✓ Descontando seus acessos de admin</span>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <Eye size={20} />
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Total de Curtidas</span>
                <span style={TEKO} className="text-[32px] font-bold leading-none text-foreground">
                  {posts.reduce((acc, p) => acc + (p.likes || 0), 0)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">Interações nos posts</span>
              </div>
              <div className="p-3 bg-red-950/30 text-red-500 rounded-full">
                <Heart size={20} />
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Inscritos na Newsletter</span>
                <span style={TEKO} className="text-[32px] font-bold leading-none text-foreground">
                  {subscribers.length}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">Leitores cadastrados</span>
              </div>
              <div className="p-3 bg-blue-950/30 text-blue-400 rounded-full">
                <Mail size={20} />
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Notificações</span>
                <span style={TEKO} className="text-[32px] font-bold leading-none text-foreground">
                  {notifications.length}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">
                  {notifications.filter(n => !n.read).length} não lidas
                </span>
              </div>
              <div className="p-3 bg-yellow-950/30 text-yellow-400 rounded-full">
                <Bell size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* FEED DE NOTIFICAÇÕES */}
            <div className="bg-card border border-border p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground flex items-center gap-2">
                  <Bell size={16} className="text-primary" /> Feed de Atividades Recentes
                </h3>
                <span className="text-[11px] text-muted-foreground uppercase">
                  {notifications.length} registros
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-[13px]">
                  Nenhuma notificação registrada até o momento.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 border rounded-sm flex items-start justify-between gap-3 text-[13px] transition-colors ${
                        notif.read ? "bg-[#141414] border-border/40 text-muted-foreground" : "bg-[#1E1A16] border-primary/40 text-foreground"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            notif.type === "REGISTER" ? "bg-blue-900/60 text-blue-300" :
                            notif.type === "LIKE" ? "bg-red-900/60 text-red-300" :
                            notif.type === "SHARE" ? "bg-purple-900/60 text-purple-300" : "bg-primary/30 text-primary"
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="leading-snug">{notif.message}</p>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={async () => {
                            await markNotificationAsReadAction(notif.id);
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                          }}
                          className="text-[10px] text-primary hover:underline shrink-0 uppercase font-bold"
                        >
                          Marcar lido
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LISTA DE INSCRITOS DA NEWSLETTER */}
            <div className="bg-card border border-border p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 style={TEKO} className="text-[20px] uppercase tracking-wide text-foreground flex items-center gap-2">
                  <Mail size={16} className="text-primary" /> Inscritos na Newsletter ({subscribers.length})
                </h3>
                {subscribers.length > 0 && (
                  <button
                    onClick={() => {
                      const emails = subscribers.map(s => s.email).join(", ");
                      navigator.clipboard.writeText(emails);
                      alert("Lista de e-mails copiada para a área de transferência!");
                    }}
                    className="flex items-center gap-1 text-[11px] bg-secondary hover:bg-primary text-muted-foreground hover:text-white px-2.5 py-1 rounded-sm border border-border uppercase font-bold transition-colors"
                  >
                    <Copy size={11} /> Copiar E-mails
                  </button>
                )}
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-[13px]">
                  Nenhum leitor se inscreveu na newsletter ainda.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="p-3 bg-[#141414] border border-border/50 rounded-sm flex items-center justify-between text-[13px]">
                      <div>
                        <span className="text-foreground font-medium block">{sub.email}</span>
                        {sub.name && <span className="text-[11px] text-muted-foreground block">{sub.name}</span>}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* CONFIGURAÇÃO DO WEBHOOK DO N8N & CHAVE DE API AUTOMATIZADA */}
          <div className="bg-card border border-border p-6 rounded-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
              <Lock size={18} />
              <h3 style={TEKO} className="text-[22px] uppercase tracking-wide font-semibold text-foreground">
                Integração n8n & Endpoint de Automação de Posts
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Webhook N8N */}
              <div className="space-y-3">
                <h4 style={TEKO} className="text-[18px] uppercase tracking-wide text-foreground">Webhook do n8n (Disparo ao Publicar)</h4>
                <p className="text-[12px] text-muted-foreground">
                  Insira a URL do seu Webhook no n8n. Sempre que um post novo for criado (manual ou via API), o sistema fará um disparo POST para esta URL informando o resumo e link do post.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={n8nWebhookUrl}
                    onChange={(e) => setN8nWebhookUrl(e.target.value)}
                    placeholder="https://seu-n8n.com/webhook/moto-post"
                    className="flex-1 bg-[#141414] border border-border rounded-sm text-[13px] px-3 py-2 text-foreground outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={async () => {
                      setLoading(true);
                      const existingConfig = pages.find(p => p.slug === "config") || {
                        slug: "config",
                        title: "Configurações do Sistema",
                        isStatic: true,
                        content: {}
                      };
                      const updated = {
                        ...existingConfig,
                        content: {
                          ...((typeof existingConfig.content === "object" ? existingConfig.content : {}) as any),
                          n8nWebhookUrl: n8nWebhookUrl.trim()
                        }
                      };
                      const res = await savePageAction(updated);
                      if (!res.error) {
                        setMessage({ type: "success", text: "URL do Webhook do n8n salva com sucesso!" });
                      } else {
                        setMessage({ type: "error", text: "Erro ao salvar webhook: " + res.error });
                      }
                      setLoading(false);
                    }}
                    className="bg-primary hover:bg-[#E05300] text-white text-[12px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm shrink-0"
                  >
                    Salvar Webhook
                  </button>
                </div>
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
                  <p><strong>Header de Autenticação:</strong> <code className="text-foreground">x-api-key: motonapratica-secret-key-2026</code></p>
                  <p><strong>Payload:</strong> Aceita o JSON exato com <code className="text-foreground">title, slug, tag, category, excerpt, readTime, img, blocks</code>.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

