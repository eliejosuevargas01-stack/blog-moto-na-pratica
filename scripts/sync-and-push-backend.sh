#!/bin/bash

# Define caminhos dos repositórios
MOTO_DIR="/home/eliezer/Música/Design para blog de motos"
CHARMING_DIR="/home/eliezer/antigravity/charming-borg"

# Obter mensagem do último commit do moto na prática (se disponível)
LAST_COMMIT_MSG=$(git -C "$MOTO_DIR" log -1 --pretty=%B 2>/dev/null || echo "atualiza backend sincronizado do moto na pratica")

echo "🔄 Sincronizando arquivos do backend para o Charming Borg..."

# 1. Sincronizar Prisma
cp "$MOTO_DIR/prisma/schema.prisma" "$CHARMING_DIR/prisma/schema.prisma" 2>/dev/null
cp "$MOTO_DIR/prisma/seed.ts" "$CHARMING_DIR/prisma/seed.ts" 2>/dev/null

# 2. Sincronizar Server Actions e Data Layer
cp "$MOTO_DIR/src/app/actions.ts" "$CHARMING_DIR/app/actions.ts" 2>/dev/null
cp "$MOTO_DIR/src/app/data.ts" "$CHARMING_DIR/app/data.ts" 2>/dev/null

# 3. Sincronizar Rotas de API (preservando estrutura)
mkdir -p "$CHARMING_DIR/app/api"
cp -r "$MOTO_DIR/src/app/api/"* "$CHARMING_DIR/app/api/" 2>/dev/null

# 4. Sincronizar utilitários de backend em lib/ e Dockerfile
mkdir -p "$CHARMING_DIR/lib"
cp "$MOTO_DIR/src/lib/db.ts" "$CHARMING_DIR/lib/db.ts" 2>/dev/null
cp "$MOTO_DIR/src/lib/auth.ts" "$CHARMING_DIR/lib/auth.ts" 2>/dev/null
cp "$MOTO_DIR/src/lib/google-indexing.ts" "$CHARMING_DIR/lib/google-indexing.ts" 2>/dev/null
cp "$MOTO_DIR/src/lib/image-utils.ts" "$CHARMING_DIR/lib/image-utils.ts" 2>/dev/null
cp "$MOTO_DIR/Dockerfile" "$CHARMING_DIR/Dockerfile" 2>/dev/null
cp "$MOTO_DIR/docker-compose.yml" "$CHARMING_DIR/docker-compose.yml" 2>/dev/null
cp "$MOTO_DIR/next.config.mjs" "$CHARMING_DIR/next.config.mjs" 2>/dev/null

# 5. Gerar Prisma Client no Charming Borg
echo "⚙️  Atualizando Prisma Client no Charming Borg..."
cd "$CHARMING_DIR" && npx prisma generate > /dev/null 2>&1

# 6. Verificar se houve mudanças no repositório do Charming Borg
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Alterações detectadas no Charming Borg. Realizando commit e push..."
    git add -A
    git commit -m "sync(backend): $LAST_COMMIT_MSG [auto-sync]"
    git push origin main
    echo "🚀 Sincronização do backend para o repositório Charming Borg concluída!"
else
    echo "✨ O backend do Charming Borg já está 100% atualizado."
fi
