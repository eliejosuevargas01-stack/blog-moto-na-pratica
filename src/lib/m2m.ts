export function verifyM2MAuth(req: Request): boolean {
  const expectedKey = process.env.API_SECRET_KEY;
  if (!expectedKey) {
    return false;
  }

  const xApiKey = req.headers.get("x-api-key")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

  if (xApiKey && xApiKey === expectedKey) {
    return true;
  }
  if (bearerToken && bearerToken === expectedKey) {
    return true;
  }

  return false;
}
