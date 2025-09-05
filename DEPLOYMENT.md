# CV Maker - Deployment su Vercel

## Configurazione per filippo---raw.com/cv

Questo progetto è configurato per essere deployato su Vercel e servito sotto il path `/cv` del dominio `filippo---raw.com`.

### Passaggi per il Deployment:

1. **Push del codice su GitHub**
   ```bash
   git add .
   git commit -m "Configure for /cv subpath deployment"
   git push origin main
   ```

2. **Deploy su Vercel**
   - Vai su [vercel.com](https://vercel.com)
   - Connetti il tuo repository GitHub
   - Importa il progetto
   - Vercel rileverà automaticamente che è un progetto Next.js

3. **Configurazione del dominio personalizzato**
   - Nel dashboard di Vercel, vai su "Settings" > "Domains"
   - Aggiungi `filippo---raw.com`
   - Configura i record DNS come indicato da Vercel

4. **Configurazione del subpath**
   - Il file `vercel.json` è già configurato per gestire il path `/cv`
   - Next.js è configurato con `basePath: '/cv'` per la produzione

### Struttura finale:
- `filippo---raw.com` → Il tuo sito principale
- `filippo---raw.com/cv` → Questa app CV Maker

### Note importanti:
- L'app funzionerà correttamente sia in sviluppo (`localhost:3000`) che in produzione (`filippo---raw.com/cv`)
- Tutti i link interni sono già configurati per funzionare con il basePath
- Gli asset statici (CSS, JS, immagini) saranno serviti correttamente dal path `/cv`
