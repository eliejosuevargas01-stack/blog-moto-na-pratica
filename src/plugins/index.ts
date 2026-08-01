export interface Plugin {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  defaultActive: boolean;
  /**
   * Hook que executa antes de salvar um post.
   */
  onBeforeSavePost?: (postData: any, active: boolean) => any;
}

// Auxiliar para remover tags HTML de textos
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * 1. Tempo de Leitura Estimado Automático
 */
const autoReadTimePlugin: Plugin = {
  id: "autoReadTime",
  name: "Tempo de Leitura Estimado Automático",
  description: "Calcula automaticamente o tempo de leitura estimando 200 palavras por minuto com base em todos os blocos de texto do post.",
  detailedDescription: `
    <strong>Como isso afeta a escrita de posts?</strong>
    <ul class="list-disc pl-4 mt-2 space-y-1">
      <li><strong>Ativado</strong>: O campo "Tempo de Leitura" exibirá em tempo real o cálculo matemático de palavras por minuto. Ao salvar, o valor calculado será persistido no banco de dados.</li>
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
 * 2. Indexação Instantânea do Google
 */
const googleIndexingPlugin: Plugin = {
  id: "googleIndexing",
  name: "Indexação Instantânea do Google",
  description: "Notifica automaticamente a API de Indexação do Google (Google Indexing API) toda vez que um post for salvo ou atualizado.",
  detailedDescription: `
    <strong>Instruções de Configuração:</strong>
    <ol class="list-decimal pl-4 mt-2 space-y-1">
      <li>Crie uma conta de serviço no Google Cloud Console e ative a <strong>Web Search Indexing API</strong>.</li>
      <li>Gere uma chave em formato JSON para esta conta de serviço.</li>
      <li>Adicione o e-mail da conta de serviço como Proprietário Delegado da sua propriedade no Google Search Console.</li>
    </ol>
  `,
  defaultActive: false,
};

/**
 * 3. Melhorar Artigo com IA (n8n Webhook)
 */
const aiImprovePostPlugin: Plugin = {
  id: "aiImprovePost",
  name: "Melhorar Artigo com IA (n8n Webhook)",
  description: "Dispara o webhook (action=update) para aprimorar o título, resumo, SEO e estrutura de blocos do artigo utilizando IA.",
  detailedDescription: `
    <strong>Como funciona:</strong>
    <ul class="list-disc pl-4 mt-2 space-y-1">
      <li>Dispara uma requisição HTTP POST para o Webhook com <code>action=update</code>.</li>
      <li>Envia o <code>translationGroupId</code>, título, resumo e metadados para a IA reescrever o artigo.</li>
    </ul>
  `,
  defaultActive: true,
};

/**
 * 4. Gerar Imagens com IA (n8n Webhook)
 */
const aiGenerateImagesPlugin: Plugin = {
  id: "aiGenerateImages",
  name: "Gerar Imagens com IA (n8n Webhook)",
  description: "Dispara o webhook (action=img) para gerar ilustrações para a capa e blocos de conteúdo usando inteligência artificial.",
  detailedDescription: `
    <strong>Como funciona:</strong>
    <ul class="list-disc pl-4 mt-2 space-y-1">
      <li>Dispara uma requisição HTTP POST para o Webhook com <code>action=img</code>.</li>
      <li>Envia todos os blocos de texto limpos de tags HTML com marcadores de posição para a geração de imagens.</li>
    </ul>
  `,
  defaultActive: true,
};

/**
 * 5. Criar Narração de Áudio com IA (n8n Webhook)
 */
const aiCreateAudioPlugin: Plugin = {
  id: "aiCreateAudio",
  name: "Criar Narração de Áudio com IA (n8n Webhook)",
  description: "Dispara o webhook (action=audio) enviando a estrutura em JSON dos blocos para síntese de voz e narração MP3 do artigo.",
  detailedDescription: `
    <strong>Como funciona:</strong>
    <ul class="list-disc pl-4 mt-2 space-y-1">
      <li>Dispara uma requisição HTTP POST para o Webhook com <code>action=audio</code>.</li>
      <li>Envia o payload estruturado em array com <code>payload_para_api</code>, <code>dados_de_auditoria</code> e <code>blocos_originais</code>.</li>
      <li>O servidor de áudio gera a narração e anexa o arquivo ao post via API.</li>
    </ul>
  `,
  defaultActive: true,
};

/**
 * Registry de todos os plugins disponíveis no painel de administração.
 */
export const plugins: Plugin[] = [
  autoReadTimePlugin,
  googleIndexingPlugin,
  aiImprovePostPlugin,
  aiGenerateImagesPlugin,
  aiCreateAudioPlugin,
];
