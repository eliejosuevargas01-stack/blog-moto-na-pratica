# Moto na Prática - Blog SSR & CMS Avançado

O **Moto na Prática** é um blog de altíssimo desempenho focado em motociclismo. Ele foi desenvolvido utilizando **Next.js (App Router)** para renderização dinâmica no servidor (SSR) e SEO orgânico de alta indexação, conectado a um banco de dados **PostgreSQL (Supabase)** através do **Prisma ORM**, e com um painel administrativo (**CMS**) moderno e integrado.

---

## 📸 Telas Principais

````carousel
![Página Inicial](/home/eliezer/Música/Design para blog de motos/screenshots/home.png)
<!-- slide -->
![Página Sobre](/home/eliezer/Música/Design para blog de motos/screenshots/sobre.png)
<!-- slide -->
![Página Login Admin](/home/eliezer/Música/Design para blog de motos/screenshots/login.png)
````

---

## 🛠️ Recursos & Funcionalidades do CMS

O painel administrativo em `/admin` conta com recursos de nível empresarial para otimização de conteúdo e SEO:

### 1. Sistema de Plugins Modular
Na aba **Funções**, você pode ativar ou desativar recursos em tempo real:
- **Tempo de Leitura Estimado Automático**: Calcula matematicamente o tempo de leitura com base nas palavras dos blocos (média de 200 palavras por minuto) e desabilita o campo de entrada manual.
- **Indexação Instantânea do Google (Google Indexing API)**: Envia automaticamente solicitações de indexação imediata para o Googlebot sempre que um post é criado ou editado.

### 2. Editor de Blocos Dinâmicos com Grip Handle
- Permite construir posts com blocos ilimitados de texto e imagem.
- **Reordenação Inteligente**: A funcionalidade de arrastar e soltar (drag & drop) é restrita exclusivamente ao ícone de **Grip Handle** (6 pontinhos). Isso evita conflitos irritantes ao tentar selecionar textos longos nos campos editores.

### 3. Ponto Focal de Imagem (Focal Point Picker)
- Cada bloco e imagem de destaque possui um seletor visual de ponto focal.
- Clique diretamente na imagem para definir a coordenada de destaque, garantindo que o corte visual (através de `object-position` do CSS) fique perfeito em dispositivos móveis e desktops.

### 4. Mapeador Dinâmico de Links HTML (`BlockLinkMapper`)
- O CMS analisa em tempo real o texto dos blocos em busca de links HTML (`<a>`).
- Apresenta um painel onde você pode selecionar posts existentes no banco de dados para preencher dinamicamente a URL com o formato correto: `/{lang}/post/{slug}`.
- **Filtro de Idioma**: O mapeador inteligente só lista posts do mesmo idioma do post atual (ex: posts em português só exibem links de posts em português), garantindo integridade e consistência de navegação.

---

## 🐳 Guia de Deploy no Coolify (Docker)

O projeto inclui um [Dockerfile](file:///home/eliezer/M%C3%BAsica/Design%20para%20blog%20de%20motos/Dockerfile) multi-stage otimizado para o modo **standalone** do Next.js, gerando imagens leves (~100MB).

> [!IMPORTANT]
> **Ajuste de Caminho no Coolify**: Para evitar o erro `open Dockerfile: no such file or directory` durante o deployment, configure o **Base Directory** como `/` (raiz do repositório) e o **Dockerfile Path** como `/Dockerfile` (ou `./Dockerfile`) no painel de configurações da aplicação no Coolify.

### 1. Variáveis de Ambiente (Environment Variables)

Declare as variáveis abaixo no painel de configurações do Coolify:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão PostgreSQL (Prisma). | `postgresql://postgres:senha@db.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase para requisições de cliente. | `https://sua-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública anônima do Supabase. | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | Chave secreta de serviço do Supabase. | `sb_secret_...` |
| `SUPABASE_JWKS_URL` | URL de chaves públicas para validar chaves JWT. | `https://sua-id.supabase.co/auth/v1/.well-known/jwks.json` |
| `ADMIN_USERNAME` | Nome de usuário administrativo do painel. | `seu_usuario` |
| `ADMIN_PASSWORD` | Senha de acesso ao painel do CMS. | `sua_senha_secreta` |
| `JWT_SECRET` | Hash/Segredo para criptografia do token de sessão. | `qualquer-chave-longa-e-segura` |
| `NEXT_PUBLIC_SITE_URL` | URL oficial de produção (usado no sitemap.xml). | `https://motonapratica.online` |
| `N8N_WEBHOOK_URL` | (Opcional) Webhook para disparar automações de posts. | `https://n8n.seu-servidor.com/webhook/post` |

### 2. Volumes Persistentes (Armazenamento de Uploads)

Configure um volume no painel do Coolify para evitar perda de imagens enviadas no upload do CMS quando o container atualizar:

- **Diretório do Container**: `/app/uploads`
- **Mapeamento do Servidor (Volume Host)**: ex: `motonapratica-uploads:/app/uploads`

---

## 💻 Executando Localmente

1. **Instalar Dependências**:
   ```bash
   pnpm install
   ```

2. **Sincronizar Banco de Dados (Prisma)**:
   ```bash
   npx prisma db push
   ```

3. **Gerar Carga Inicial de Dados (Seed)**:
   ```bash
   npx prisma db seed
   ```

4. **Executar em Modo de Desenvolvimento**:
   ```bash
   pnpm dev
   ```
   Acesse no navegador: `http://localhost:3000`