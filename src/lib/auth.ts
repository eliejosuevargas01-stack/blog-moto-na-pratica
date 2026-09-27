import jwt from "jsonwebtoken";

function getSecret(): string {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return SECRET;
}

export async function signToken(username: string, role = "admin"): Promise<string> {
  return jwt.sign({ username, role }, getSecret(), { expiresIn: "7d" });
}

export interface VerifiedUser {
  username: string;
  role?: string;
  userId?: string | number;
}

export async function verifyToken(token: string): Promise<VerifiedUser | null> {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, getSecret()) as any;
    if (decoded && decoded.username) {
      const adminUser = process.env.ADMIN_USERNAME || "admin";
      const isRoleAdmin = decoded.role === "admin" || decoded.username === adminUser;
      return { 
        username: decoded.username,
        role: isRoleAdmin ? "admin" : (decoded.role || "user")
      };
    }
    // Suporte ao token do login normal de usuário que tem userId e email
    if (decoded && decoded.userId) {
      return { 
        username: decoded.email || decoded.name || "user",
        userId: decoded.userId,
        role: "user" 
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function verifyAdminToken(token: string): Promise<VerifiedUser | null> {
  const user = await verifyToken(token);
  if (!user) return null;
  if (user.role === "admin") {
    return user;
  }
  return null;
}

export function checkCredentials(user: string, pass: string): boolean {
  const correctUser = process.env.ADMIN_USERNAME;
  const correctPass = process.env.ADMIN_PASSWORD;

  if (!correctUser || !correctPass) {
    throw new Error("ADMIN_USERNAME or ADMIN_PASSWORD is not set in environment variables");
  }

  return user === correctUser && pass === correctPass;
}
