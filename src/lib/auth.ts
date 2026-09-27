import jwt from "jsonwebtoken";

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

export async function signAdminToken(username: string): Promise<string> {
  const payload: AdminPayload = {
    username,
    role: "admin",
    tokenType: "admin"
  };
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export async function signUserToken(user: { userId: string; email: string; name: string }): Promise<string> {
  const payload: UserPayload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: "user",
    tokenType: "user"
  };
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

// Backward compatibility: role is required to be "admin" to issue admin token. Default is "user".
export async function signToken(username: string, role: "admin" | "user" = "user"): Promise<string> {
  if (role === "admin") {
    return signAdminToken(username);
  }
  return signUserToken({ userId: username, email: username, name: username });
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

export async function verifyAdminToken(token: string): Promise<VerifiedAdminUser | null> {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, getSecret()) as any;
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
    const decoded = jwt.verify(token, getSecret()) as any;
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
    const decoded = jwt.verify(token, getSecret()) as any;
    if (decoded && decoded.role === "admin" && decoded.tokenType === "admin") {
      return { username: decoded.username, role: "admin" };
    }
    if (decoded && (decoded.userId || decoded.email)) {
      return {
        username: decoded.email || decoded.name || decoded.username || "user",
        userId: decoded.userId,
        role: "user"
      };
    }
    if (decoded && decoded.username) {
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
