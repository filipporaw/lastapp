#!/bin/bash

# Script per testare CV Maker in Docker
# Questo script builda e avvia l'app in Docker per testare la configurazione /cv

echo "🐳 Test CV Maker in Docker..."

# Build dell'immagine Docker
echo "🔨 Building Docker image..."
docker build -t cv-maker .

if [ $? -ne 0 ]; then
    echo "❌ Docker build fallita!"
    exit 1
fi

echo "✅ Docker image buildata con successo!"

# Avvia il container
echo "🚀 Avvio container..."
docker run -d --name cv-maker-test -p 3000:3000 cv-maker

if [ $? -ne 0 ]; then
    echo "❌ Errore nell'avvio del container!"
    exit 1
fi

echo "✅ Container avviato!"
echo ""
echo "🌐 L'app è disponibile su:"
echo "   - http://localhost:3000 (homepage)"
echo "   - http://localhost:3000/cv (con basePath - dovrebbe reindirizzare alla homepage)"
echo ""
echo "📝 Per testare:"
echo "   1. Apri http://localhost:3000 nel browser"
echo "   2. Verifica che tutti i link funzionino"
echo "   3. Controlla che i font si carichino correttamente"
echo "   4. Testa la generazione di CV e Cover Letter"
echo ""
echo "🛑 Per fermare il container:"
echo "   docker stop cv-maker-test && docker rm cv-maker-test"
echo ""
echo "📊 Per vedere i log:"
echo "   docker logs cv-maker-test"
