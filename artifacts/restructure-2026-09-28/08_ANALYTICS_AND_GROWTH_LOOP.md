# 08 — Analytics e Growth Loop

## 1. Objetivo

Fazer o sistema editorial aprender com o público sem permitir que métricas substituam julgamento editorial.

## 2. Baseline

Antes do rollout:
- Search Console 28 dias;
- Search Console 90 dias;
- cliques;
- impressões;
- CTR;
- posição;
- queries;
- páginas;
- país/device;
- Discover quando existir;
- analytics;
- tráfego direto/referral/social;
- CWV.

## 3. Modelo de dados sugerido

`ContentPerformanceDaily`:
- id;
- date;
- postId;
- url;
- clicks;
- impressions;
- ctr;
- position;
- sessions;
- engagedSessions;
- organicSessions;
- directSessions;
- referrals;
- discoverClicks opcional;
- createdAt.

`QueryPerformanceDaily` opcional:
- date;
- postId/url;
- query;
- clicks;
- impressions;
- ctr;
- position.

## 4. Ingestão

Job diário:
1. buscar métricas;
2. normalizar URL;
3. mapear post;
4. upsert;
5. gerar agregados;
6. registrar falha;
7. não duplicar dia.

## 5. Sinais para Diretor de Crescimento

### Opportunity
Muitas impressões + CTR baixo:
- avaliar headline/description.

### Near-win
Posição 5–15 + impressões:
- atualizar conteúdo;
- linkagem interna;
- responder lacunas.

### Momentum
Crescimento acelerado:
- criar complemento;
- comparativo;
- explicador.

### Decay
Queda sustentada:
- revisar freshness;
- concorrência;
- intenção.

### Authority gap
Cluster importante com pouca cobertura:
- planejar conteúdo base.

## 6. Janelas mínimas

Evitar reagir a ruído.
News pode usar janela curta.
Evergreen precisa de janela maior.

Não reescrever evergreen com 24h de dados.

## 7. Métricas por cluster

Medir:
- Notícias;
- Motos;
- Comprar;
- Comparativos;
- Manutenção;
- MotoGP;
- Experiência real.

Assim descobrimos o que realmente cresce.

## 8. Métricas de autoridade

Além de SEO:
- branded queries;
- tráfego direto;
- retornos;
- newsletter;
- backlinks;
- referrals;
- menções.

## 9. Experimentos

Registrar alterações relevantes:
- título;
- template;
- posição de fontes;
- hero;
- CTA;
- categoria.

Sem registro, não saberemos por que métrica mudou.

## 10. n8n feedback

Payload agregado, por exemplo:
- postId;
- cluster;
- window;
- trend;
- impressions;
- ctr;
- position;
- recommendationType.

O Diretor pode recomendar, mas não alterar produção automaticamente sem regra aprovada.

## 11. Painel mínimo

Exibir:
- tráfego total;
- orgânico;
- top páginas;
- top crescimento;
- low CTR;
- near-wins;
- branded search;
- cluster share;
- Discover;
- CWV.

## 12. Critérios de aceite

- dados não duplicam;
- URL mapeia para post;
- histórico preservado;
- falha de API não apaga métrica;
- n8n recebe agregados;
- não existe auto-update destrutivo;
- baseline permanece consultável.
