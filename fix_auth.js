import fs from 'fs';

const authCode = `import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export async function signToken(username: string): Promise<string> {
  return jwt.sign({ username }, SECRET as string, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET as string) as any;
    if (decoded && decoded.username) {
      return { username: decoded.username };
    }
    // Suporte ao token do login normal que tem userId e email
    if (decoded && decoded.userId) {
      return { username: decoded.email || decoded.name || "user" };
    }
    return null;
  } catch (error) {
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
`;

fs.writeFileSync('src/lib/auth.ts', authCode);
console.log('Fixed auth.ts');
