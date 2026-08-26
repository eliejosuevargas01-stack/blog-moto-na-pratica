import fs from 'fs';
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

content = content.replace(/const SECRET = process\.env\.JWT_SECRET;\nif \(\!SECRET\) \{\n  throw new Error\("JWT_SECRET is not set in environment variables"\);\n\}\n/, '');

content = content.replace(/SECRET as string/g, 'getSecret()');

content = content.replace('export async function signToken', `function getSecret() {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) throw new Error("JWT_SECRET is not set in environment variables");
  return SECRET;
}

export async function signToken`);

fs.writeFileSync('src/lib/auth.ts', content);
