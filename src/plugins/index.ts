export interface Plugin {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  defaultActive: boolean;
  /**
   * Hook that executes before saving a post.
   * Can transform or augment post data based on active status.
   */
  onBeforeSavePost?: (postData: any, active: boolean) => any;
}

// Helper to strip HTML tags from a text string
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * 1. Automatic Estimated Reading Time Plugin
 */
const autoReadTimePlugin: Plugin = {
  id: "autoReadTime",
  name: "Tempo de Leitura Estimado Automático",
  description: "Calcula automaticamente o tempo de leitura estimando 200 palavras por minuto com base em todos os blocos de texto do post.",
  detailedDescription: `
    <strong>Como isso afeta a escrita de posts?</strong>
    <ul class="list-disc pl-4 mt-2 space-y-1">
      <li><strong>Ativado</strong>: O campo "Tempo de Leitura" no formulário de criação/edição de posts será desativado e exibirá em tempo real o cálculo matemático. Ao salvar, o valor calculado será persistido no banco de dados.</li>
      <li><strong>Desativado</strong>: O formulário exibirá o campo de texto convencional para você digitar manualmente qualquer tempo ou descrição desejada (ex: "5 min", "Leitura Rápida", etc).</li>
    </ul>
  `,
  defaultActive: false,
  onBeforeSavePost: (postData, active) => {
    if (!active) return postData;

    let totalText = postData.title + " " + postData.excerpt;
    if (Array.isArray(postData.blocks)) {
      postData.blocks.forEach((b: any) => {
        totalText += " " + (b.text || "");
      });
    }

    const cleanText = stripHtml(totalText);
    const words = cleanText.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const wpm = 200;
    const minutes = Math.max(1, Math.ceil(words / wpm));

    return {
      ...postData,
      readTime: `${minutes} min`,
    };
  },
};

/**
 * 2. Google Instant Indexing Plugin
 */
const googleIndexingPlugin: Plugin = {
  id: "googleIndexing",
  name: "Indexação Instantânea do Google",
  description: "Notifica automaticamente a API de Indexação do Google (Google Indexing API) toda vez que um post for salvo ou atualizado, forçando o Googlebot a indexar a página em segundos.",
  detailedDescription: `
    <strong>Instruções de Configuração:</strong>
    <ol class="list-decimal pl-4 mt-2 space-y-1">
      <li>Crie uma conta de serviço no Google Cloud Console e ative a <strong>Web Search Indexing API</strong>.</li>
      <li>Gere uma chave em formato JSON para esta conta de serviço.</li>
      <li>Salve o arquivo da chave com o nome <strong>google-credentials.json</strong> na pasta raiz do seu projeto (ou configure as variáveis de ambiente <code>GOOGLE_CLIENT_EMAIL</code> e <code>GOOGLE_PRIVATE_KEY</code> no seu painel de hospedagem).</li>
      <li>Adicione o e-mail da conta de serviço como <strong>Proprietário Delegado</strong> da sua propriedade do site no Google Search Console.</li>
    </ol>
  `,
  defaultActive: false,
};

/**
 * Registry of all available plugins in the system.
 * To register a new plugin in the future (e.g. newsletter, n8n automations, etc.),
 * simply define it above and add it to this array.
 */
export const plugins: Plugin[] = [
  autoReadTimePlugin,
  googleIndexingPlugin,
];
