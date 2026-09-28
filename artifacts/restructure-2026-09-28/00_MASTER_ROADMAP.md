# 00 — Master Roadmap

## 1. Estado atual relevante

O projeto já é um portal customizado em Next.js 14, TypeScript, Prisma e PostgreSQL/Supabase, com CMS próprio, SSR, uploads, internacionalização, newsletter, MotoGP e automações n8n.

O problema principal não é falta de infraestrutura. É desalinhamento entre infraestrutura, posicionamento, conteúdo e sinais de confiança.

Achados técnicos já observados no código atual:

- `Post` usa campos genéricos `tag` e `category`, sem modelo editorial forte.
- não existem estruturas formais para autor, revisor, fontes, correções, tipo editorial ou método de pesquisa.
- a Home possui uma seção chamada “Testes & Avaliações da Redação”.
- a função `getConsumptionLabel()` contém fallbacks que podem exibir “Consumo aferido” mesmo sem medição correspondente.
- cards podem exibir “TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA” para posts classificados genericamente como Review.
- o sitemap atual cobre páginas e posts, mas não existe news sitemap específico.
- o `robots.ts` já bloqueia `/admin/` e `/api/`, o que é uma base aceitável.
- a Home atual já possui estrutura de portal, mas ainda representa categorias antigas e uma identidade editorial que será substituída.

Esses pontos devem ser tratados como riscos de confiança, não apenas ajustes visuais.

## 2. Resultado esperado

Ao final da reestruturação, o Moto na Prática deve operar como uma publicação independente com:

- identidade editorial clara;
- autoria rastreável;
- fontes visíveis;
- conteúdo diferenciado por formato;
- Deep Research formalmente integrado ao contrato editorial;
- UI de portal popular e legível em mobile;
- arquitetura temática coerente;
- conteúdo pessoal somente quando houver experiência real;
- schema estruturado correto;
- Google News/Discover tecnicamente preparados;
- métricas retornando ao n8n para orientar pauta;
- presença externa consistente;
- processo de correções e transparência público.

## 3. Fases de execução

### Fase A — Baseline e congelamento de métricas

Antes de lançar qualquer mudança:
- exportar Search Console dos últimos 28 e 90 dias;
- registrar cliques, impressões, CTR, posição, páginas e queries;
- registrar analytics disponível;
- registrar número de URLs indexadas;
- registrar Core Web Vitals;
- registrar backlinks conhecidos e resultados de busca por marca;
- salvar snapshot da distribuição atual por categoria/tag.

**Saída:** baseline versionado ou registrado em banco/documento operacional.

### Fase B — Fundação de confiança e modelo de dados

Primeiro mudar a capacidade estrutural do site:
- criar entidades de autor;
- criar tipos editoriais;
- criar fontes por artigo;
- criar flags de experiência real;
- criar campos de revisão/fact-check;
- criar política de correção;
- suportar páginas institucionais;
- remover labels automáticos que alegam experiência inexistente.

Essa fase antecede a troca dos prompts, pois os agentes precisam ter onde persistir os novos metadados.

### Fase C — Arquitetura editorial e n8n

Reconfigurar o pipeline sem destruir o Deep Research:
Radar → Diretor de Crescimento → Deep Research → Editor de Pauta → Escritor → Auditor Editorial → Publisher.

O Deep Research recebe contrato de entrada e saída versionado, mas sua capacidade interna permanece.

### Fase D — UI/UX e arquitetura de informação

Lançar a nova paleta clara já preparada junto com:
- nova navegação;
- nova Home;
- páginas de categoria;
- página de artigo com autoria e fontes;
- páginas de autor;
- sinais de confiança;
- layouts mobile;
- componentes específicos por tipo de conteúdo.

### Fase E — Migração do acervo

Executar inventário de todos os posts e classificar cada um como:
KEEP, UPDATE, MERGE, REMOVE, FACT_CHECK.

Não alterar dezenas de URLs no escuro. Cada ação deve gerar registro de origem, destino e motivo.

### Fase F — SEO técnico, News e Discover

Implementar:
- Article / NewsArticle;
- Organization;
- ProfilePage;
- BreadcrumbList;
- canonicals;
- sitemap normal revisado;
- news sitemap de 48h;
- RSS/feeds necessários;
- imagens >= 1200px onde aplicável;
- `max-image-preview:large`;
- metadata consistente;
- performance budget.

### Fase G — Autoridade externa

Consolidar entidade “Moto na Prática” fora do domínio:
- perfis oficiais consistentes;
- email de domínio;
- canais sociais;
- YouTube;
- informações institucionais coerentes;
- fontes primárias próprias;
- backlinks conquistados por utilidade e dados originais.

### Fase H — Growth loop

Conectar Search Console/analytics ao ciclo editorial:
- coleta diária;
- tabela de performance;
- análise de crescimento;
- oportunidades;
- alertas de queda;
- feedback ao Diretor de Crescimento.

## 4. Dependências críticas

- Não reescrever prompts antes de definir o novo contrato de conteúdo.
- Não migrar conteúdo antes de fechar a taxonomia.
- Não publicar páginas de autor antes de definir autoria verdadeira.
- Não ativar `NewsArticle` indiscriminadamente em evergreen.
- Não expor “revisado por” sem revisão humana ou editorial real.
- Não liberar automação de correção automática em massa sem preview.
- Não mudar URLs sem mapa de redirects.
- Não criar dados de autoridade falsos, números de leitores, avaliações ou testes inexistentes.

## 5. Definição macro de sucesso

A reestruturação é considerada funcional quando:
- todo post novo tem tipo editorial válido;
- todo post novo tem autor identificável;
- notícias possuem fontes rastreáveis;
- nenhum componente afirma “teste”, “aferido”, “rodamos” ou equivalente sem evidência;
- Home e navegação refletem clusters novos;
- schema valida sem erros críticos;
- sitemaps estão corretos;
- métricas chegam ao sistema de growth;
- páginas institucionais estão publicadas;
- conteúdo novo nasce pelo pipeline V2;
- o acervo legado está inventariado;
- o site mantém ou melhora CWV e acessibilidade.

## 6. O que NÃO faz parte desta primeira reestruturação

- redesenhar novamente a paleta já criada;
- substituir o Deep Research;
- migrar para outro CMS;
- trocar Next.js/Supabase/Prisma apenas por preferência tecnológica;
- criar comunidade complexa antes de estabelecer tráfego;
- monetização agressiva antes de consolidar confiança;
- expandir PT/ES/EN simultaneamente se isso prejudicar o core em português.
