# Script PowerShell per testare CV Maker in Docker
# Questo script builda e avvia l'app in Docker per testare la configurazione /cv

Write-Host "🐳 Test CV Maker in Docker..." -ForegroundColor Green

# Build dell'immagine Docker
Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
docker build -t cv-maker .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build fallita!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image buildata con successo!" -ForegroundColor Green

# Avvia il container
Write-Host "🚀 Avvio container..." -ForegroundColor Yellow
docker run -d --name cv-maker-test -p 3000:3000 cv-maker

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nell'avvio del container!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container avviato!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 L'app è disponibile su:" -ForegroundColor Cyan
Write-Host "   - http://localhost:3000 (homepage)" -ForegroundColor White
Write-Host "   - http://localhost:3000/cv (con basePath - dovrebbe reindirizzare alla homepage)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Per testare:" -ForegroundColor Cyan
Write-Host "   1. Apri http://localhost:3000 nel browser" -ForegroundColor White
Write-Host "   2. Verifica che tutti i link funzionino" -ForegroundColor White
Write-Host "   3. Controlla che i font si carichino correttamente" -ForegroundColor White
Write-Host "   4. Testa la generazione di CV e Cover Letter" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Per fermare il container:" -ForegroundColor Cyan
Write-Host "   docker stop cv-maker-test; docker rm cv-maker-test" -ForegroundColor White
Write-Host ""
Write-Host "📊 Per vedere i log:" -ForegroundColor Cyan
Write-Host "   docker logs cv-maker-test" -ForegroundColor White
