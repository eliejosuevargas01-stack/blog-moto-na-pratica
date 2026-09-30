function getSecret(): string {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return SECRET;
}

export interface AdminPayload {
  username: string;
  role: "admin";
  tokenType: "admin";
}

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
  role: "user";
  tokenType: "user";
}

export interface VerifiedAdminUser {
  username: string;
  role: "admin";
  tokenType: "admin";
}

export interface VerifiedNormalUser {
  userId: string;
  email: string;
  name: string;
  role: "user";
  tokenType: "user";
}

export type VerifiedUser = VerifiedAdminUser | VerifiedNormalUser;

function base64UrlEncode(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

async function signJwtInternal(payload: Record<string, any>, secret: string, expiresInSeconds = 7 * 86400): Promise<string> {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? (now + expiresInSeconds),
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)));
  const data = enc.encode(`${encodedHeader}.${encodedPayload}`);

  const key = await getHmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, data as unknown as BufferSource);
  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJwtInternal(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();
    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    const key = await getHmacKey(secret, ["verify"]);
    const isValid = await crypto.subtle.verify("HMAC", key, signature as unknown as BufferSource, data as unknown as BufferSource);
    if (!isValid) return null;

    const dec = new TextDecoder();
    const payloadJson = dec.decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === "number" && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function signAdminToken(username: string): Promise<string> {
  const secret = getSecret();
  const payload: AdminPayload = {
    username,
    role: "admin",
    tokenType: "admin"
  };
  return signJwtInternal(payload, secret, 7 * 86400);
}

export async function signUserToken(user: { userId: string; email: string; name: string }): Promise<string> {
  const secret = getSecret();
  const payload: UserPayload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: "user",
    tokenType: "user"
  };
  return signJwtInternal(payload, secret, 7 * 86400);
}

// Backward compatibility: role is required to be "admin" to issue admin token. Default is "user".
export async function signToken(username: string, role: "admin" | "user" = "user"): Promise<string> {
  if (role === "admin") {
    return signAdminToken(username);
  }
  return signUserToken({ userId: username, email: username, name: username });
}

export async function verifyAdminToken(token: string): Promise<VerifiedAdminUser | null> {
  try {
    if (!token) return null;
    const decoded = await verifyJwtInternal(token, getSecret());
    if (decoded && decoded.role === "admin" && decoded.tokenType === "admin" && decoded.username) {
      return {
        username: decoded.username,
        role: "admin",
        tokenType: "admin"
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyUserToken(token: string): Promise<VerifiedNormalUser | null> {
  try {
    if (!token) return null;
    const decoded = await verifyJwtInternal(token, getSecret());
    if (decoded && (decoded.userId || decoded.email)) {
      return {
        userId: String(decoded.userId || ""),
        email: String(decoded.email || ""),
        name: String(decoded.name || ""),
        role: "user",
        tokenType: "user"
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyToken(token: string): Promise<{ username: string; role?: string; userId?: string } | null> {
  try {
    if (!token) return null;
    const decoded = await verifyJwtInternal(token, getSecret());
    if (!decoded) return null;
    if (decoded.role === "admin" && decoded.tokenType === "admin") {
      return { username: decoded.username, role: "admin" };
    }
    if (decoded.userId || decoded.email) {
      return {
        username: decoded.email || decoded.name || decoded.username || "user",
        userId: decoded.userId,
        role: "user"
      };
    }
    if (decoded.username) {
      return { username: decoded.username, role: decoded.role || "user" };
    }
    return null;
  } catch {
    return null;
  }
}

export function checkCredentials(user: string, pass: string): boolean {
  const correctUser = process.env.ADMIN_USERNAME;
  const correctPass = process.env.ADMIN_PASSWORD;

  if (!correctUser || !correctPass) {
    throw new Error("ADMIN_USERNAME or ADMIN_PASSWORD is not set in environment variables");
  }

  return user === correctUser && pass === correctPass;
}
