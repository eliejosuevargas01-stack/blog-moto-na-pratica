import fs from 'fs';

let actionsCode = fs.readFileSync('src/app/actions.ts', 'utf8');

const requireAdminCode = `async function requireAdmin(actionName: string) {
  const token = cookies().get("admin_token")?.value || cookies().get("auth_token")?.value;
  if (!token) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'anonymous', action: actionName, status: 'unauthorized' }));
    throw new Error("Unauthorized");
  }
  const user = await verifyToken(token);
  if (!user) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: 'anonymous', action: actionName, status: 'unauthorized' }));
    throw new Error("Unauthorized");
  }
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: user.username, action: actionName, status: 'success' }));
  return user;
}`;

actionsCode = actionsCode.replace(/async function requireAdmin\(\) \{[\s\S]*?\}\n/, requireAdminCode + '\n');
// Clean up any previous await requireAdmin(arguments.callee...)
actionsCode = actionsCode.replace(/await requireAdmin\([^)]*\);/g, 'await requireAdmin();');

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
  const regex = new RegExp(`(export async function ${func}\\([^)]*\\) {\\s*)await requireAdmin\\(\\);`);
  actionsCode = actionsCode.replace(regex, `$1await requireAdmin("${func}");`);
}

// Ensure loginAction has logging
if (!actionsCode.includes('action: "loginAction"')) {
  actionsCode = actionsCode.replace('return { success: true };', 'console.log(JSON.stringify({ timestamp: new Date().toISOString(), user_id: username, action: "loginAction", status: "success" }));\n  return { success: true };');
}

fs.writeFileSync('src/app/actions.ts', actionsCode);
console.log('Fixed logs in actions.ts');
