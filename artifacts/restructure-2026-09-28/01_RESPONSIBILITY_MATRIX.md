# 01 — Matriz de Responsabilidades

## 1. Regra principal

Cada camada deve possuir uma responsabilidade clara. O maior risco da reestruturação é colocar decisões editoriais dentro do frontend ou decisões técnicas dentro do LLM.

## 2. n8n / Sistema editorial automatizado

**É responsável por:**
- descobrir pautas;
- classificar intenção e formato;
- acionar Deep Research;
- consolidar dossiê;
- propor ângulo editorial;
- redigir;
- auditar consistência contra o dossiê;
- produzir campos editoriais e SEO de conteúdo;
- enviar payload estruturado ao CMS;
- acompanhar status editorial;
- futuramente consumir métricas de performance e gerar recomendações.

**Não é responsável por:**
- gerar canonical final;
- decidir URL real depois da publicação;
- renderizar schema JSON-LD;
- fingir que um autor humano revisou algo;
- criar experiência pessoal;
- inventar métricas, testes ou consumo;
- alterar diretamente templates visuais;
- decidir redirects;
- executar migration Prisma fora de fluxo técnico.

## 3. Deep Research

**Permanece responsável por:**
- decomposição inteligente da pesquisa;
- buscas iterativas;
- leitura e extração de fontes;
- resolução de lacunas;
- datação dos fatos;
- avaliação de confiabilidade;
- identificação de divergências;
- consolidação de evidências.

**Mudanças permitidas:**
- padronizar input;
- padronizar output;
- incluir IDs de fonte;
- incluir claims apoiadas por fonte;
- incluir nível de confiança;
- incluir freshness;
- incluir fact gaps.

**Mudanças proibidas nesta fase:**
- substituir por outro agente;
- reduzir profundidade para ganhar velocidade sem benchmark;
- remover recursão/busca adaptativa que já funcione.

## 4. Código do site / Next.js

**É responsável por:**
- renderização;
- experiência do usuário;
- roteamento;
- canonical;
- metadata;
- structured data;
- páginas de autor;
- páginas institucionais;
- páginas de categoria;
- apresentação das fontes;
- apresentação de correções;
- performance;
- acessibilidade;
- imagem responsiva;
- sitemap;
- news sitemap;
- robots;
- feeds;
- redirects;
- exposição segura de conteúdo do banco.

**Não é responsável por:**
- determinar se uma notícia é verdadeira;
- inferir que um post é “review”;
- inventar label baseado em slug;
- inventar consumo com fallback;
- promover automaticamente um texto a “teste real”;
- atribuir autoria sem metadado.

## 5. Prisma/Supabase/CMS

**É a fonte canônica para:**
- posts;
- status;
- tipo editorial;
- taxonomia;
- autores;
- fontes;
- correções;
- datas;
- flags de experiência real;
- links entre traduções;
- dados de performance persistidos;
- logs editoriais quando implementados.

**CMS deve permitir:**
- editar metadados sem editar JSON bruto;
- visualizar fontes;
- selecionar autor;
- selecionar tipo editorial;
- sinalizar experiência pessoal;
- inserir disclosure;
- marcar revisão;
- alterar status;
- validar campos obrigatórios antes de publicar.

## 6. Analytics / Growth

**É responsável por:**
- coleta de Search Console;
- analytics;
- métricas de página;
- agrupamento por cluster;
- armazenamento de snapshots;
- cálculo de tendências;
- sinalização de oportunidades;
- envio de contexto ao n8n.

**Não pode:**
- reescrever artigo automaticamente em produção;
- apagar conteúdo;
- trocar título em massa sem aprovação/regra;
- concluir “pauta ruim” por poucos dias de dados.

## 7. Operações / Infra

**É responsável por:**
- migrations;
- secrets;
- deploy;
- rollback;
- backups;
- feature flags;
- observabilidade;
- validação pós-deploy;
- proteção do admin.

## 8. Responsabilidade humana obrigatória

Algumas decisões não devem ser delegadas à IA nesta fase:
- afirmação de experiência pessoal de Eliezer;
- aprovação da bio pessoal;
- política editorial pública;
- política de correções;
- disclosure de IA;
- decisões legais/comerciais;
- uso de fotos próprias;
- confirmação de que um teste/review ocorreu;
- aprovação de informações de contato;
- criação e controle de perfis sociais oficiais.

## 9. Fronteiras de integração

### n8n → CMS
Entrega payload editorial estruturado. O CMS valida e persiste.

### CMS → Site
Site renderiza dados persistidos. Não infere fatos ausentes.

### Site → Analytics
Site emite eventos mínimos, preservando performance e privacidade.

### Analytics → banco
Ingestão diária cria séries históricas.

### banco → n8n
Diretor de Crescimento recebe métricas consolidadas, não acesso irrestrito ao banco de produção.

## 10. Regra de conflito

Se houver conflito:
1. verdade factual > SEO;
2. segurança/confiança > automação;
3. experiência real > copy mais chamativa;
4. fonte primária > agregador;
5. dados persistidos > inferência do frontend;
6. decisão editorial registrada > comportamento legado.
