#!/bin/bash

# Script di deployment per CV Maker su Vercel
# Questo script prepara il progetto per il deployment su filippo---raw.com/cv

echo "🚀 Preparazione deployment CV Maker..."

# Verifica che tutto sia committato
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Ci sono modifiche non committate. Committa prima di procedere."
    git status
    exit 1
fi

# Build di test
echo "🔨 Test build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build fallita. Controlla gli errori."
    exit 1
fi

echo "✅ Build completata con successo!"

# Push su GitHub
echo "📤 Push su GitHub..."
git add .
git commit -m "Configure for /cv subpath deployment"
git push origin main

echo "✅ Codice pushato su GitHub!"
echo ""
echo "🎯 Prossimi passi:"
echo "1. Vai su https://vercel.com"
echo "2. Connetti il tuo repository GitHub"
echo "3. Importa il progetto"
echo "4. Nel dashboard, vai su Settings > Domains"
echo "5. Aggiungi 'filippo---raw.com'"
echo "6. Configura i record DNS come indicato da Vercel"
echo ""
echo "🌐 L'app sarà disponibile su: https://filippo---raw.com/cv"
