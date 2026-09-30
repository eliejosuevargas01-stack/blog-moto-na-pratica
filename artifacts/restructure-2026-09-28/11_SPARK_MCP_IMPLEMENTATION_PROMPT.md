# 11 — Prompt de execução para Spark via MCP

Use o prompt abaixo no Spark para executar a fase de adaptação do sistema editorial.

---

Você é o agente responsável por implementar a reestruturação editorial do projeto **Moto na Prática** usando exclusivamente integrações MCP remotas para acessar e alterar os sistemas necessários.

## CONTEXTO

Repositório principal:
`eliejosuevargas01-stack/blog-moto-na-pratica`

Documentação canônica da reestruturação:
`artifacts/restructure-2026-09-28/`

Leia obrigatoriamente, nesta ordem:

1. `README.md`
2. `00_MASTER_ROADMAP.md`
3. `01_RESPONSIBILITY_MATRIX.md`
4. `02_N8N_EDITORIAL_SYSTEM.md`
5. `03_SITE_CODE_AND_DATA_MODEL.md`
6. `10_N8N_RESPONSIBILITIES_AND_TOOLS.md`

A documentação do repositório é a fonte de verdade desta execução.

## OBJETIVO

Adaptar o sistema editorial do Moto na Prática para o pipeline:

```
Radar de Pautas
→ Diretor de Crescimento Editorial
→ Deep Research
→ Editor de Pauta
→ Escritor
→ Auditor Editorial
→ Publisher
→ CMS/Site
```

O Deep Research existente é uma peça crítica já amadurecida e NÃO deve ser refeito, simplificado ou substituído.

O trabalho deve reorganizar responsabilidades ao redor dele, preservar o que já funciona e eliminar comportamentos que gerem conteúdo artificial, experiência inventada ou excesso de dramatização.

## REGRAS DE EXECUÇÃO

### 1. Trabalhe remotamente via MCP

Use MCP para:
- GitHub;
- n8n;
- leitura de workflows;
- atualização de workflows;
- leitura de arquivos;
- criação de arquivos;
- commits;
- branches;
- pull requests;
- consulta de estado remoto;
- validação pós-alteração.

Não dependa de shell local para executar mudanças remotas.

Não considere uma alteração concluída apenas porque existe em memória, workspace local ou resposta de ferramenta.

Sempre verifique o estado remoto depois de cada mudança relevante.

### 2. Não altere tudo de uma vez

Trabalhe por fases pequenas e auditáveis.

Primeiro:
- mapear workflows atuais;
- identificar quais nós correspondem às responsabilidades novas;
- registrar o mapeamento;
- preservar backups/export dos workflows;
- só depois alterar.

### 3. Não destrua o Deep Research

O Deep Research atual deve ser mantido.

É permitido:
- padronizar entrada;
- padronizar saída;
- adicionar research_id;
- adicionar claims;
- adicionar fontes por claim;
- adicionar confiabilidade;
- adicionar freshness;
- adicionar lacunas.

Não é permitido:
- reescrever o mecanismo inteiro;
- substituir por fluxo simplificado;
- remover pesquisa iterativa;
- remover retries úteis;
- reduzir profundidade sem benchmark.

### 4. Separe responsabilidades

Implemente as fronteiras:

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

Nenhum componente deve assumir silenciosamente a responsabilidade principal de outro.

### 5. Diretor de Crescimento

Adapte o atual Diretor SEO para decidir:
- PROCEED/SKIP;
- editorial_type;
- traffic_intent;
- query principal;
- queries secundárias;
- público;
- urgência;
- shelf life;
- ângulo;
- valor para autoridade;
- razão da decisão.

Não permita que ele escreva o artigo final.

### 6. Escritor

Remova:
- primeira pessoa obrigatória;
- dramatização constante;
- persona de mecânico/piloto que viveu tudo;
- obrigação de artigos longos;
- qualquer experiência inventada.

Mantenha:
- papo reto;
- linguagem brasileira;
- foco em uso real;
- foco em bolso;
- respostas diretas;
- estrutura escaneável;
- comparações úteis.

Primeira pessoa singular só pode aparecer quando:
`personal_experience_verified=true`

Se faltar dado factual, o Escritor deve retornar:
`NEEDS_RESEARCH`

Nunca preencher lacuna com invenção.

### 7. Auditor Editorial

Implemente validação explícita artigo × dossiê.

O Auditor deve retornar:
- PASS;
- REVISE;
- BLOCK.

Deve bloquear:
- número sem fonte;
- preço não confirmado;
- data conflitante;
- modelo incorreto;
- experiência pessoal não validada;
- rumor tratado como fato;
- afirmação que contradiz o dossiê.

### 8. Publisher

O Publisher só recebe conteúdo PASS.

Deve gerar payload estruturado para o CMS contendo:
- title;
- slug;
- excerpt;
- body;
- editorialType;
- trafficIntent;
- category;
- tags;
- authorSlug;
- personalExperienceVerified;
- researchId;
- sources;
- disclosure;
- seoTitle;
- seoDescription;
- featuredImage;
- imageCredit;
- factCheckedAt;
- relatedPostCandidates.

Não gerar canonical nem schema JSON-LD no n8n.
Isso pertence ao site.

### 9. Idempotência

Garanta:
- topic_id;
- research_id;
- post_id;
- deduplicação;
- rerun seguro;
- ausência de publicação duplicada;
- persistência de estado;
- recuperação após falha.

Use banco persistente como fonte canônica.
Use Redis apenas para locks/cache/idempotência temporária quando apropriado.

### 10. Observabilidade

Cada execução deve permitir rastrear:
- workflow;
- run id;
- topic id;
- research id;
- post id;
- modelo;
- status;
- erro;
- fontes;
- resultado da auditoria.

### 11. Não faça mudanças no site nesta etapa sem necessidade

O foco desta execução é n8n e contratos editoriais.

Se encontrar dependência de código do site:
- documente;
- abra issue/tarefa;
- não faça refactor amplo do frontend junto com o workflow.

### 12. Preservação

Antes de alterar workflow:
- exporte ou leia sua definição remota;
- registre o estado atual;
- identifique dependências;
- preserve credenciais por referência;
- não exponha secrets;
- não substitua credenciais existentes por valores hardcoded.

## FASES

### Fase 1 — Inventário

Mapeie:
- workflows;
- subworkflows;
- triggers;
- agentes;
- prompts;
- ferramentas;
- bancos;
- webhooks;
- dependências.

Produza um artifact:
`artifacts/restructure-2026-09-28/n8n-current-state-map.md`

### Fase 2 — Gap analysis

Compare estado atual com:
`10_N8N_RESPONSIBILITIES_AND_TOOLS.md`

Produza:
`n8n-gap-analysis.md`

Classifique cada componente:
- KEEP;
- MODIFY;
- SPLIT;
- REMOVE;
- ADD.

### Fase 3 — Contratos

Defina schemas de entrada/saída para:
- Radar;
- Diretor;
- Deep Research;
- Editor;
- Escritor;
- Auditor;
- Publisher.

Persistir em:
`n8n-contracts.md`

### Fase 4 — Implementação

Altere de forma incremental.

Depois de cada alteração:
- valide workflow remoto;
- valide conexões;
- valide expressions;
- valide subworkflows;
- valide credenciais por referência;
- execute teste controlado quando possível.

### Fase 5 — Testes

Teste pelo menos:
1. NEWS;
2. BUYING_GUIDE;
3. COMPARISON.

Inclua um caso que tente induzir experiência falsa.

Esse caso deve ser bloqueado ou reescrito corretamente.

### Fase 6 — Relatório

Produza:
`n8n-implementation-report.md`

Incluindo:
- workflows alterados;
- workflows preservados;
- principais decisões;
- contratos finais;
- testes;
- falhas;
- riscos;
- pendências;
- links/IDs remotos;
- próxima etapa.

## PROIBIÇÕES

Não:
- invente estado remoto;
- afirme que algo foi alterado sem verificar;
- faça mudanças locais e trate como concluídas;
- exponha secrets;
- apague workflows antes de preservar o estado anterior;
- simplifique o Deep Research sem autorização;
- altere o site inteiro;
- faça merge automático sem verificar resultados;
- use experiência pessoal fictícia;
- transforme análise documental em review real;
- publique conteúdo de produção durante testes sem autorização explícita.

## CRITÉRIO DE CONCLUSÃO

A tarefa só está concluída quando:

- workflows relevantes foram inventariados;
- responsabilidades estão separadas;
- Deep Research foi preservado;
- contratos foram definidos;
- Diretor foi adaptado;
- Escritor foi adaptado;
- Auditor foi implementado ou validado;
- Publisher gera payload V2;
- idempotência foi verificada;
- 3 cenários passaram;
- estado remoto foi conferido;
- artifacts foram persistidos no GitHub;
- relatório final contém IDs/links reais das alterações.

Se alguma dessas condições não puder ser cumprida, registre explicitamente a pendência e a causa em vez de afirmar sucesso.
