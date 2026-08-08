import { prisma } from "./db";
import { POSTS, slugify } from "../app/data";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

export async function findPostBySlugOrId(identifier: string, requestedLang: string = "pt") {
  if (!identifier) return null;
  const cleanId = identifier.trim();

  try {
    const postBySlug = await prisma.post.findUnique({
      where: { slug: cleanId }
    });

    if (postBySlug) {
      if (postBySlug.translationGroupId && postBySlug.lang !== requestedLang && !(requestedLang === "pt" && !postBySlug.lang)) {
        const siblingInLang = await prisma.post.findFirst({
          where: {
            translationGroupId: postBySlug.translationGroupId,
            OR: [
              { lang: requestedLang },
              ...(requestedLang === "pt" ? [{ lang: null }] : [])
            ]
          }
        });
        if (siblingInLang) {
          return siblingInLang;
        }
      }
      return postBySlug;
    }
  } catch (err) {
    console.warn("findUnique by slug failed", err);
  }

  try {
    const numericGroupId = /^\d+$/.test(cleanId) ? parseInt(cleanId, 10) : undefined;
    let candidatePosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: cleanId },
          ...(numericGroupId ? [{ translationGroupId: numericGroupId }] : [])
        ]
      }
    });

    if (candidatePosts.length > 0) {
      const groupIds = Array.from(new Set(candidatePosts.map(p => p.translationGroupId).filter((g): g is number => g !== null && g !== undefined)));
      if (groupIds.length > 0) {
        candidatePosts = await prisma.post.findMany({
          where: {
            OR: [
              { id: { in: candidatePosts.map(p => p.id) } },
              { translationGroupId: { in: groupIds } }
            ]
          }
        });
      }

      let matchedPost = candidatePosts.find(p => p.lang === requestedLang);
      if (!matchedPost && requestedLang === "pt") {
        matchedPost = candidatePosts.find(p => !p.lang || p.lang === "pt");
      }
      if (!matchedPost) {
        matchedPost = candidatePosts.find(p => p.lang === "pt" || !p.lang) || candidatePosts[0];
      }
      return matchedPost;
    }
  } catch (err) {
    console.warn("findMany by ID/translationGroupId failed", err);
  }

  const staticPost = POSTS.find(p => p.slug === cleanId || String(p.id) === cleanId);
  return staticPost || null;
}

export async function generatePostMetadata(slug: string, lang: string = "pt") {
  try {
    const post: any = await findPostBySlugOrId(slug, lang);
    if (!post) return { title: "Post Não Encontrado" };

    let alternates: any = {};
    if (post.translationGroupId) {
      const siblings = await prisma.post.findMany({
        where: { translationGroupId: post.translationGroupId },
        select: { lang: true, slug: true }
      });
      const languages: Record<string, string> = {};
      siblings.forEach((s) => {
        if (s.lang) {
          languages[s.lang] = s.lang === "en" ? `/en/post/${s.slug}` : s.lang === "es" ? `/es/post/${s.slug}` : `/post/${s.slug}`;
        }
      });
      alternates = { languages };
    }

    return {
      title: `${stripHtml(post.seoTitle || post.title)} · Moto na Prática`,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords || `${post.tag}, Fazer 250, Moto`,
      alternates,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
      openGraph: {
        title: stripHtml(post.title),
        description: post.excerpt,
        images: [
          {
            url: post.img,
            width: 1200,
            height: 675,
            alt: stripHtml(post.title),
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: stripHtml(post.title),
        description: post.excerpt,
        images: [post.img],
      },
    };
  } catch (error) {
    return {
      title: "Moto na Prática",
      description: "Blog de motos"
    };
  }
}
