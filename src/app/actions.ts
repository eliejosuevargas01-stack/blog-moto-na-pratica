"use server";

import { prisma } from "../lib/db";
import { signAdminToken, checkCredentials, verifyAdminToken, verifyToken } from "../lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyGoogleIndexing } from "../lib/google-indexing";
import { calculateReadTime } from "../lib/image-utils";
import { toNumericGroupId } from "./data";
import { N8nClient } from "../lib/n8n/client";

async function requireAdmin(actionName?: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'anonymous', action: actionName || 'requireAdmin', status: 'unauthorized' }));
    throw new Error("Unauthorized");
  }
  const verifyFn = verifyAdminToken || (async (tok: string) => {
    const u = await verifyToken(tok);
    if (u && (u.role === "admin" || u.username === (process.env.ADMIN_USERNAME || "admin"))) return u;
    return null;
  });
  const user = await verifyFn(token);
  if (!user || user.role !== "admin") {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'anonymous', action: actionName || 'requireAdmin', status: 'unauthorized' }));
    throw new Error("Unauthorized");
  }
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: user.username, action: actionName || 'requireAdmin', status: 'success' }));
  return user;
}

// --- AUTENTICAÇÃO ADMINISTRATIVA ---

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  const isValid = checkCredentials(username, password);

  if (!isValid) {
    return { error: "Usuário ou senha incorretos." };
  }

  // Criar token exclusivo de administrador
  const token = await signAdminToken(username);

  cookies().set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: username, action: "loginAction", status: "success" }));
  return { success: true };
}

export async function logoutAction() {
  await requireAdmin("logoutAction").catch(() => null);
  cookies().delete("admin_token");
  redirect("/admin/login");
}

// --- CRUD DE POSTS ---

export async function savePostAction(data: {
  id?: number | string;
  slug: string;
  tag: string;
  category: string;
  title: string;
  excerpt: string;
  readTime?: string;
  img: string;
  imgFocalPoint?: string;
  audioUrl?: string | null;
  audioUrlsByLang?: Record<string, string | null>;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  lang?: string;
  blocks?: any[];
  translationGroupId?: number | string | null;
  // --- Editorial V2 fields (all optional; omitted = preserve on update) ---
  editorialType?: string | null;
  trafficIntent?: string | null;
  authorId?: string | null;
  reviewerId?: string | null;
  researchId?: string | null;
  topicId?: string | null;
  personalExperienceVerified?: boolean;
  factCheckedAt?: string | null;
  disclosure?: string | null;
  correctionStatus?: string | null;
  firstPublishedAt?: string | null;
  editorialModifiedAt?: string | null;
  updatedReason?: string | null;
  sources?: any[] | null;
  corrections?: any[] | null;
}) {
  await requireAdmin("savePostAction");
  try {
    const targetPostId = data.id ? String(data.id).trim() : undefined;

    // Buscar se o post já existe por ID ou por Slug
    let currentPost = targetPostId ? await prisma.post.findUnique({ where: { id: targetPostId } }) : null;
    if (!currentPost && data.slug) {
      currentPost = await prisma.post.findUnique({ where: { slug: data.slug.trim() } });
    }

    const lang = data.lang || "pt";
    const computedReadTime = calculateReadTime({ title: data.title, excerpt: data.excerpt, blocks: data.blocks });
    const finalReadTime = (data.readTime && data.readTime !== "5 min") ? data.readTime : computedReadTime;

    if (currentPost) {
      // PRESERVAR O SLUG ORIGINAL DO POST PARA PROTEGER O GOOGLE SEARCH CONSOLE
      const finalSlug = currentPost.slug;
      const translationGroupId = currentPost.translationGroupId;

      const targetAudio = data.audioUrlsByLang && data.audioUrlsByLang[lang] !== undefined
        ? data.audioUrlsByLang[lang]
        : (data.audioUrl || null);

      // Atualização do post alvo com transação editorial V2
      const savedPost = await prisma.$transaction(async (tx) => {
        const p = await tx.post.update({
          where: { id: currentPost.id },
          data: {
            slug: finalSlug,
            tag: data.tag,
            category: data.category,
            title: data.title,
            excerpt: data.excerpt,
            readTime: finalReadTime,
            img: data.img,
            imgFocalPoint: data.imgFocalPoint || "50% 50%",
            status: data.status || currentPost.status || "publicado",
            blocks: data.blocks as any,
            seoTitle: data.seoTitle || data.title,
            seoDescription: data.seoDescription || data.excerpt,
            seoKeywords: data.seoKeywords || "",
            audioUrl: targetAudio,
            lang: lang
          }
        });

        // Editorial V2: collect explicit fields from data (omitted = preserve)
        const editorialFields = [
          "editorialType", "trafficIntent", "authorId", "reviewerId",
          "researchId", "topicId", "personalExperienceVerified", "factCheckedAt",
          "disclosure", "correctionStatus", "firstPublishedAt",
          "editorialModifiedAt", "updatedReason", "sources", "corrections",
        ] as const;
        const editorialData: Record<string, any> = {};
        let hasEditorial = false;
        for (const f of editorialFields) {
          if ((data as any)[f] !== undefined) {
            editorialData[f] = (data as any)[f];
            hasEditorial = true;
          }
        }
        if (hasEditorial) {
          const { validateEditorialInput, applyEditorialPersistenceTransaction } = await import("../lib/editorial-persistence");
          const validation = validateEditorialInput(editorialData);
          if (validation.error) {
            throw new Error(validation.error);
          }
          await applyEditorialPersistenceTransaction(tx, p.id, validation.validated!, true);
        }

        return p;
      });

      // Sincronizar imagens (e áudios específicos de idioma) com todos os posts do mesmo grupo de tradução
      if (translationGroupId) {
        const sisterPosts = await prisma.post.findMany({
          where: {
            translationGroupId,
            id: { not: currentPost.id }
          }
        });

        for (const sister of sisterPosts) {
          let sisterBlocks: any[] = [];
          if (Array.isArray(sister.blocks)) {
            sisterBlocks = sister.blocks;
          } else if (typeof sister.blocks === "string") {
            try {
              sisterBlocks = JSON.parse(sister.blocks);
            } catch (e) {
              sisterBlocks = [];
            }
          }

          const updatedSisterBlocks = sisterBlocks.map((b: any, idx: number) => {
            const sourceBlock = data.blocks?.[idx];
            if (sourceBlock) {
              return {
                ...b,
                image: sourceBlock.image || "",
                focalPoint: sourceBlock.focalPoint || "center"
              };
            }
            return b;
          });

          const sisterAudio = data.audioUrlsByLang && data.audioUrlsByLang[sister.lang] !== undefined
            ? data.audioUrlsByLang[sister.lang]
            : sister.audioUrl;

          const sisterComputedReadTime = calculateReadTime({ title: sister.title, excerpt: sister.excerpt, blocks: updatedSisterBlocks });

          await prisma.post.update({
            where: { id: sister.id },
            data: {
              img: data.img,
              imgFocalPoint: data.imgFocalPoint || "50% 50%",
              readTime: sisterComputedReadTime,
              audioUrl: sisterAudio || null,
              status: data.status || sister.status || "publicado",
              blocks: updatedSisterBlocks as any
            }
          });
        }
      }
    } else {
      // Criação de novo post
      const existingSlug = await prisma.post.findUnique({ where: { slug: data.slug.trim() } });
      if (existingSlug) {
        return { error: "Já existe um post com esta URL (slug). Escolha outro." };
      }

      const numericGroupId = data.translationGroupId ? toNumericGroupId(data.translationGroupId) : null;

      const createdPost = await prisma.$transaction(async (tx) => {
        const p = await tx.post.create({
          data: {
            slug: data.slug,
            tag: data.tag,
            category: data.category,
            title: data.title,
            excerpt: data.excerpt,
            readTime: finalReadTime,
            img: data.img,
            imgFocalPoint: data.imgFocalPoint || "50% 50%",
            audioUrl: data.audioUrl || null,
            status: data.status || "publicado",
            blocks: data.blocks as any,
            seoTitle: data.seoTitle || data.title,
            seoDescription: data.seoDescription || data.excerpt,
            seoKeywords: data.seoKeywords || "",
            lang: lang,
            translationGroupId: numericGroupId,
            date: new Date()
          }
        });

        // Editorial V2: collect explicit fields from data (omitted = no editorial data)
        const editorialFields = [
          "editorialType", "trafficIntent", "authorId", "reviewerId",
          "researchId", "topicId", "personalExperienceVerified", "factCheckedAt",
          "disclosure", "correctionStatus", "firstPublishedAt",
          "editorialModifiedAt", "updatedReason", "sources", "corrections",
        ] as const;
        const editorialData: Record<string, any> = {};
        let hasEditorial = false;
        for (const f of editorialFields) {
          if ((data as any)[f] !== undefined) {
            editorialData[f] = (data as any)[f];
            hasEditorial = true;
          }
        }
        if (hasEditorial) {
          const { validateEditorialInput, applyEditorialPersistenceTransaction } = await import("../lib/editorial-persistence");
          const validation = validateEditorialInput(editorialData);
          if (validation.error) {
            throw new Error(validation.error);
          }
          await applyEditorialPersistenceTransaction(tx, p.id, validation.validated!, false);
        }

        return p;
      });
    }

    // Revalidar caches públicos
    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    revalidatePath(`/post/${currentPost?.slug || data.slug}`);
    revalidatePath("/sitemap.xml");

    // Indexação automática via Google Indexing API
    try {
      const configPage = await prisma.page.findUnique({ where: { slug: "config" } });
      let activePlugins: Record<string, boolean> = {};
      if (configPage && configPage.content) {
        const contentObj = typeof configPage.content === "string" 
          ? JSON.parse(configPage.content) 
          : configPage.content;
        activePlugins = contentObj.activePlugins || {};
      }
      if (activePlugins["googleIndexing"]) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://motonapratica.online";
        const postUrl = `${baseUrl}/post/${data.slug}`;
        notifyGoogleIndexing(postUrl).then((res) => {
          if (res.success) {
            console.log(`[Google Indexing] URL ${postUrl} enviada com sucesso para indexação instantânea.`);
          } else {
            console.warn(`[Google Indexing] Falha ao indexar URL ${postUrl}:`, res.message);
          }
        });
      }
    } catch (e) {
      console.error("Erro ao rodar plugin de indexação do Google:", e);
    }

    // Disparar Webhook do n8n
    try {
      const savedPost = await prisma.post.findUnique({ where: { slug: currentPost?.slug || data.slug } });
      if (savedPost) {
        await triggerN8nWebhook(savedPost);
      }
    } catch (e) {
      console.warn("Falha ao disparar webhook n8n:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar post:", error);
    return { error: "Erro interno ao salvar post no banco de dados." };
  }
}

export async function deletePostAction(id: number | string) {
  await requireAdmin("deletePostAction");
  try {
    const targetIdStr = String(id).trim();
    const post = await prisma.post.findUnique({ where: { id: targetIdStr } });
    if (!post) {
      return { error: "Post não encontrado." };
    }

    // Se o post possuir um translationGroupId, deleta todo o grupo (PT, EN, ES)
    if (post.translationGroupId) {
      await prisma.post.deleteMany({
        where: { translationGroupId: post.translationGroupId }
      });
    } else {
      await prisma.post.delete({ where: { id: targetIdStr } });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    if (post.slug) revalidatePath(`/post/${post.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { error: "Erro ao deletar post e suas traduções." };
  }
}

// --- INTEGRAÇÃO COM N8N & NOTIFICAÇÕES ---

async function checkWebhookRateLimit(actionType: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotification = await prisma.notification.findFirst({
      where: {
        type: `AI_ACTION_${actionType.toUpperCase()}`,
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: "desc" }
    });

    if (recentNotification) {
      const elapsedMinutes = Math.floor((Date.now() - new Date(recentNotification.createdAt).getTime()) / 60000);
      const remainingMinutes = 60 - elapsedMinutes;
      return {
        allowed: false,
        error: `Webhook já disparado recentemente (${elapsedMinutes} min atrás). Para evitar custos e sobrecarga, aguarde ${remainingMinutes} minutos antes de disparar novamente.`
      };
    }
  } catch (e) {
    console.warn("Falha ao verificar rate limit do webhook:", e);
  }
  return { allowed: true };
}

export async function setPostStatusAction(idOrGroupId: string | number, status: string) {
  await requireAdmin("setPostStatusAction");
  try {
    const groupId = toNumericGroupId(idOrGroupId);
    const targetStr = String(idOrGroupId).trim();

    await prisma.post.updateMany({
      where: {
        OR: [
          { id: targetStr },
          { translationGroupId: groupId }
        ]
      },
      data: { status }
    });

    revalidatePath("/admin");
    revalidatePath("/posts");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao atualizar status do post:", err);
    return { error: err.message || "Erro ao atualizar status do post." };
  }
}

export async function triggerImprovePostWithAIAction(data: {
  translationGroupId?: number | string;
  id?: string | number;
  title: string;
  excerpt: string;
  slug?: string;
  lang?: string;
  tag?: string;
  category?: string;
  force?: boolean;
}) {
  await requireAdmin("triggerImprovePostWithAIAction");
  try {
    if (!data.force) {
      const rateCheck = await checkWebhookRateLimit("update");
      if (!rateCheck.allowed) {
        return { error: rateCheck.error };
      }
    }

    const groupId = toNumericGroupId(data.translationGroupId || data.id);

    // ATUALIZAR STATUS NO BANCO DE DADOS PARA 'em_edicao'
    const targetIdStr = data.id ? String(data.id).trim() : undefined;
    await prisma.post.updateMany({
      where: {
        OR: [
          ...(targetIdStr ? [{ id: targetIdStr }] : []),
          ...(groupId ? [{ translationGroupId: groupId }] : [])
        ]
      },
      data: { status: "em_edicao" }
    });

    const payload = {
      translationGroupId: groupId,
      translation_group_id: groupId,
      groupId: groupId,
      id: data.id || groupId,
      status: "em_edicao",
      title: data.title,
      titulo: data.title,
      excerpt: data.excerpt,
      summary: data.excerpt,
      resumo: data.excerpt,
      slug: data.slug || "",
      lang: data.lang || "pt",
      tag: data.tag || "",
      category: data.category || "",
      action: "update"
    };

    const result = await N8nClient.send(payload);

    if (!result.success) {
      return { error: "Falha ao enviar requisição para o Webhook de IA." };
    }

    // Registrar Notificação no Banco de Dados
    await prisma.notification.create({
      data: {
        type: "AI_ACTION_UPDATE",
        message: `✨ Requisição de Melhoria por IA (status=em_edicao) enviada para o post "${data.title}"`,
        postTitle: data.title,
        postId: String(groupId),
      }
    });

    revalidatePath("/admin");
    return { success: true, message: "Requisição enviada com sucesso para o Webhook de IA (status setado para 'em_edicao')!" };
  } catch (error: any) {
    console.error("Erro ao disparar webhook de Melhorar com IA:", error);
    return { error: error.message || "Falha de conexão com o Webhook." };
  }
}

export async function triggerGenerateImagesAction(data: {
  translationGroupId?: number | string;
  id?: string | number;
  title: string;
  excerpt: string;
  slug?: string;
  lang?: string;
  tag?: string;
  category?: string;
  readTime?: string;
  img?: string;
  imgFocalPoint?: string;
  audioUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  blocks: Array<{ text: string; image?: string; focalPoint?: string; alt?: string }>;
}) {
  await requireAdmin("triggerGenerateImagesAction");
  try {
    const rateCheck = await checkWebhookRateLimit("img");
    if (!rateCheck.allowed) {
      return { error: rateCheck.error };
    }

    const groupId = toNumericGroupId(data.translationGroupId || data.id);

    const stripHtmlTags = (html: string): string => {
      if (!html) return "";
      return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
    };

    const parsedBlocks = (data.blocks || []).map((b, idx) => ({
      index: idx + 1,
      blockNumber: idx + 1,
      text: stripHtmlTags(b.text || ""),
      image: b.image || "",
      focalPoint: b.focalPoint || "center",
      alt: b.alt || ""
    }));

    const langKey = (data.lang || "pt").toLowerCase();

    const formattedLangObject: Record<string, any> = {
      id: groupId,
      title: data.title || "",
      summary: data.excerpt || "",
      "meta-title": data.seoTitle || data.title || "",
      "meta-description": data.seoDescription || data.excerpt || "",
      "meta-tags": data.seoKeywords || "",
      "img-1": data.img || "AGUARDANDO_GERACAO_CAPA"
    };

    (data.blocks || []).forEach((b, idx) => {
      const blockNum = idx + 1;
      const imgNum = idx + 2;

      formattedLangObject[`block-${blockNum}`] = b.text || "";
      formattedLangObject[`img-${imgNum}`] = b.image || `AGUARDANDO_GERACAO_B${blockNum}`;
    });

    const payload = {
      payload_para_api: {
        output: {
          [langKey]: formattedLangObject,
          pt: formattedLangObject
        }
      },
      translationGroupId: groupId,
      translation_group_id: groupId,
      id: groupId,
      title: data.title || "",
      summary: data.excerpt || "",
      excerpt: data.excerpt || "",
      blocks: parsedBlocks,
      action: "img"
    };

    const result = await N8nClient.send(payload);

    if (!result.success) {
      return { error: "Falha ao enviar requisição para o Webhook de Imagens." };
    }

    // Registrar Notificação no Banco de Dados
    await prisma.notification.create({
      data: {
        type: "AI_ACTION_IMG",
        message: `🖼️ Requisição de Geração de Imagens (action=img) enviada para o post "${data.title}"`,
        postTitle: data.title,
        postId: String(groupId),
      }
    });

    return { success: true, message: "Requisição enviada com sucesso para o Webhook de Geração de Imagens (action=img)!" };
  } catch (error: any) {
    console.error("Erro ao disparar webhook de Gerar Imagens:", error);
    return { error: error.message || "Falha de conexão com o Webhook." };
  }
}

export async function triggerCreateAudioAction(data: {
  translationGroupId?: number | string;
  id?: string | number;
  title: string;
  excerpt: string;
  slug?: string;
  lang?: string;
  tag?: string;
  category?: string;
  readTime?: string;
  img?: string;
  imgFocalPoint?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  blocks: Array<{ text: string; image?: string; focalPoint?: string; alt?: string }>;
}) {
  await requireAdmin("triggerCreateAudioAction");
  try {
    const rateCheck = await checkWebhookRateLimit("audio");
    if (!rateCheck.allowed) {
      return { error: rateCheck.error };
    }

    const groupId = toNumericGroupId(data.translationGroupId || data.id);
    const langKey = (data.lang || "pt").toLowerCase();

    const formattedLangObject: Record<string, any> = {
      id: groupId,
      title: data.title || "",
      summary: data.excerpt || "",
      "meta-title": data.seoTitle || data.title || "",
      "meta-description": data.seoDescription || data.excerpt || "",
      "meta-tags": data.seoKeywords || "",
      "img-1": data.img || "AGUARDANDO_GERACAO_CAPA"
    };

    (data.blocks || []).forEach((b, idx) => {
      const blockNum = idx + 1;
      const imgNum = idx + 2;
      formattedLangObject[`block-${blockNum}`] = b.text || "";
      formattedLangObject[`img-${imgNum}`] = b.image || `AGUARDANDO_GERACAO_B${blockNum}`;
    });

    const blocosOriginais = (data.blocks || []).map((b) => ({
      html_do_bloco: b.text || ""
    }));

    const payload = [
      {
        payload_para_api: {
          output: {
            [langKey]: formattedLangObject,
            pt: formattedLangObject
          }
        },
        dados_de_auditoria: {
          gancho_escolhido: data.excerpt || data.title,
          motivo_gancho: data.excerpt || data.title,
          analise_fatos: data.excerpt || data.title,
          decisao_seo_e_blocos: data.excerpt || data.title,
          total_de_blocos_gerados: (data.blocks || []).length
        },
        blocos_originais: blocosOriginais,
        translationGroupId: groupId,
        translation_group_id: groupId,
        id: groupId,
        title: data.title || "",
        summary: data.excerpt || "",
        excerpt: data.excerpt || "",
        blocks: data.blocks,
        action: "audio"
      }
    ];

    const result = await N8nClient.send(payload);

    if (!result.success) {
      return { error: "Falha ao enviar requisição para o Webhook de Narração de Áudio." };
    }

    // Registrar Notificação no Banco de Dados
    await prisma.notification.create({
      data: {
        type: "AI_ACTION_AUDIO",
        message: `🎧 Requisição de Criar Narração (action=audio) enviada para o post "${data.title}"`,
        postTitle: data.title,
        postId: String(groupId),
      }
    });

    return { success: true, message: "Requisição enviada com sucesso para o Webhook de Narração de Áudio (action=audio)!" };
  } catch (error: any) {
    console.error("Erro ao disparar webhook de Criar Narração:", error);
    return { error: error.message || "Falha de conexão com o Webhook." };
  }
}

export async function triggerImprovePostAction(data: {
  id: number | string;
  title: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  lang?: string;
}) {
  await requireAdmin("triggerImprovePostAction");
  try {
    const targetStr = String(data.id).trim();
    await prisma.post.updateMany({
      where: {
        OR: [
          { id: targetStr },
          ...(data.slug ? [{ slug: data.slug }] : [])
        ]
      },
      data: { status: "em_edicao" }
    });

    const payload = {
      action: "improve_post",
      id: data.id,
      post_id: data.id,
      status: "em_edicao",
      title: data.title,
      slug: data.slug || "",
      category: data.category || "",
      excerpt: data.excerpt || "",
      content: data.content || "",
      lang: data.lang || "pt",
    };

    const result = await N8nClient.send(payload);

    if (!result.success) {
      return { error: "Falha ao enviar requisição para o n8n." };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao disparar webhook no servidor:", error);
    return { error: error.message || "Falha de conexão com o servidor." };
  }
}

export async function triggerN8nWebhook(post: any) {
  await requireAdmin("triggerN8nWebhook");
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://motonapratica.online";

    await N8nClient.send({
      action: "new_post_published",
      event: "new_post_published",
      post: {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        tag: post.tag,
        category: post.category,
        img: post.img,
        url: `${baseUrl}/post/${post.slug}`,
        createdAt: post.createdAt || post.date,
      },
    });
  } catch (e) {
    console.warn("Erro no disparo do webhook para n8n:", e);
  }
}

export async function getNotificationsAction() {
  await requireAdmin("getNotificationsAction");
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, notifications };
  } catch (error) {
    return { success: false, notifications: [] };
  }
}

export async function getSubscribersAction() {
  await requireAdmin("getSubscribersAction");
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, subscribers };
  } catch (error) {
    return { success: false, subscribers: [] };
  }
}

export async function markNotificationAsReadAction(id: string) {
  await requireAdmin("markNotificationAsReadAction");
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsReadAction() {
  await requireAdmin("markAllNotificationsAsReadAction");
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- CRUD DE PÁGINAS ---

export async function savePageAction(data: {
  id?: string;
  slug: string;
  title: string;
  isStatic?: boolean;
  content: any;
  seoTitle?: string;
  seoDescription?: string;
}) {
  await requireAdmin("savePageAction");
  try {
    const existing = await prisma.page.findFirst({
      where: {
        slug: data.slug,
        id: data.id ? { not: data.id } : undefined
      }
    });

    if (existing) {
      return { error: "Já existe uma página com esta URL (slug). Escolha outro." };
    }

    const isFallbackId = data.id?.startsWith("fallback-");

    if (data.id && !isFallbackId) {
      await prisma.page.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic || false,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    } else {
      await prisma.page.create({
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic || false,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    }

    revalidatePath("/");
    revalidatePath("/sobre");
    revalidatePath(`/${data.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar página:", error);
    return { error: "Erro ao salvar página." };
  }
}

export async function deletePageAction(id: string) {
  await requireAdmin("deletePageAction");
  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (page?.isStatic) {
      return { error: "Páginas fixas do sistema (Home e Sobre) não podem ser deletadas." };
    }

    await prisma.page.delete({ where: { id } });

    revalidatePath("/sitemap.xml");
    if (page) revalidatePath(`/${page.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar página:", error);
    return { error: "Erro ao deletar página." };
  }
}
