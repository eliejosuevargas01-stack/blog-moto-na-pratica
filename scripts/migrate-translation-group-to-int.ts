import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function run() {
  console.log('🚀 Iniciando inspeção e migração para translation_group_id (INTEGER)...');

  // 1. Fazer backup prévio dos posts atuais
  const backupDir = path.join(process.cwd(), 'scripts', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const allPosts = await prisma.post.findMany();
  console.log(`📋 Total de posts no banco: ${allPosts.length}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `posts-pre-int-migration-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allPosts, null, 2), 'utf-8');
  console.log(`💾 Backup salvo em: ${backupPath}`);

  // 2. Criar mapeamento determinístico de cada translation_group_id (String -> Int)
  // Preserva vinculos existentes! Posts com a mesma string recebem EXATAMENTE O MESMO numero inteiro.
  const stringToNumberGroupMap: Record<string, number> = {};
  let nextAvailableNumericId = 100001;

  // Primeiro passar por posts para coletar todos os translationGroupId existentes
  for (const post of allPosts) {
    const rawGroup = post.translationGroupId ? String(post.translationGroupId).trim() : null;
    if (!rawGroup) continue;

    if (stringToNumberGroupMap[rawGroup] !== undefined) {
      continue; // Já mapeado
    }

    // Se já é numérico puro (ex: "615088", "134672", "571449", "434863", "850326")
    if (/^\d+$/.test(rawGroup)) {
      const parsedNum = parseInt(rawGroup, 10);
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 2147483647) {
        stringToNumberGroupMap[rawGroup] = parsedNum;
        continue;
      }
    }

    // Para strings não puramente numéricas (ex: "motogp-2026-title-war-marquez-ducati-austin", "pryoqdfv", etc)
    // Gerar um número hash determinístico entre 100000 e 2000000000
    let hash = 0;
    for (let i = 0; i < rawGroup.length; i++) {
      hash = ((hash << 5) - hash) + rawGroup.charCodeAt(i);
      hash |= 0;
    }
    let positiveHash = (Math.abs(hash) % 899999) + 100000;
    
    // Garantir colisão zero
    while (Object.values(stringToNumberGroupMap).includes(positiveHash)) {
      positiveHash++;
    }
    stringToNumberGroupMap[rawGroup] = positiveHash;
  }

  console.log('\n🗺️ MAPEAMENTO DE GRUPOS DE TRADUÇÃO (Preservando Vínculos):');
  console.dir(stringToNumberGroupMap, { depth: null });

  // 3. Atualizar cada registro na tabela Post para conter a string numéricas antes de converter o tipo da coluna SQL
  let updatedCount = 0;
  for (const post of allPosts) {
    const rawGroup = post.translationGroupId ? String(post.translationGroupId).trim() : null;
    let targetInt: number | null = null;

    if (rawGroup && stringToNumberGroupMap[rawGroup] !== undefined) {
      targetInt = stringToNumberGroupMap[rawGroup];
    } else {
      // Post individual sem grupo de tradução: atribuir um ID de grupo único
      targetInt = nextAvailableNumericId++;
      while (Object.values(stringToNumberGroupMap).includes(targetInt)) {
        targetInt = nextAvailableNumericId++;
      }
    }

    if (post.translationGroupId !== targetInt) {
      await prisma.post.update({
        where: { id: post.id },
        data: { translationGroupId: targetInt }
      });
      console.log(`  [Link mantido] Post "${post.slug}" (${post.lang}): "${post.translationGroupId}" -> "${targetInt}"`);
      updatedCount++;
    }
  }

  console.log(`\n✅ ${updatedCount} posts atualizados com strings numéricas puras.`);

  // 4. Alterar o tipo da coluna no PostgreSQL de VARCHAR/TEXT para INTEGER
  console.log('\n🛠️ Alterando coluna "translation_group_id" para INTEGER no PostgreSQL...');

  // Dropar índice antigo se existir, para evitar conflito na alteração de tipo
  try {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "idx_post_translation_group";`);
  } catch (e) {
    console.log('  Aviso ao remover índice:', e);
  }

  // Executar ALTER TABLE
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Post" 
    ALTER COLUMN "translation_group_id" TYPE integer 
    USING NULLIF(regexp_replace(translation_group_id, '\\D', '', 'g'), '')::integer;
  `);

  // Recriar o índice
  await prisma.$executeRawUnsafe(`
    CREATE INDEX "idx_post_translation_group" ON "Post"("translation_group_id");
  `);

  console.log('🎉 Coluna "translation_group_id" convertida para INTEGER no banco PostgreSQL com sucesso!');
}

run()
  .catch(err => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
