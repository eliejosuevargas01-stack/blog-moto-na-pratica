import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function run() {
  console.log('📦 Iniciando processo de backup e atualização de translationGroupId...');

  // 1. FAZER BACKUP COMPLETO DOS POSTS NO DISCO LOCAL
  const backupDir = path.join(process.cwd(), 'scripts', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const allPosts = await prisma.post.findMany();
  console.log(`📋 Total de posts encontrados no banco para backup: ${allPosts.length}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `posts-backup-${timestamp}.json`);
  const latestBackupPath = path.join(backupDir, `latest-posts-backup.json`);

  fs.writeFileSync(backupFilePath, JSON.stringify(allPosts, null, 2), 'utf-8');
  fs.writeFileSync(latestBackupPath, JSON.stringify(allPosts, null, 2), 'utf-8');

  console.log(`✅ Backup salvo com sucesso em:\n  - ${backupFilePath}\n  - ${latestBackupPath}`);

  // 2. DEFINIR MAPEAMENTO DOS GRUPOS PARA STRING NUMÉRICA (Ex: "615088")
  const groupMapping: Record<string, string> = {
    // Manter numéricos existentes
    "615088": "615088",
    "134672": "134672",
    "571449": "571449",
    "434863": "434863",

    // Atualizar slugs/UUIDs de texto para identificadores numéricos
    "8s5pkqae": "850326",
    "motogp-2026-title-war-marquez-ducati-austin": "202601",
    "moto-z400-mt03-ktm-2026": "400390",
    "pryoqdfv": "1602026",
    "motorcycle-report-2026": "202699",
    "moto-2026-market-acosta-ducati": "202799",
    "hdz87hk5": "3002026",
    "yamaha-mt-series-2026-review": "202688",
  };

  // Mapeamento específico para posts individuais sem grupo (se houver)
  const standaloneSlugMapping: Record<string, string> = {
    "troca-oleo-fz25-passo-a-passo": "700001",
    "fazer-250-solid-grey-2026-6-meses": "700002",
    "hjc-rpha-11-pro-review-1-ano": "700003",
    "serra-da-canastra-de-moto": "700004",
    "michelin-pilot-street-2-fazer": "700005"
  };

  let updatedCount = 0;

  for (const post of allPosts) {
    let newGroupId: number | null = null;
    const strGid = post.translationGroupId ? String(post.translationGroupId) : null;

    if (strGid && groupMapping[strGid]) {
      newGroupId = parseInt(groupMapping[strGid], 10);
    } else if (post.translationGroupId) {
      newGroupId = post.translationGroupId;
    } else if (standaloneSlugMapping[post.slug]) {
      newGroupId = parseInt(standaloneSlugMapping[post.slug], 10);
    } else {
      newGroupId = parseInt(`700${Math.floor(1000 + Math.random() * 9000)}`, 10);
    }

    if (post.translationGroupId !== newGroupId) {
      await prisma.post.update({
        where: { id: post.id },
        data: { translationGroupId: newGroupId }
      });
      console.log(`🔄 Updated post "${post.slug}" (${post.lang}): "${post.translationGroupId}" -> "${newGroupId}"`);
      updatedCount++;
    }
  }

  console.log(`\n✨ Atualização concluída! ${updatedCount} posts atualizados com novos translationGroupId numéricos.`);

  // 3. VERIFICAÇÃO FINAL DE CONFERÊNCIA
  const postCheck = await prisma.post.findMany({
    select: { id: true, slug: true, lang: true, translationGroupId: true }
  });

  console.log(`\n📊 VERIFICAÇÃO FINAL (${postCheck.length} posts no banco):`);
  const groups: Record<string, Array<{ slug: string; lang: string }>> = {};

  postCheck.forEach(p => {
    const gid = p.translationGroupId || 'SEM_GRUPO';
    if (!groups[gid]) groups[gid] = [];
    groups[gid].push({ slug: p.slug, lang: p.lang || 'pt' });
  });

  console.dir(groups, { depth: null });
}

run()
  .catch(err => {
    console.error('❌ Erro durante a atualização:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
