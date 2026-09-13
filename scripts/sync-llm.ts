import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { getAllFeeds, normalizeUrl } from '../src/lib/rss';
import { FeedItem, EnrichedArticleData, TrendingTopicData, SupportingStory } from '../src/types';

// Load environment variables (.env.local first, then .env)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

interface OllamaTagResponse {
  models?: Array<{ name: string; model: string }>;
}

interface EnrichedJsonPayload {
  danishTitle?: string;
  danishSummary?: string;
  whyItMatters?: string;
}

interface TrendingJsonPayload {
  headline?: string;
  summary?: string;
  whyItMatters?: string;
  primaryArticleIndex?: number;
  supportingArticleIndices?: number[];
  angles?: Record<string, string>;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/enriched_articles.json');
const TRENDING_DATA_PATH = path.join(process.cwd(), 'src/data/trending_topic.json');
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

function log(msg: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${msg}`);
}

function errorLog(msg: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.error(`[${timestamp}] ❌ ${msg}`);
}

async function checkOllama(preferredModel: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      errorLog(`Ollama svarede med status ${res.status} på ${OLLAMA_HOST}`);
      return null;
    }
    const data = (await res.json()) as OllamaTagResponse;
    const models = data.models || [];
    if (models.length === 0) {
      errorLog(`Ollama kører, men der er ingen modeller installeret på ${OLLAMA_HOST}. Kør f.eks.: ollama pull qwen2.5:7b`);
      return null;
    }

    // 1. Check exact preferred model match
    const exactMatch = models.find((m) => m.name === preferredModel || m.name.startsWith(`${preferredModel}:`));
    if (exactMatch) return exactMatch.name;

    // 2. Check for any qwen2.5 model
    const qwenMatch = models.find((m) => m.name.toLowerCase().includes('qwen2.5'));
    if (qwenMatch) return qwenMatch.name;

    // 3. Fallback to first available model
    const fallback = models[0].name;
    log(`ℹ️ Foretrukken model '${preferredModel}' ikke fundet. Bruger tilgængelig model: '${fallback}'`);
    log(`💡 Tip: Kør 'ollama pull qwen2.5:7b' for optimal dansk kvalitet.`);
    return fallback;
  } catch (err: any) {
    errorLog(`Kunne ikke forbinde til Ollama på ${OLLAMA_HOST}: ${err.message}`);
    log(`Sørg for at Ollama er startet på din Mac Mini ('ollama serve' eller Ollama.app).`);
    return null;
  }
}

function loadEnrichedMap(): Record<string, EnrichedArticleData> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    log(`Kunne ikke læse eksisterende ${DATA_FILE_PATH} - opretter ny.`);
  }
  return {};
}

function saveEnrichedMap(map: Record<string, EnrichedArticleData>) {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(map, null, 2), 'utf-8');
}

function saveTrendingTopic(data: TrendingTopicData) {
  const dir = path.dirname(TRENDING_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TRENDING_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function callOllama(
  model: string,
  article: FeedItem
): Promise<EnrichedJsonPayload | null> {
  const systemPrompt = `Du er en skarp dansk AI- og tech-journalist for avisen 'AI Opdatering'.
Din opgave er at analysere den givne artikel og generere et struktureret JSON-output på fejlfrit, flydende og professionelt dansk.

Du SKAL svare udelukkende med et gyldigt JSON-objekt med præcis disse tre felter:
- "danishTitle": En fængende, præcis og dækkende overskrift på dansk (faglig, skarp, ikke clickbait).
- "danishSummary": Et præcist og velskrevet dansk resumé på 2-3 sætninger, der forklarer hvad nyheden handler om.
- "whyItMatters": 1-2 skarpe sætninger om "Hvorfor det er vigtigt" (konsekvensen for AI-branchen, udviklere, virksomheder eller samfundet).

Eksempel på output-format:
{
  "danishTitle": "OpenAI lancerer ny optimeret ræsonneringsmodel",
  "danishSummary": "OpenAI har i dag præsenteret en ny modelvariant, der reducerer inferensomkostninger med 40% ved komplekse opgaver. Modellen er målrettet kode- og matematiske workflows.",
  "whyItMatters": "Det markante prisfald gør avancerede AI-agenter økonomisk rentable for langt flere virksomheder i produktion."
}`;

  const userContent = `Analyser denne artikel:
Oprindelig titel: ${article.title}
Kilde: ${article.sourceName} (${article.category})
Dato: ${article.pubDate}
Tekstuddrag: ${article.snippet || 'Ingen tekst'}
Link: ${article.link}`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3,
        },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      errorLog(`Ollama fejl (${res.status}) for artikel "${article.title}"`);
      return null;
    }

    const data: any = await res.json();
    const content = data.message?.content || '';

    // Strip potential markdown code blocks
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    if (parsed.danishTitle && parsed.danishSummary && parsed.whyItMatters) {
      return parsed;
    }

    return null;
  } catch (err: any) {
    errorLog(`Fejl under kald til Ollama for "${article.title}": ${err.message}`);
    return null;
  }
}

async function synthesizeTrendingTopic(
  model: string,
  allItems: FeedItem[],
  enrichedMap: Record<string, EnrichedArticleData>
): Promise<TrendingTopicData | null> {
  const now = Date.now();
  const cutoff = now - 48 * 60 * 60 * 1000;
  const recentItems = allItems.filter((i) => i.timestamp >= cutoff);
  const pool = (recentItems.length >= 10 ? recentItems : allItems).slice(0, 30);

  if (pool.length === 0) {
    log(`⚠️ Ikke nok artikler til at danne en syntese for tophistorien.`);
    return null;
  }

  const lines: string[] = [];
  pool.forEach((item, idx) => {
    const dedupKey = normalizeUrl(item.link, item.videoId);
    const enriched = enrichedMap[item.id] || enrichedMap[dedupKey] || enrichedMap[item.link] || item.ai;
    const title = enriched?.danishTitle || item.title;
    const desc = enriched?.danishSummary || item.snippet || '';
    const cleanSnippet = desc.replace(/\s+/g, ' ').substring(0, 150);
    lines.push(`[${idx}] Kilde: ${item.sourceName} | Titel: "${title}" | Resumé: ${cleanSnippet}`);
  });

  const systemPrompt = `Du er chefredaktør for 'AI Opdatering'.
Din opgave er at identificere det vigtigste emne eller den mest afgørende nyhedsbegivenhed lige nu blandt de seneste artikler og skabe en samlet redaktionel syntese (Techmeme-stil).

Du skal analysere artikellisten og vælge det emne, der har størst betydning eller omtale.
Du SKAL svare udelukkende med et gyldigt JSON-objekt med præcis disse felter:
- "headline": En skarp, fængende og præcis overskrift på fejlfrit dansk, der indkapsler historien/trenden.
- "summary": Et præcist resumé på 2-3 velskrevne sætninger på dansk, der syntetiserer hvad der sker og hvorfor det er i fokus.
- "whyItMatters": 1-2 skarpe sætninger på dansk om "Hvorfor det er vigtigt" (konsekvensen for AI-branchen, udviklere eller samfundet).
- "primaryArticleIndex": Indeksnummeret (heltal, f.eks. 0) for den primære kilde eller hovedartikel.
- "supportingArticleIndices": Et array af 2-4 indeksnumre (heltal, f.eks. [1, 3]) på andre artikler fra listen, der belyser samme emne eller tilgrænsende vinkler.
- "angles": Et objekt hvor hver nøgle er et indeks som tekst ("0", "1"...), og værdien er en ultrakort vinkel-label på dansk (maks 2-3 ord, f.eks. "Officiel udmelding", "Teknisk analyse", "Kritik & debat", "Hands-on test").

Eksempel på format:
{
  "headline": "Åbne ræsonneringsmodeller presser tech-giganterne",
  "summary": "Nye open weight-modeller leverer ræsonneringsevner tæt på de førende lukkede systemer. Dette sætter gang i en ny bølge af lokale AI-agenter og udfordrer de store udbyderes prismodeller.",
  "whyItMatters": "Det demokratiserer adgangen til avanceret AI og gør virksomheder mindre afhængige af lukkede platforme.",
  "primaryArticleIndex": 0,
  "supportingArticleIndices": [2, 5],
  "angles": {
    "0": "Officiel lancering",
    "2": "Teknisk dybde",
    "5": "Brancheanalyse"
  }
}`;

  const userContent = `Her er de seneste kandidatartikler:\n\n${lines.join('\n')}\n\nIdentificer det vigtigste emne lige nu og returner JSON-syntesen.`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      errorLog(`Ollama fejl (${res.status}) ved syntese af toptema`);
      return null;
    }

    const data: any = await res.json();
    const content = data.message?.content || '';

    let cleanJson = content.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed: TrendingJsonPayload = JSON.parse(cleanJson);
    if (!parsed.headline || !parsed.summary || typeof parsed.primaryArticleIndex !== 'number') {
      log(`⚠️ Ufuldstændigt svar fra LLM for trending topic.`);
      return null;
    }

    const primaryRaw = pool[parsed.primaryArticleIndex] || pool[0];
    const primaryEnriched = enrichedMap[primaryRaw.id] || enrichedMap[normalizeUrl(primaryRaw.link, primaryRaw.videoId)] || enrichedMap[primaryRaw.link] || primaryRaw.ai;

    const primaryArticle: SupportingStory = {
      id: primaryRaw.id,
      title: primaryEnriched?.danishTitle || primaryRaw.title,
      link: primaryRaw.link,
      sourceName: primaryRaw.sourceName,
      sourceId: primaryRaw.sourceId,
      pubDate: primaryRaw.pubDate,
      badgeColor: primaryRaw.badgeColor,
      angle: parsed.angles?.[String(parsed.primaryArticleIndex)] || 'Primær kilde',
    };

    const supportingStories: SupportingStory[] = [];
    const usedIds = new Set<string>([primaryArticle.id]);

    if (Array.isArray(parsed.supportingArticleIndices)) {
      for (const idx of parsed.supportingArticleIndices) {
        if (typeof idx === 'number' && pool[idx]) {
          const rawItem = pool[idx];
          if (!usedIds.has(rawItem.id)) {
            usedIds.add(rawItem.id);
            const enriched = enrichedMap[rawItem.id] || enrichedMap[normalizeUrl(rawItem.link, rawItem.videoId)] || enrichedMap[rawItem.link] || rawItem.ai;
            supportingStories.push({
              id: rawItem.id,
              title: enriched?.danishTitle || rawItem.title,
              link: rawItem.link,
              sourceName: rawItem.sourceName,
              sourceId: rawItem.sourceId,
              pubDate: rawItem.pubDate,
              badgeColor: rawItem.badgeColor,
              angle: parsed.angles?.[String(idx)] || undefined,
            });
          }
        }
      }
    }

    const trendingTopic: TrendingTopicData = {
      headline: parsed.headline.trim(),
      summary: parsed.summary.trim(),
      whyItMatters: (parsed.whyItMatters || '').trim(),
      synthesizedAt: new Date().toISOString(),
      modelUsed: model,
      primaryArticle,
      supportingStories,
    };

    saveTrendingTopic(trendingTopic);
    log(`✅ Toptema-syntese fuldført: "${trendingTopic.headline}" (${supportingStories.length} understøttende kilder)`);
    return trendingTopic;
  } catch (err: any) {
    errorLog(`Fejl under syntese af toptema: ${err.message}`);
    return null;
  }
}

async function runGitSync() {
  try {
    log(`Kører Git-synkronisering mod fjernlager...`);
    const status = execSync('git status --porcelain src/data/enriched_articles.json src/data/trending_topic.json', { encoding: 'utf-8' }).trim();
    if (!status) {
      log(`Ingen ændringer i JSON-datafiler - skipper git commit/push.`);
      return;
    }

    execSync('git add src/data/enriched_articles.json src/data/trending_topic.json', { stdio: 'pipe' });
    const count = Object.keys(loadEnrichedMap()).length;
    execSync(`git commit -m "chore(feeds): opdater AI-resuméer (${count} artikler) og toptema [skip ci]"`, { stdio: 'pipe' });
    log(`Artikler og toptema committet. Pusher til GitHub...`);
    execSync('git push', { stdio: 'pipe' });
    log(`✅ Git push fuldført! Vercel opdateres automatisk.`);
  } catch (gitErr: any) {
    errorLog(`Git-fejl under commit/push: ${gitErr.message}`);
    if (gitErr.stderr) {
      console.error(gitErr.stderr.toString());
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldPush = args.includes('--push');
  const isAuto = args.includes('--auto');
  const isForce = args.includes('--force');

  let limit = 35;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10) || 35;
  }

  log(`=== Starter AI Opdatering LLM Baggrunds-Sync ===`);
  if (isAuto) log(`Kører i headless automatisk tilstand.`);

  // 1. Check Ollama
  const activeModel = await checkOllama(DEFAULT_MODEL);
  if (!activeModel) {
    errorLog(`Afbryder synkronisering: Ollama er ikke klar.`);
    process.exit(1);
  }
  log(`Forbundet til Ollama. Aktiv model: '${activeModel}'`);

  // 2. Pre-pull latest git state if auto
  if (isAuto || shouldPush) {
    try {
      execSync('git pull --rebase', { stdio: 'pipe' });
    } catch {
      log(`Bemærkning: 'git pull --rebase' hoppede over.`);
    }
  }

  // 3. Load existing enriched articles
  const enrichedMap = loadEnrichedMap();
  const existingKeys = new Set(Object.keys(enrichedMap));
  log(`Indlæst ${Object.keys(enrichedMap).length} eksisterende berigede artikler fra JSON.`);

  // 4. Fetch feeds
  log(`Henter seneste RSS-feeds...`);
  const feedsResponse = await getAllFeeds(true);
  const items = feedsResponse.items;
  log(`Hentet ${items.length} samlede artikler fra ${feedsResponse.successfulSources} kilder.`);

  // 5. Select candidate articles (focus on recent 48 hours)
  const now = Date.now();
  const cutoffTime = now - 48 * 60 * 60 * 1000;

  const candidates: FeedItem[] = [];
  for (const item of items) {
    if (candidates.length >= limit) break;

    const dedupKey = normalizeUrl(item.link, item.videoId);
    const alreadyEnriched = !isForce && (existingKeys.has(item.id) || existingKeys.has(dedupKey) || existingKeys.has(item.link));

    if (!alreadyEnriched) {
      // Prioritize articles within 48h, or include if we have few candidates
      if (item.timestamp >= cutoffTime || candidates.length < 10) {
        candidates.push(item);
      }
    }
  }

  log(`Fandt ${candidates.length} nye artikler der skal beriges af LLM (loft: ${limit}).`);

  if (candidates.length === 0) {
    log(`Ingen nye artikler mangler individuelt AI-resumé.`);
    log(`Opdaterer redaktionel toptema-syntese for "Det er vigtigt lige nu"...`);
    await synthesizeTrendingTopic(activeModel, items, enrichedMap);
    if (shouldPush || isAuto) await runGitSync();
    return;
  }

  // 6. Process candidates sequentially to respect Mac Mini compute
  let successCount = 0;
  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    const dedupKey = normalizeUrl(item.link, item.videoId);
    log(`[${i + 1}/${candidates.length}] Behandler: "${item.title.substring(0, 50)}..." (${item.sourceName})`);

    const enriched = await callOllama(activeModel, item);
    if (enriched && enriched.danishTitle && enriched.danishSummary) {
      const data: EnrichedArticleData = {
        danishTitle: enriched.danishTitle.trim(),
        danishSummary: enriched.danishSummary.trim(),
        whyItMatters: (enriched.whyItMatters || '').trim(),
        enrichedAt: new Date().toISOString(),
        modelUsed: activeModel,
      };

      // Store by item.id, normalized url, and raw link for resilient matching
      enrichedMap[item.id] = data;
      enrichedMap[dedupKey] = data;
      enrichedMap[item.link] = data;
      successCount++;

      // Save incrementally so progress is preserved if interrupted
      saveEnrichedMap(enrichedMap);
      log(`  ✓ Beriget: "${data.danishTitle}"`);
    } else {
      log(`  ⚠️ Sprang over pga. ugyldigt LLM-svar.`);
    }
  }

  log(`Færdig! ${successCount} af ${candidates.length} artikler blev beriget og gemt i src/data/enriched_articles.json.`);

  // 7. Synthesize 'Det er vigtigt lige nu' (Techmeme-style Lead Topic Cluster)
  log(`Genererer redaktionel syntese for "Det er vigtigt lige nu"...`);
  await synthesizeTrendingTopic(activeModel, items, enrichedMap);

  // 8. Git commit & push if requested
  if (shouldPush || isAuto) {
    await runGitSync();
  }
}

main().catch((err) => {
  errorLog(`Uventet fejl i sync script: ${err.message}`);
  process.exit(1);
});
