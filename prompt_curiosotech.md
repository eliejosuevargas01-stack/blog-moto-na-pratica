# Prompt de Especificação Técnica para o Curiosotech (Painel CMS & Backend)

Use as instruções e especificações detalhadas abaixo como referência para implementar as novas funcionalidades no **Curiosotech**, usando o ecossistema do **motonapratica** como base técnica.

---

## 1. Arquitetura Multilíngue no Banco de Dados (Prisma/PostgreSQL)

Para dar suporte ao fluxo de tradução onde posts traduzidos mantêm o mesmo identificador base, a estrutura de dados precisa ser adaptada:

- **Chave Primária Composta**: O modelo `Post` não deve ter apenas o `id` como chave primária única. Ele deve usar uma chave primária composta contendo `id` (UUID) e `lang` (código de idioma, ex: `pt`, `en`, `es`).
- **Unicidade de Slugs por Idioma**: O `slug` deve ser único por idioma, e não globalmente.
- **Campos sugeridos para o Schema Prisma**:
  ```prisma
  model Post {
    id             String   // UUID compartilhado entre as traduções do mesmo post
    lang           String   // Código do idioma (ex: "pt", "en", "es")
    slug           String   
    tag            String   
    category       String
    title          String
    excerpt        String   @db.Text
    date           DateTime @default(now())
    readTime       String   
    img            String   // URL da imagem destacada
    imgFocalPoint  String   @default("center") 
    blocks         Json     // [{ text: string, image: string, focalPoint: string, alt: string }]
    
    seoTitle       String?
    seoDescription String?
    seoKeywords    String?

    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt

    @@id([id, lang])         // Chave primária composta
    @@unique([slug, lang])   // Garante unicidade do slug por idioma
  }
  ```

---

## 2. Fluxo de Tradução (Automático & Manual)

O sistema deve permitir traduzir posts para outros idiomas (Inglês, Espanhol, etc.), mantendo a relação do post através do mesmo `id` base.

### A. Opção Automática (Plugin Ativável)
- Na aba de **Funções/Configurações** (Plugins), deve haver um plugin chamado **"Tradução Automática ao Salvar"** (desativado por padrão).
- Se estiver **ativado**: Ao salvar/publicar um post, o backend dispara uma requisição de tradução automaticamente para o webhook de tradução.
- Se estiver **desativado**: O post é salvo normalmente sem nenhuma tradução automática.

### B. Opção Manual (Botão "Traduzir")
- No editor do post, deve haver um botão físico **"Traduzir"** na barra de ações.
- Ao ser clicado, ele dispara uma chamada manual para o webhook de tradução enviando os dados do post atual.

### C. Funcionamento do Webhook de Tradução
1. **Disparo**: O CMS envia o payload do post original:
   ```json
   {
     "id": "post-uuid-1234",
     "lang": "pt",
     "title": "Título em Português",
     "excerpt": "Resumo do post...",
     "blocks": [
       { "text": "Texto do bloco 1...", "image": "url-imagem", "alt": "descrição da imagem" }
     ]
   }
   ```
2. **Resposta/Recepção**: O webhook processa o texto, traduz para o idioma configurado (ex: Inglês) e faz uma requisição POST de volta para um endpoint do Curiosotech (ex: `/api/posts/translate-callback`).
3. **Criação da Cópia Traduzida**: O endpoint do Curiosotech recebe o conteúdo traduzido e cria uma nova entrada no banco de dados com:
   - **O mesmo `id`** (`post-uuid-1234`).
   - O novo idioma configurado (`lang: "en"`).
   - O `slug` gerado a partir do título traduzido.
   - O conteúdo traduzido no seu respectivo campo.

---

## 3. Fluxo de Geração de Imagens via Webhook (Manual & Em Lote)

As imagens do post (Hero e imagens de blocos) podem ser geradas por IA a partir de suas descrições alt text.

### A. Lógica dos Identificadores Compostos (`idPost={numero}`)
Para que o sistema saiba exatamente onde colocar a imagem que a IA gerou, o CMS deve enviar um identificador composto no formato `{idPost}={lugar}`:
- `=1` representa a imagem **Hero (Destaque)** do post.
- `=2` representa a imagem do **Bloco 1** do post.
- `=3` representa a imagem do **Bloco 2** do post.
- `=4` representa a imagem do **Bloco 3** do post.
- `={N}` representa consecutivamente o bloco de índice `N-2` na lista de blocos.

### B. Botões no Editor
1. **Botão Individual "Criar Imagem" (ao lado de cada campo de imagem)**:
   - Dispara uma requisição única para o webhook gerador de imagens contendo apenas o `alt` da imagem correspondente e o ID composto formatado (ex: `post-uuid-1234=1` para a hero, `post-uuid-1234=2` para o bloco 1).
2. **Botão no Topo do Editor "Criar Imagens" (Em Lote / Seletivo)**:
   - Abre um modal com um checklist contendo todos os alts configurados no post:
     - `[ ] img-hero (alt text da hero)`
     - `[ ] img-bloco-1 (alt text do bloco 1)`
     - `[ ] img-bloco-2 (alt text do bloco 2)`
     - `[ ] img-bloco-3 (alt text do bloco 3)`
   - O usuário seleciona quais alts deseja gerar e clica em "Enviar".
   - O CMS faz **uma requisição por imagem selecionada** em paralelo ou fila, respeitando a regra de ID composto (cada uma com seu respectivo sufixo `=1`, `=2`, `=3`, etc.).

### C. Endpoint de Recepção de Imagens (`/api/images/receive-generation`)
O Curiosotech deve possuir um endpoint público para receber a imagem gerada de volta:
1. **Payload recebido pelo endpoint**:
   ```json
   {
     "tempImageUrl": "https://servico-ia.com/temp-image-path.png",
     "compoundId": "post-uuid-1234=2"
   }
   ```
2. **Processamento**:
   - Divide o `compoundId` por `=` para obter o `postId` (`post-uuid-1234`) e o local indexador (`2`).
   - Baixa a imagem da URL temporária.
   - Salva a imagem no volume de armazenamento persistente local do projeto (ex: `/uploads/posts/`).
   - Gera a URL local/final da imagem (ex: `/uploads/posts/imagem-gerada-123.png`).
3. **Persistência**:
   - Se o local for `1`: Atualiza o campo `img` do post correspondente àquele `id`.
   - Se o local for `N` (onde N > 1): Atualiza o campo `image` no bloco correspondente ao índice `N-2` no JSON de `blocks` do post.
   - Salva as alterações no banco de dados.

---

## 4. Estrutura dos Blocos no Editor (Layout Dividido & Ponto Focal)

Cada bloco de conteúdo inserido na edição do post deve possuir uma estrutura visual em colunas:

- **Lado Esquerdo**: Editor de texto de área ampla (Rich Text / Markdown / HTML).
- **Lado Direito**: Miniatura da imagem associada ao bloco contendo:
  - Input para a URL da imagem ou upload.
  - Função de **Ponto Focal da Imagem** (Focal Point Picker):
    - Permite clicar diretamente na imagem para definir as coordenadas X e Y do ponto de foco (salvo como string, ex: `center` ou `35% 62%`).
    - Esse ponto focal é salvo no banco de dados e aplicado no frontend via CSS inline no elemento de imagem (`object-position: {focalPoint}`).

---

## 5. Mapeador Dinâmico de Links com Filtro de Idioma (`BlockLinkMapper`)

No editor de blocos HTML, o sistema deve detectar de forma proativa as tags de links (`<a>`) digitadas pelo usuário para facilitar a indexação interna de slugs do banco.

### A. Detecção de Tags `<a>`
- Sempre que o conteúdo do bloco de texto mudar, o CMS analisa o texto em busca de tags `<a>` usando `DOMParser` ou Expressões Regulares (`RegExp`).
- Para cada link detectado, renderiza logo abaixo do editor um painel de mapeamento de links.

### B. Preenchimento Dinâmico
- Exibe o texto âncora do link original e um seletor (dropdown).
- O dropdown lista os posts existentes no banco de dados.
- Ao escolher um post no dropdown, o CMS atualiza dinamicamente o atributo `href` da tag `<a>` correspondente no HTML do bloco de texto para o seguinte formato:
  `/{lang}/post/{slug}` (ex: `/pt/post/espanha-vs-argentina-final-copa-do-mundo`).

### C. Filtro Restrito por Idioma (Regra Crítica)
- O seletor de posts deve filtrar os resultados com base no idioma do post que está sendo editado no momento:
  - Se o post que está sendo editado é em português (`lang: "pt"`), o dropdown deve carregar **apenas** posts que também possuam `lang: "pt"`.
  - Se o post está sendo editado em inglês (`lang: "en"`), o dropdown deve listar **apenas** os posts em inglês (`lang: "en"`).
  - A mesma lógica se aplica para espanhol (`es`) ou qualquer outro idioma que esteja sendo editado.
