# AI Opdatering // The Intelligence Chronicle

En lynhurtig, kurateret og futuristisk AI-avis ("Cyber-Broadsheet"), der automatisk aggregerer de seneste opdateringer fra verdens førende Frontier Labs, uafhængige analytikere, europæisk regulering, akademisk forskning samt danske AI-kilder.

![AI Opdatering Preview](https://raw.githubusercontent.com/AdamBindslev/aiopdatering/main/public/preview.png)

---

## ⚡ Egenskaber & Arkitektur

- **Futuristisk Avis-Layout ("Cyber-Broadsheet")**:
  - **Live Wire Ticker**: Konstant opdateret nyhedstelegram i toppen med de seneste 12 artikler.
  - **Forside (Kerne-sæt)**: Spotlight på seneste store nyhed (*Lead Story*), suppleret af et 3-spaltet avisgitter (*Frontier Labs*, *Analyse & Indsigt*, *Dansk AI & Lovgivning*).
  - **Hurtigsøgning & Filtrering**: Live klientsøgning i realtid, tidsfiltre (24 timer, 48 timer, 7 dage, alt) samt kildevælger.
  - **Kildekatalog**: Indbygget RSS-katalog med direkte adgang til og kopiering af samtlige 30+ integrerede RSS/Atom-feeds.
  - **Læseliste & Bogmærker**: Gem interessante artikler lokalt med ét klik til senere fordybelse.
  - **Mørkt & Lyst Tema**: Skift mellem Cyber-Dark HUD og lyst avispapir-tema.
- **Automatisk Baggrundsopdatering (Vercel ISR)**:
  - Bygget med Next.js App Router og **Incremental Static Regeneration (`revalidate = 900`)**.
  - Sitet opdateres automatisk i baggrunden hvert 15. minut, når brugere besøger det.
  - Ingen eksterne databasekrav eller abonnementsomkostninger.
  - Indbygget manuel "Opdater"-knap, der kan tvinge en øjeblikkelig synkronisering via `/api/feeds?refresh=true`.

---

## 📡 Kuraterede Kilder

1. **Frontier Labs & Modeludviklere**: OpenAI, Anthropic, Google DeepMind, Google AI, Meta AI, Mistral AI, Hugging Face, Microsoft Research, AWS ML, DeepSeek (Releases), Qwen (Releases).
2. **Uafhængige Eksperter & Nyhedsbreve**: Simon Willison, Nathan Lambert (*Interconnects*), Ethan Mollick (*One Useful Thing*), Sebastian Raschka (*Ahead of AI*), Arvind Narayanan (*AI Snake Oil*), Dylan Patel (*SemiAnalysis*), Zvi Mowshowitz (*Don't Worry About the Vase*), Latent Space m.fl.
3. **Danske Kilder**: Version2 / Ingeniøren, DagensAI.dk, DataEthics.eu m.fl.
4. **Sikkerhed, Regulering & Policy**: EU AI Act Updates, Epoch AI, METR, Tech Policy Press, LessWrong Curated Alignment.
5. **Værktøjer, Runtimes & Hardware**: NVIDIA Technical Blog, Ollama, LangChain.
6. **Tech Medier**: The Verge, Ars Technica, TechCrunch, MIT Technology Review.
7. **Akademisk Forskning (arXiv)**: cs.CL (Sprog & LLM), cs.AI (Kunstig Intelligens), cs.LG (Machine Learning).

---

## 🛠️ Lokal Udvikling

```bash
# 1. Klon repoet
git clone https://github.com/AdamBindslev/aiopdatering.git
cd aiopdatering

# 2. Installer dependencies
npm install

# 3. Kør udviklingsserver
npm run dev
```

Åbn derefter [http://localhost:3000](http://localhost:3000) i din browser.

For at teste en produktionsbygning lokalt:
```bash
npm run build
npm run start
```

---

## 🚀 Udrulning på Vercel

Sitet er 100% optimeret til Vercel:
1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik på **"Add New..."** -> **"Project"**
3. Importer dit GitHub-repository: `https://github.com/AdamBindslev/aiopdatering`
4. Vercel registrerer automatisk Next.js og opsætter build-kommandoen (`npm run build`). Der kræves ingen miljøvariabler (env vars).
5. Klik **Deploy**!

Efter deploy er dit website live med automatisk opdatering hvert 15. minut.
