# 03 — Código do Site, Banco e CMS

## 1. Prioridade crítica: remover inferências falsas do frontend

No código atual, a Home pode:
- exibir “Consumo aferido” por fallback;
- classificar cards de Review como “TESTE DE LONGA DURAÇÃO / AVALIAÇÃO PRÁTICA”.

Isso deve ser removido antes da nova identidade.

**Regra:** frontend somente exibe “aferido”, “testado”, “longa duração”, “nossa medição”, “rodamos” ou equivalentes quando o banco contém evidência/metadado explícito.

## 2. Evolução do modelo Prisma

Não implementar como JSON genérico se a informação for estrutural.

### Novo model Author
Campos sugeridos:
- id;
- slug unique;
- name;
- type: PERSON | ORGANIZATION;
- bio;
- shortBio;
- avatarUrl;
- profileUrl opcional;
- role;
- sameAs Json;
- active;
- createdAt;
- updatedAt.

Autores iniciais:
- Eliezer Vargas;
- Redação Moto na Prática.

### Extensões de Post
Adicionar conceitualmente:
- editorialType;
- trafficIntent;
- authorId;
- reviewerId opcional;
- researchId opcional;
- personalExperienceVerified Boolean;
- factCheckedAt;
- disclosure opcional;
- correctionStatus;
- firstPublishedAt;
- updatedReason opcional.

### Model Source
- id;
- url;
- domain;
- title;
- publisher;
- sourceType;
- publishedAt;
- accessedAt;
- primarySource Boolean;
- confidence opcional.

### Model PostSource
- postId;
- sourceId;
- role: PRIMARY | SUPPORTING | DATA | QUOTE | BACKGROUND;
- note;
- sortOrder.

### Model Correction
- id;
- postId;
- createdAt;
- description pública;
- previousText opcional;
- correctedText opcional;
- reason;
- material Boolean.

### Performance
Criar mais tarde model/tabela `ContentPerformanceDaily`.

## 3. Migração segura

Sequência:
1. migration aditiva;
2. deploy compatível com dados antigos;
3. backfill de defaults;
4. atualização do CMS;
5. atualização de leitura;
6. ativação de validações fortes;
7. remover dependências legadas somente após migração.

Não tornar campos obrigatórios no banco no mesmo deploy em que são introduzidos sem backfill.

## 4. CMS

Adicionar controles visuais:
- tipo editorial;
- intenção de tráfego;
- autor;
- revisor;
- experiência pessoal validada;
- researchId;
- fontes;
- fonte primária;
- disclosure;
- correções;
- data de fact-check.

### Validações no publish
Bloquear publicação se:
- não houver autor;
- NEWS sem data;
- conteúdo factual sem fontes quando tipo exigir;
- PERSONAL_EXPERIENCE sem flag;
- title/excerpt ausentes;
- slug inválido;
- imagem inadequada quando obrigatória.

## 5. Página de artigo

Deve receber do banco:
- autor real;
- tipo;
- publishedAt;
- modifiedAt;
- fontes;
- correções;
- metodologia;
- related posts.

Componentes:
- ArticleHeader;
- AuthorByline;
- FreshnessMeta;
- QuickAnswer;
- SourceSummary;
- ArticleBody;
- CorrectionNotice;
- ResearchMethodDisclosure;
- AuthorCard;
- RelatedArticles.

## 6. Páginas de autor

Rotas:
- `/autor/eliezer-vargas`
- `/autor/redacao-moto-na-pratica`

Devem renderizar:
- identidade;
- bio;
- papel;
- artigos;
- links públicos válidos;
- schema ProfilePage para pessoa quando aplicável.

## 7. Páginas institucionais

Criar como rotas/CMS estruturado:
- /sobre;
- /contato;
- /politica-editorial;
- /como-pesquisamos;
- /politica-de-correcoes;
- /uso-de-inteligencia-artificial;
- /publicidade-e-afiliados;
- /privacidade;
- /termos.

## 8. Categorias e rotas

Novos clusters principais:
- /noticias;
- /motos;
- /comprar;
- /comparativos;
- /manutencao;
- /motogp.

Compatibilidade:
- mapear rotas antigas;
- manter redirect 301 quando URL mudar;
- não quebrar backlinks existentes.

## 9. Busca

A busca atual pode continuar inicialmente, mas deve evoluir para:
- filtros por categoria;
- ordenação por data/relevância;
- resultados por idioma;
- sem resultados estáticos misturados com produção de forma enganosa.

## 10. Remover fallbacks editoriais perigosos

Auditar `POSTS` estáticos e qualquer fallback que:
- injete conteúdo fictício;
- substitua banco vazio por post demo em produção;
- atribua métricas;
- atribua consumo;
- atribua categorias falsas.

Fallback visual pode existir, mas deve ser neutro e claramente técnico.

## 11. Feature flags

Sugestão:
- `EDITORIAL_V2_ENABLED`;
- `NEW_HOME_ENABLED`;
- `TRUST_LAYER_ENABLED`.

Preferir server-side env/feature config para evitar exposição desnecessária.

## 12. Segurança e sanitização

Manter SafeHtml rigoroso.
Auditar:
- URLs externas;
- links com `rel`;
- embeds;
- uploads;
- admin auth;
- APIs internas do n8n;
- assinatura/token do webhook de publicação.

## 13. Critérios de aceite técnico

- build passa;
- TypeScript passa;
- testes passam;
- migration reversível/documentada;
- sem fallback que invente experiência;
- CMS consegue criar post V2;
- post legado continua renderizando;
- structured data usa dados reais;
- páginas institucionais são indexáveis;
- admin permanece não indexável;
- nenhum secret chega ao cliente.
