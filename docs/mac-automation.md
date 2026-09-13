# Headless Mac Mini Drift & Automatisering // AI Opdatering

Denne vejledning forklarer, hvordan du opsætter, tester og overvåger den automatiske baggrundssynkronisering mellem **AI Opdatering** og din lokale **Ollama** LLM på din headless Mac Mini.

---

## ⚡ Lynstart: Aktiver baggrundsservicen

Projektet indeholder et færdigt administrationsscript (`scripts/setup-service.sh`), der automatisk opretter og aktiverer en native macOS `launchd` LaunchAgent (`com.aiopdatering.syncllm.plist`).

Kør følgende kommando i projektmappen via terminal eller SSH:

```bash
./scripts/setup-service.sh install
```

Dette vil:
1. Registrere din lokale Node- og npm-installation (`~/.local/bin/node` m.fl.).
2. Oprette logmappen `logs/`.
3. Installere LaunchAgent'en i `~/Library/LaunchAgents/com.aiopdatering.syncllm.plist`.
4. Starte servicen automatisk, så den kører i baggrunden hver time (3600 sekunder) og overlever genstart af maskinen.

---

## 🛠️ Administrationskommandoer

| Handling | Kommando | Beskrivelse |
| :--- | :--- | :--- |
| **Tjek status & logs** | `./scripts/setup-service.sh status` | Viser om servicen er aktiv i launchd samt de seneste loglinjer. |
| **Kør øjeblikkeligt** | `./scripts/setup-service.sh run-now` | Tvinger en kørsel med det samme i forgrunden. |
| **Følg live log** | `tail -f logs/sync.log` | Streamer loggen i realtid over SSH. |
| **Følg fejl-log** | `tail -f logs/sync.err.log` | Viser eventuelle uventede fejl. |
| **Afinstaller service** | `./scripts/setup-service.sh uninstall` | Stopper og sletter LaunchAgent'en fra systemet. |
| **Ændre tidsinterval** | `INTERVAL=7200 ./scripts/setup-service.sh install` | Sætter intervallet til f.eks. 2 timer (7200 sekunder). |

---

## 🧠 Modeller & Konfiguration (.env.local)

Du kan konfigurere LLM-indstillingerne uden at ændre koden ved at oprette eller redigere `.env.local` i projektets rod:

```env
# URL til lokal Ollama (standard er http://127.0.0.1:11434)
OLLAMA_HOST=http://127.0.0.1:11434

# Foretrukken model (standard er qwen2.5:7b)
OLLAMA_MODEL=qwen2.5:7b
```

### Anbefalet model: Qwen 2.5
For at opnå den absolut bedste kvalitet på flydende og fagligt dansk anbefales **Qwen 2.5**:

```bash
# Hent 7B modellen (hurtig, lavt ressourceforbrug)
ollama pull qwen2.5:7b

# Eller hvis din Mac Mini har 32GB+ RAM:
ollama pull qwen2.5:14b
```

*Bemærk: Hvis den foretrukne model ikke findes, falder scriptet automatisk tilbage til den første tilgængelige model i Ollama (f.eks. `llama3.2`).*

---

## 🔄 Sådan fungerer det automatiske kredsløb

1. **Vækning:** Hver time vækker macOS `launchd` scriptet `npm run sync:llm:auto`.
2. **Git Pull:** Scriptet udfører `git pull --rebase` for at sikre, at repoet er ajourført med remote.
3. **Feed Scraping:** Henter de seneste artikler fra samtlige 30+ kuraterede AI-kilder.
4. **Kandidatudvælgelse:** Udvælger de seneste artikler (sidste 24-48 timer), som endnu ikke findes i `src/data/enriched_articles.json`.
5. **Ollama Ingestion:** Kalder Ollama lokalt og udtrækker:
   - `danishTitle`: Dansk, fængende og præcis overskrift.
   - `danishSummary`: Skarpt dansk resumé på 2-3 sætninger.
   - `whyItMatters`: "Hvorfor det er vigtigt" (konsekvensanalyse for AI-branchen).
6. **Inkrementel lagring:** Gemmer løbende artiklerne i `src/data/enriched_articles.json`.
7. **Automatisk Push:** Hvis der blev beriget nye artikler, committer scriptet ændringerne og udfører `git push`.
8. **Vercel Build:** Vercel modtager pushet og bygger automatisk den opdaterede avis på få sekunder.

---

## 🔒 Uovervåget Git Push (Headless Mac Mini)

For at `git push` kan køre uovervåget uden at bede om password eller to-faktor i en interaktiv prompt:

Sørg for, at dit repository bruger **SSH-nøgler** mod GitHub:
```bash
# Tjek remote URL
git remote -v

# Skift til SSH hvis den står til HTTPS:
git remote set-url origin git@github.com:AdamBindslev/aiopdatering.git
```
Alternativt kan GitHub CLI (`gh auth setup-git`) anvendes.
