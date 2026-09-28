# 07 — SEO Técnico, Google News e Discover

## 1. Responsabilidade

O n8n sugere campos de conteúdo.
O site gera metadata técnica final.

## 2. Structured Data

### Home
Organization.

### Autor pessoa
ProfilePage + Person.

### Artigo evergreen
Article ou BlogPosting conforme decisão técnica.

### Notícia
NewsArticle.

### Todos quando aplicável
BreadcrumbList.

Nunca marcar:
- notícia antiga como fresca;
- review sem review;
- autor fictício;
- dateModified artificial.

## 3. Organization

Campos:
- name;
- url;
- logo;
- description;
- founder quando apropriado;
- sameAs;
- contactPoint se fizer sentido.

## 4. Article/NewsArticle

Gerar de dados persistidos:
- headline;
- description;
- image;
- datePublished;
- dateModified;
- author;
- publisher;
- mainEntityOfPage.

## 5. Canonical

Uma canonical por página.
Evitar canonicals contraditórias entre idiomas.

## 6. Internacionalização

O projeto já possui suporte PT/ES/EN.
Quando reativado/expandido:
- hreflang;
- x-default se apropriado;
- canonical por idioma;
- translationGroupId consistente;
- sitemaps por idioma se necessário.

A prioridade inicial é PT-BR.

## 7. Sitemap

Revisar `src/app/sitemap.ts`:
- remover rotas antigas que deixarem de existir;
- incluir novas categorias;
- respeitar published/status;
- excluir rascunhos;
- URLs corretas por idioma;
- lastModified real.

## 8. News Sitemap

Criar endpoint dedicado:
- somente conteúdo elegível;
- somente últimas 48h;
- publication name;
- language;
- publication date;
- title.

Não misturar evergreen.

## 9. Robots

Manter:
- admin bloqueado;
- APIs internas bloqueadas.

Adicionar sitemaps necessários.
Validar que assets críticos não estejam bloqueados.

## 10. Discover

Requisitos de produto:
- imagens grandes;
- largura mínima alvo >= 1200 px;
- `max-image-preview:large`;
- título descritivo;
- sem clickbait enganoso;
- boa experiência mobile;
- conteúdo atual/original.

## 11. Imagens

Prioridade:
1. própria;
2. press kit oficial com uso permitido;
3. licenciada;
4. gráfico original;
5. ilustração.

Armazenar:
- crédito;
- origem;
- alt;
- dimensões;
- focal point.

## 12. Open Graph / Social

Gerar:
- og:title;
- og:description;
- og:image;
- twitter card;
- canonical URL.

Não deixar default genérico em posts.

## 13. RSS

Criar feed editorial estável.
Pode ser separado por idioma/categoria depois.

## 14. Performance budget

Metas:
- LCP <= 2.5s;
- INP < 200ms;
- CLS < 0.1.

Monitorar:
- tamanho de JS;
- imagem hero;
- fontes;
- hidratação;
- widgets MotoGP;
- componentes terceiros.

## 15. Indexação

Não depender de “Indexing API” para conteúdo comum como se fosse garantia de indexação.
Garantir primeiro:
- links internos;
- sitemap;
- HTTP 200;
- canonical;
- conteúdo útil;
- rastreabilidade.

## 16. Testes

Automatizar:
- sitemap snapshots;
- JSON-LD schema;
- canonical;
- noindex;
- redirects;
- metadata;
- news sitemap 48h.

## 17. Definition of Done SEO

- schema válido;
- sitemap válido;
- news sitemap válido;
- canonical correto;
- páginas de autor indexáveis;
- admin não indexável;
- nenhum draft no sitemap;
- imagens Discover adequadas;
- CWV dentro do budget ou sem regressão relevante.
