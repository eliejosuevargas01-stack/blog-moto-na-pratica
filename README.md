# Moto na Prática - Blog SSR & CMS

O **Moto na Prática** é um blog de alto desempenho focado em motociclismo, desenvolvido com **Next.js (App Router)** para renderização dinâmica no servidor (SSR) e SEO orgânico de alta indexação, conectado a um banco de dados **MariaDB** e com um painel de controle administrativo (**CMS**) integrado.

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

## 🛠️ Como o Projeto Funciona (Simplicidade)
- **Leitura do Google (SEO)**: Diferente de aplicativos React normais (SPAs), as páginas deste blog são geradas diretamente no servidor (SSR). O robô do Google lê o HTML completo com as meta-tags ideais já preenchidas.
- **Painel Admin Integrado (/admin)**: Um CMS simplificado onde o administrador pode criar/editar artigos com quantidade flexível de blocos de imagem e texto, gerenciar novas páginas corporativas, escolher pontos focais das fotos e gerenciar palavras-chave de SEO.
- **Armazenamento Otimizado**: O banco de dados armazena apenas as URLs e referências de dados. As imagens enviadas via upload são processadas e salvas localmente na pasta de armazenamento.

---

## 🐳 Guia de Deploy no Coolify (Docker)

O projeto já inclui um [Dockerfile](file:///home/eliezer/M%C3%BAsica/Design%20para%20blog%20de%20motos/Dockerfile) otimizado em múltiplos estágios (multi-stage) utilizando o modo **standalone** do Next.js, gerando imagens Docker extremamente leves (~100MB).

### 1. Variáveis de Ambiente (Environment Variables)
Ao configurar o deploy no painel do Coolify, declare as seguintes variáveis nas configurações do container:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão com o banco MariaDB / MySQL. | `mysql://user:pass@72.60.247.157:2500/blog_motos` |
| `ADMIN_USERNAME` | Nome de usuário para acesso à rota `/admin`. | `seu_usuario` |
| `ADMIN_PASSWORD` | Senha de acesso para a área administrativa. | `sua_senha_secreta` |
| `JWT_SECRET` | Chave secreta de segurança para assinatura do token de sessão. | `qualquer-frase-longa-e-aleatoria` |
| `NEXT_PUBLIC_SITE_URL` | URL pública do blog (utilizada na geração dinâmica do sitemap.xml). | `https://motonapratica.com.br` |

### 2. Armazenamento Persistente (Persistent Volumes)
Para garantir que as imagens enviadas por upload no CMS administrativo não sejam apagadas quando o container reiniciar ou atualizar, adicione o seguinte volume persistente no Coolify:

- **Diretório do Container**: `/app/public/uploads`
- **Mapeamento do Servidor (Volume Host)**: ex: `motonapratica-uploads:/app/public/uploads`

---

## 💻 Executando Localmente

1. **Instalar Dependências**:
   ```bash
   pnpm install
   ```

2. **Subir tabelas no Banco de Dados**:
   ```bash
   npx prisma db push
   ```

3. **Carregar Carga de Dados Inicial (Seed)**:
   ```bash
   npx prisma db seed
   ```

4. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   pnpm dev
   ```
   Acesse: `http://localhost:3000`