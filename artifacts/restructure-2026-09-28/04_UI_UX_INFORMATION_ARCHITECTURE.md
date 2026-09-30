# 04 — UI/UX e Arquitetura de Informação

> **Natureza:** arquitetura de informação alvo. Campos editoriais são condicionais: dado ausente não deve ser substituído por autor, data, leitura, badge ou métrica inventados.

## 1. Direção visual

A nova paleta clara e de maior contraste já criada deve ser tratada como decisão aprovada.

Não refazer identidade de cores nesta sprint.

Validar:
- contraste WCAG;
- leitura em ambiente externo;
- legibilidade mobile;
- foco visível;
- tamanho de fonte;
- touch targets;
- consistência entre cards, article e admin público.

Preto/cinza/vermelho podem permanecer como assinatura, sem transformar toda a interface em dark mode.

## 2. Header

Objetivo: o visitante entende em 5 segundos o que existe no portal.

Navegação principal:
- Notícias;
- Motos;
- Comprar;
- Comparativos;
- Manutenção;
- MotoGP;
- Busca.

Mobile:
- logo;
- busca;
- menu;
- categorias em lista curta;
- evitar mega menu pesado.

## 3. Home

### Hero editorial
- 1 matéria principal;
- 3 destaques secundários;
- data/categoria visíveis;
- sem banner gigante puramente decorativo.

### Últimas
Feed cronológico para sinalizar que o portal está vivo.

### Vai comprar uma moto?
Conteúdo evergreen e popular.

### Comparativos
Cards dedicados, não misturados com notícias.

### Manutenção
Dúvidas práticas.

### MotoGP
Bloco próprio.

### Experiência real
Conteúdo autoral verificado.

### Mais lidas
Somente quando houver dados reais suficientes.
Nunca simular ranking.

### Newsletter
Contextual, não invasiva.

## 4. Artigo

Primeira dobra:
- breadcrumb quando aplicável;
- categoria quando explícita;
- título;
- subtítulo/excerpt quando disponível;
- autor somente quando explicitamente conhecido;
- publicação somente com data editorial válida;
- atualização somente com timestamp editorial real;
- tempo de leitura somente quando disponível/calculado por regra real, sem default arbitrário;
- imagem quando disponível.

Logo após:
- resposta rápida quando o formato permitir;
- box de informação crítica para recall/segurança quando aplicável.

Corpo:
- tipografia confortável;
- largura limitada;
- tabelas responsivas;
- headings escaneáveis;
- links claros;
- imagens com legenda/crédito.

Confiança:
- fontes principais;
- “como pesquisamos”;
- correções;
- autor;
- disclosure.

## 5. Tipos visuais diferentes

NEWS:
- data/hora;
- atualização;
- fonte;
- contexto curto.

BUYING_GUIDE:
- tabela-chave;
- preço;
- concorrentes;
- manutenção/consumo.

COMPARISON:
- tabela comparativa sticky em desktop quando útil;
- cards empilhados no mobile.

MAINTENANCE:
- avisos de segurança;
- ferramentas;
- dificuldade;
- quando procurar profissional.

PERSONAL_EXPERIENCE:
- selo “Experiência real” somente validado;
- autor humano;
- contexto da moto/km/período quando disponível.

## 6. Página de categoria

Cada cluster deve ter:
- H1 claro;
- descrição curta;
- destaque;
- lista recente;
- subcategorias quando necessárias;
- paginação ou load-more indexável com cuidado;
- SEO próprio.

## 7. Autoridade visual

Sinais legítimos:
- autoria;
- fontes;
- datas;
- páginas institucionais;
- contato;
- logos sociais;
- correções;
- metodologia.

Não usar:
- badges falsos;
- “milhões de leitores” sem dado;
- reviews falsas;
- contadores inventados;
- logos de parceiros sem parceria.

## 8. Mobile-first

Prioridades:
- LCP de imagem principal;
- cards com altura previsível;
- links/touch >= área confortável;
- tabelas com scroll controlado;
- ausência de popups bloqueando leitura;
- header compacto;
- ads futuras sem shift.

## 9. Busca e descoberta interna

Adicionar gradualmente:
- busca global;
- chips por tema;
- relacionados por entidade/modelo;
- links para hubs;
- breadcrumbs.

## 10. Critérios de aceite UX

- usuário identifica o tema rapidamente e a autoria quando ela estiver explicitamente disponível;
- artigo é legível em tela pequena;
- fontes ficam acessíveis sem esconder;
- categoria é coerente;
- não há alegação visual de review/teste sem metadado;
- navegação principal cabe sem confusão;
- contraste da nova paleta é validado;
- CWV não piora materialmente.
