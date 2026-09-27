import "server-only";

export interface N8nPayload {
  action: "update" | "img" | "audio" | "improve_post" | "new_post_published";
  postId?: string | number;
  data?: Record<string, unknown>;
}

export class N8nClient {
  private static getWebhookUrl(): string {
    const url = process.env.N8N_WEBHOOK_URL;
    if (!url) {
      throw new Error("Missing configuration: N8N_WEBHOOK_URL is not defined");
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        throw new Error("N8N_WEBHOOK_URL must use HTTPS protocol");
      }
      return url;
    } catch (e: any) {
      if (e?.message?.includes("HTTPS")) throw e;
      throw new Error("Invalid N8N_WEBHOOK_URL format");
    }
  }

  private static getApiKey(): string {
    const key = process.env.API_SECRET_KEY;
    if (!key) {
      throw new Error("Missing configuration: API_SECRET_KEY is not defined");
    }
    return key;
  }

  static async send(payload: N8nPayload, timeoutMs = 10000): Promise<{ success: boolean; data?: unknown }> {
    let controller: AbortController | null = null;
    let timer: NodeJS.Timeout | null = null;

    try {
      const webhookUrl = this.getWebhookUrl();
      const apiKey = this.getApiKey();

      controller = new AbortController();
      timer = setTimeout(() => controller?.abort(), timeoutMs);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      if (timer) clearTimeout(timer);

      if (!response.ok) {
        console.error(`[n8n-client] Request failed. Action: ${payload.action}, HTTP Status: ${response.status}`);
        return { success: false };
      }

      const data = await response.json().catch(() => null);
      return { success: true, data };
    } catch (error: unknown) {
      if (timer) clearTimeout(timer);
      const isAbort = error instanceof Error && error.name === "AbortError";
      console.error(`[n8n-client] Error executing action "${payload.action}": ${isAbort ? "Timeout" : (error instanceof Error ? error.message : "Network error")}`);
      return { success: false };
    }
  }
}
