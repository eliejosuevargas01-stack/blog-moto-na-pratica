# 02 — Sistema Editorial n8n V2

## 1. Objetivo

Reorientar o n8n para crescimento e autoridade sem reconstruir o Deep Research já existente.

## 2. Pipeline alvo

### Etapa 1 — Radar de Pautas
Entrada:
- feeds;
- tendências;
- portais;
- buscas;
- fabricantes;
- MotoGP;
- sinais de mercado;
- sugestões internas.

Saída mínima:
- `topic_id`;
- título bruto;
- origem;
- timestamp;
- entidades;
- motivo de relevância.

### Etapa 2 — Diretor de Crescimento
Substitui a lógica estreita “volume + dor” por uma decisão multidimensional.

Deve produzir:
- `editorial_type`: NEWS, BUYING_GUIDE, COMPARISON, MAINTENANCE, EXPLAINER, MOTORSPORT, PERSONAL_EXPERIENCE, DATA_STUDY;
- `traffic_intent`: SEARCH, DISCOVER, NEWS, EVERGREEN, AUTHORITY;
- `primary_query`;
- queries secundárias;
- público;
- urgência;
- shelf life;
- ângulo;
- valor adicional que Moto na Prática oferecerá;
- decisão PROCEED/SKIP;
- motivo da decisão.

Critérios:
- atualidade;
- utilidade;
- intenção real;
- potencial de clique;
- concorrência;
- autoridade temática;
- originalidade possível;
- adequação à audiência brasileira.

### Etapa 3 — Deep Research
Manter mecanismo atual.
Formalizar contrato de saída.

O dossiê deve conter:
- `research_id`;
- `generated_at`;
- pergunta principal;
- fatos consolidados;
- claims;
- fontes por claim;
- tipo da fonte;
- data da fonte;
- idade do dado;
- confiabilidade;
- conflito entre fontes;
- lacunas;
- números exatos;
- citações curtas quando permitidas;
- URLs canônicas;
- alertas de rumor;
- fatos que NÃO podem ser afirmados.

### Etapa 4 — Editor de Pauta
Não pesquisa novamente.
Transforma dossiê em briefing.

Produz:
- headline provisória;
- deck;
- objetivo;
- leitor;
- promessa;
- estrutura;
- extensão aproximada;
- tipo editorial;
- tom;
- pontos obrigatórios;
- pontos proibidos;
- fontes primárias;
- CTA natural;
- links internos sugeridos.

### Etapa 5 — Escritor
Nova identidade:
“amigo que entende de moto e pesquisou antes de falar”.

Regras:
- linguagem brasileira natural;
- papo reto;
- primeira pessoa singular somente quando `personal_experience_verified=true`;
- nunca inventar pilotagem;
- nunca inventar oficina;
- nunca inventar gasto;
- nunca inventar quilômetros;
- nunca chamar análise documental de review;
- resposta rápida para buscas objetivas;
- notícia curta quando a informação é curta;
- profundidade proporcional à dúvida;
- títulos fortes, mas não sensacionalistas;
- separar fato, alegação e opinião.

### Etapa 6 — Auditor Editorial
Compara texto com dossiê.

Valida:
- números;
- preços;
- datas;
- versões/modelos;
- claims;
- autoria;
- experiência;
- rumor;
- links;
- atualidade.

Retorna:
- PASS;
- REVISE;
- BLOCK.

Qualquer claim factual sem suporte relevante deve ser removida ou marcada para pesquisa adicional.

### Etapa 7 — Publisher
Produz payload final para o CMS.

Campos mínimos:
- slug sugerido;
- title;
- excerpt;
- body/blocks;
- editorialType;
- trafficIntent;
- category;
- tags;
- authorSlug;
- personalExperienceVerified;
- seoTitle;
- seoDescription;
- featuredImage requirements;
- sources[];
- researchId;
- factCheckedAt;
- publishedAt;
- disclosure;
- relatedPostCandidates.

## 3. Regras por formato

### NEWS
- prioridade para velocidade;
- texto curto;
- fonte primária;
- data/hora;
- contexto suficiente;
- sem encher com história genérica.

### BUYING_GUIDE
- preço;
- consumo quando verificável;
- manutenção;
- uso;
- pontos fortes/fracos;
- concorrentes;
- custo real apenas com fonte ou experiência documentada.

### COMPARISON
- critérios explícitos;
- mesmos campos para todos;
- separar especificação de julgamento;
- não inventar vencedor universal.

### MAINTENANCE
- atenção especial à segurança;
- citar manual/fabricante quando aplicável;
- distinguir procedimento básico de reparo que exige profissional.

### MOTORSPORT
- separar resultado confirmado, declaração e especulação;
- manter temporada/data correta.

### PERSONAL_EXPERIENCE
Só permitido quando houver material humano fornecido:
- relato;
- registro;
- foto;
- gasto;
- quilometragem;
- observação.

## 4. Status editorial sugeridos

DISCOVERED → APPROVED_FOR_RESEARCH → RESEARCHED → BRIEFED → DRAFTED → AUDITED → READY_TO_PUBLISH → PUBLISHED → UPDATED → CORRECTED → ARCHIVED.

## 5. Idempotência

Cada pauta precisa de `topic_id`.
Cada pesquisa precisa de `research_id`.
Cada publicação recebe `post_id`.

O fluxo deve impedir:
- duplicar artigo por reexecução;
- publicar duas vezes;
- sobrescrever versão mais nova;
- perder vínculo com dossiê.

## 6. Observabilidade

Salvar por execução:
- workflow;
- run id;
- topic id;
- research id;
- post id;
- modelo usado;
- duração;
- custo/tokens quando disponível;
- resultado;
- motivo de falha;
- número de fontes;
- auditoria final.

## 7. Mudanças específicas nos prompts existentes

### Diretor SEO atual
Renomear funcionalmente para Diretor de Crescimento Editorial.
Manter sensibilidade a volume e dor, mas adicionar formato, autoridade e oportunidade.

### Escritor atual
Remover:
- primeira pessoa obrigatória;
- dramatização constante;
- personificação de mecânico/piloto;
- obrigação de texto longo;
- “realidade” fabricada.

Manter:
- linguagem próxima;
- foco em bolso;
- foco em uso real;
- snippets;
- subtítulos úteis;
- comparações.

## 8. Critérios de aceite n8n

- Deep Research não perde capacidade.
- payload V2 é validado por schema.
- conteúdo sem fonte suficiente não chega a PUBLISHED.
- personal experience exige flag verdadeira e material humano.
- notícia curta não é artificialmente expandida.
- rerun não cria duplicata.
- cada post publicado mantém researchId.
- auditor consegue apontar claim → fonte.
