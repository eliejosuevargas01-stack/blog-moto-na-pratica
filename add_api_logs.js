import fs from 'fs';

let content = fs.readFileSync('src/app/api/posts/route.ts', 'utf8');

const logCode = `\n    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'API', action: 'api/posts $1', status: 'success' }));\n`;

content = content.replace(/export async function GET\(req: Request\) \{\n\s*try \{/g, `export async function GET(req: Request) {\n  try {${logCode.replace('$1', 'GET')}`);
content = content.replace(/export async function POST\(req: Request\) \{\n\s*try \{/g, `export async function POST(req: Request) {\n  try {${logCode.replace('$1', 'POST')}`);
content = content.replace(/export async function PATCH\(req: Request\) \{\n\s*try \{/g, `export async function PATCH(req: Request) {\n  try {${logCode.replace('$1', 'PATCH')}`);
content = content.replace(/export async function DELETE\(req: Request\) \{\n\s*try \{/g, `export async function DELETE(req: Request) {\n  try {${logCode.replace('$1', 'DELETE')}`);

fs.writeFileSync('src/app/api/posts/route.ts', content);
console.log('Fixed logs in api/posts/route.ts');
