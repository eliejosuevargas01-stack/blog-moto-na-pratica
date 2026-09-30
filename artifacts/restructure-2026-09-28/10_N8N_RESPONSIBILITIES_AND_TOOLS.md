# 10 — Responsabilidades do n8n, Ferramentas e Fronteiras

> **Natureza:** especificação normativa de responsabilidades. O enum de `editorial_type` canônico é o definido em `05_CONTENT_TAXONOMY_AND_MIGRATION.md`. Estado remoto documentado: `12_N8N_REFOUNDATION_STATE.md`.

## Objetivo

Definir de forma operacional o papel de cada componente do sistema editorial no n8n, onde atua, como atua e quais ferramentas utiliza.

O objetivo é evitar sobreposição de responsabilidade, re-pesquisa desnecessária, escrita baseada em suposição e mudanças que prejudiquem o Deep Research já construído.

---

# 1. Visão geral do fluxo

```
Radar de Pautas
    ↓
Diretor de Crescimento Editorial
    ↓
Deep Research
    ↓
Editor de Pauta
    ↓
Escritor
    ↓
Auditor Editorial
    ↓
Publisher
    ↓
CMS / Site
```

Fluxos auxiliares:
- ingestão de métricas;
- atualização de conteúdo;
- correções;
- monitoramento de falhas;
- deduplicação;
- observabilidade.

---

# 2. Radar de Pautas

## Função

Descobrir assuntos candidatos a publicação.

Não decide sozinho o que será publicado e não escreve artigo.

## Onde atua

No início do pipeline.

Pode existir como um workflow próprio ou como etapa anterior ao Diretor de Crescimento.

## Como atua

Coleta sinais externos e internos, normaliza e agrupa assuntos semelhantes.

Deve evitar disparar várias pesquisas para a mesma pauta.

## Ferramentas permitidas

- HTTP Request;
- RSS/Atom;
- APIs de tendências;
- APIs de fabricantes;
- feeds de portais;
- Google Trends ou ferramenta equivalente;
- fontes de MotoGP;
- dados internos do banco;
- busca web via ferramentas já integradas;
- Redis/Supabase/Postgres para deduplicação e estado;
- n8n Code Node para normalização.

## Saída

Deve gerar no mínimo:
- topic_id;
- topic_title;
- source_origin;
- source_url;
- detected_at;
- entities;
- freshness;
- initial_reason;
- possible_category.

## Não deve

- escrever artigo;
- inventar tendência;
- pontuar assunto com base em opinião pessoal;
- iniciar Deep Research duplicado;
- publicar diretamente.

---

# 3. Diretor de Crescimento Editorial

## Função

Decidir se a pauta merece entrar no pipeline editorial e qual será sua função estratégica.

## Onde atua

Entre Radar e Deep Research.

## Como atua

Analisa os sinais reunidos pelo Radar e classifica a pauta.

Ele não faz Deep Research completo.

Pode fazer apenas verificações rápidas necessárias para entender a natureza da pauta.

## Ferramentas permitidas

- dados do Radar;
- dados de Search Console;
- dados de analytics;
- histórico de posts;
- histórico de performance;
- tabelas internas de clusters;
- consultas leves via HTTP;
- LLM de classificação/análise;
- banco para verificar duplicidade/canibalização.

## Deve decidir

- PROCEED ou SKIP;
- editorial_type;
- traffic_intent;
- primary_query;
- secondary_queries;
- target_audience;
- urgency;
- shelf_life;
- angle;
- authority_value;
- expected_value;
- reason_for_decision.

## Traffic intents

- SEARCH;
- DISCOVER;
- NEWS;
- EVERGREEN;
- AUTHORITY.

## Editorial types

- NEWS;
- ANALYSIS;
- BUYING_GUIDE;
- COMPARISON;
- MAINTENANCE_GUIDE;
- EXPLAINER;
- MOTORSPORT_REPORT;
- PERSONAL_EXPERIENCE;
- DATA_STUDY;
- REVIEW_VERIFIED.

## Não deve

- inventar fatos;
- escrever o texto final;
- substituir o Deep Research;
- decidir "review" sem evidência;
- forçar conteúdo longo;
- mandar publicar sem pesquisa.

---

# 4. Deep Research

## Função

Produzir o dossiê factual que sustentará o artigo.

É o núcleo de verdade do pipeline.

## Onde atua

Após aprovação do Diretor de Crescimento.

## Como atua

Executa pesquisa iterativa e adaptativa:
- cria queries;
- consulta fontes;
- lê conteúdo limpo;
- extrai fatos;
- avalia idade;
- avalia confiabilidade;
- identifica contradições;
- detecta lacunas;
- refaz buscas;
- consolida o dossiê.

## Ferramentas permitidas

As ferramentas de pesquisa já existentes no fluxo atual, incluindo:
- busca web;
- HTTP Request;
- scraping/extração de texto;
- APIs oficiais;
- fontes de fabricantes;
- portais especializados;
- documentos técnicos;
- bancos públicos;
- fontes esportivas oficiais;
- ferramentas de leitura estruturada;
- LLMs para decomposição e síntese;
- armazenamento temporário/persistente de research state.

## Prioridade de fontes

1. fonte oficial/primária;
2. documentação;
3. dados públicos;
4. veículo especializado confiável;
5. fonte secundária de contexto;
6. comunidade apenas como evidência anedótica.

## Saída

- research_id;
- topic_id;
- generated_at;
- main_question;
- facts;
- claims;
- claim_sources;
- source_type;
- source_date;
- source_age;
- source_reliability;
- conflicts;
- gaps;
- exact_numbers;
- primary_sources;
- secondary_sources;
- rumors;
- unsupported_claims;
- forbidden_assertions.

## Não deve

- escrever o artigo final;
- decidir tom;
- criar vivência pessoal;
- preencher lacuna com suposição;
- reduzir pesquisa só para ganhar velocidade;
- ser substituído sem benchmark.

---

# 5. Editor de Pauta

## Função

Transformar o dossiê em briefing editorial.

## Onde atua

Entre Deep Research e Escritor.

## Como atua

Usa apenas:
- decisão do Diretor;
- dossiê do Deep Research;
- contexto editorial do Moto na Prática;
- dados internos de links/posts relacionados.

Não deve pesquisar novamente salvo falha formal do dossiê.

## Ferramentas permitidas

- LLM;
- banco/CMS para links relacionados;
- Search Console/analytics como contexto;
- taxonomia interna;
- dados do site.

## Saída

- headline_draft;
- deck;
- core_question;
- reader_profile;
- promise;
- structure;
- target_length;
- must_include;
- must_not_claim;
- primary_sources;
- internal_links;
- CTA;
- tone;
- article_format.

## Não deve

- contradizer o dossiê;
- transformar notícia curta em artigo longo por padrão;
- inventar dado;
- forçar keyword stuffing;
- reabrir pesquisa sem motivo.

---

# 6. Escritor

## Função

Transformar briefing + dossiê em texto publicável.

## Onde atua

Depois do Editor de Pauta.

## Como atua

Recebe:
- briefing;
- dossiê;
- regras de tom;
- tipo editorial;
- informações de autoria;
- disclosure aplicável.

## Ferramentas permitidas

- LLM de escrita;
- dossiê;
- briefing;
- base de links internos;
- taxonomia;
- templates por formato.

O Escritor não deve navegar livremente pela internet se o Deep Research já consolidou o assunto.

Se identificar falta factual, deve retornar:
`NEEDS_RESEARCH`
com descrição da lacuna.

## Tom

- papo reto;
- brasileiro natural;
- próximo;
- simples;
- sem linguagem corporativa;
- sem dramatização constante.

## Primeira pessoa

Permitida apenas quando:
`personal_experience_verified = true`

Caso contrário:
- usar voz editorial impessoal/institucional quando apropriado;
- “a gente” pode ser voz de marca, mas NÃO cria autoria automaticamente;
- `authorSlug` permanece ausente até existir atribuição explícita;
- nunca fingir experiência.

## Não deve

- inventar pilotagem;
- inventar consumo;
- inventar manutenção;
- inventar oficina;
- inventar quilometragem;
- inventar teste;
- inventar preço;
- transformar rumor em fato;
- chamar análise documental de review.

---

# 7. Auditor Editorial

## Função

Validar o artigo contra o dossiê e contra as regras editoriais.

## Onde atua

Depois do Escritor e antes do Publisher.

## Como atua

Compara claim por claim.

## Ferramentas permitidas

- artigo;
- dossiê;
- briefing;
- lista de fontes;
- regras editoriais;
- schema de saída;
- LLM de auditoria.

Pode pedir retorno ao Deep Research apenas quando houver lacuna real.

## Verifica

- números;
- datas;
- preços;
- especificações;
- modelos/versões;
- declarações;
- rumores;
- autoria;
- primeira pessoa;
- fontes;
- consistência temporal;
- exageros;
- conflitos com o dossier.

## Saída

- PASS;
- REVISE;
- BLOCK.

Com lista de problemas:
- severity;
- claim;
- reason;
- expected_fix;
- source_reference.

## Não deve

- reescrever livremente o artigo inteiro;
- aprovar alegação sem fonte;
- baixar severidade por "ficar melhor no texto".

---

# 8. Publisher

## Função

Transformar o conteúdo aprovado em payload estruturado para o CMS.

## Onde atua

Última etapa editorial antes do site.

## Como atua

Recebe somente conteúdo PASS.

## Ferramentas permitidas

- HTTP Request para CMS/API;
- webhook autenticado;
- banco;
- storage para imagem;
- serviços de imagem/licenciamento aprovados;
- utilitários de slug;
- validadores de schema/payload;
- n8n Code Node.

## Payload esperado

- title;
- slug;
- excerpt;
- body;
- editorialType;
- trafficIntent;
- category;
- tags;
- authorSlug somente quando explicitamente atribuído; nunca usar `redacao-moto-na-pratica` como fallback;
- reviewer somente quando houver revisão real registrada;
- personalExperienceVerified;
- researchId;
- sources;
- disclosure;
- seoTitle;
- seoDescription;
- featuredImage;
- imageCredit;
- relatedPostCandidates;
- publishedAt;
- factCheckedAt.

## Não deve

- definir canonical final;
- gerar JSON-LD final;
- publicar draft sem PASS;
- criar autor fictício;
- criar fonte fictícia;
- publicar duas vezes a mesma pauta.

---

# 9. CMS / Site

## Função

Persistir e renderizar o conteúdo.

## Onde atua

Fora do n8n.

## Responsabilidades

- banco;
- schema;
- author pages;
- categories;
- canonical;
- structured data;
- sitemap;
- news sitemap;
- UI;
- performance;
- fontes;
- correções;
- metadata final;
- experiência visual.

## Regra

O site nunca deve inferir que algo foi testado.
O site só renderiza o que foi persistido explicitamente.

---

# 10. Growth Loop

## Função

Devolver sinais de performance ao Diretor de Crescimento.

## Ferramentas permitidas

- Google Search Console;
- analytics;
- banco;
- n8n scheduled jobs;
- Code Nodes;
- agregações SQL.

## Sinais

- low CTR;
- near-win;
- momentum;
- decay;
- branded search;
- authority gap.

## Não deve

- editar produção automaticamente;
- apagar post;
- trocar título sem regra/aprovação;
- reagir a ruído de um único dia.

---

# 11. Armazenamento e estado

## Banco persistente

Usar Postgres/Supabase para:
- topic_id;
- research_id;
- post_id;
- status;
- auditoria;
- histórico;
- métricas;
- relações permanentes.

## Redis

Usar quando necessário para:
- locks;
- idempotência temporária;
- deduplicação rápida;
- rate limiting;
- cache curto.

Não usar Redis como fonte canônica de publicação.

---

# 12. Fronteiras obrigatórias

Radar descobre.
Diretor decide.
Deep Research prova.
Editor estrutura.
Escritor comunica.
Auditor valida.
Publisher entrega.
CMS persiste.
Site renderiza.
Analytics mede.
Diretor aprende.

Se uma etapa começar a fazer o trabalho principal de outra, o desenho deve ser revisado.
