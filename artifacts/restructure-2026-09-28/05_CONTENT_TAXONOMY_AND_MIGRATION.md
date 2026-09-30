# 05 — Taxonomia e Migração do Acervo

## 1. Objetivo

Eliminar a situação em que grande parte do site cai genericamente em “Reviews” e reconstruir clusters coerentes.

## 2. Tipos editoriais

Tipos são diferentes de categorias.

**Este é o enum canônico do refoundation. Site, CMS, API, n8n, testes e documentação devem usar exatamente estes identificadores; aliases legados devem ser normalizados na fronteira, não persistidos como novos valores.**

Tipos:
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

`REVIEW_VERIFIED` exige uso/teste real comprovado.

## 3. Categorias principais

- Notícias
- Motos
- Comprar
- Comparativos
- Manutenção
- MotoGP
- Vida de Motociclista, opcional após validação de volume

## 4. Regra de review

Usar “Review”, “Teste”, “Longa duração”, “Nosso consumo”, “Aferimos” somente se:
- houve experiência real;
- autor é identificável;
- período/condição pode ser documentado;
- dados não foram inventados pela IA.

Caso contrário usar:
- análise;
- guia;
- ficha;
- lançamento;
- comparativo documental;
- primeiras informações.

## 5. Inventário do legado

Gerar CSV/JSON com:
- postId;
- slug;
- title;
- category;
- tag;
- publishedAt;
- views;
- language;
- backlinks se disponíveis;
- Search Console clicks/impressions;
- novo tipo sugerido;
- nova categoria;
- decisão;
- motivo;
- redirectTarget.

## 6. Decisões possíveis

### KEEP
Está correto e dentro do posicionamento.

### UPDATE
Tema válido, precisa atualizar dados, autoria, fontes ou formato.

### MERGE
Canibalização ou dois posts para mesma intenção.

### REMOVE
Off-topic, sem valor, sem tráfego/backlink relevante.

### FACT_CHECK
Alegações de vivência, número ou contexto exigem revisão antes de manter.

## 7. Ordem de decisão

1. risco factual;
2. conteúdo off-topic;
3. canibalização;
4. oportunidade de tráfego;
5. atualização cosmética.

## 8. URLs

Não alterar slug só porque o título mudou.

Alterar somente quando:
- slug é enganoso;
- idioma incorreto;
- erro grave;
- arquitetura exige.

Toda mudança:
- 301;
- canonical correto;
- sitemap atualizado;
- links internos atualizados.

## 9. Conteúdo off-topic

Conteúdo de tecnologia geral, redes sociais ou assuntos sem conexão legítima com motociclismo deve ser avaliado para remoção/redirect, não mantido apenas por volume.

## 10. Conteúdo popular prioritário

Construir clusters em torno de motos e problemas realmente pesquisados no Brasil:
- CG;
- Biz;
- Pop;
- Bros;
- Factor;
- Crosser;
- FZ25;
- PCX;
- NMax;
- XRE/Sahara;
- financiamento;
- consumo;
- manutenção;
- preço;
- seguro;
- usados.

Isso é orientação de portfólio, não licença para gerar páginas finas em massa.

## 11. Conteúdo autoral

Criar cluster de experiência real:
- FZ25;
- manutenção documentada;
- custos;
- viagens reais;
- equipamentos usados;
- aprendizados.

Material autoral deve ser enriquecido ao longo do tempo, não refeito artificialmente.

## 12. Atualizações

Artigo atualizado deve registrar:
- `editorialModifiedAt` (ou campo editorial equivalente dedicado), nunca o `updatedAt` técnico do registro;
- motivo quando material;
- correção quando houve erro;
- nova fonte se necessário.

Não atualizar data apenas para parecer recente.

## 13. Critério de conclusão da migração

- 100% do acervo inventariado;
- 100% tem decisão;
- URLs removidas possuem tratamento;
- off-topic crítico saiu;
- reviews falsas foram renomeadas;
- posts com risco factual foram revisados;
- novas categorias aparecem no site;
- links internos principais foram corrigidos.
