const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf8');

const requireAdminCode = `\nasync function requireAdmin() {
  const token = cookies().get("admin_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const user = await verifyToken(token);
  if (!user) throw new Error("Unauthorized");
}\n\n`;

content = content.replace('// --- AUTENTICAÇÃO ---', requireAdminCode + '// --- AUTENTICAÇÃO ---');

const funcsToProtect = [
  'savePostAction',
  'deletePostAction',
  'setPostStatusAction',
  'triggerImprovePostWithAIAction',
  'triggerGenerateImagesAction',
  'triggerCreateAudioAction',
  'triggerImprovePostAction',
  'getNotificationsAction',
  'getSubscribersAction',
  'markNotificationAsReadAction',
  'markAllNotificationsAsReadAction',
  'savePageAction',
  'deletePageAction'
];

for (const func of funcsToProtect) {
  const regex = new RegExp(`(export async function ${func}\\([^)]*\\) {\\s*)`);
  content = content.replace(regex, `$1  await requireAdmin();\n`);
}

fs.writeFileSync('src/app/actions.ts', content);
console.log('Fixed BAC in actions.ts');
