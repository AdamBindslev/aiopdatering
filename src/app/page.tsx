import { getAllFeeds } from '@/lib/rss';
import { MainNewspaper } from '@/components/MainNewspaper';

// Revalidate page every 15 minutes (900 seconds) via Incremental Static Regeneration (ISR)
export const revalidate = 900;

export default async function HomePage() {
  const feedsData = await getAllFeeds();

  return <MainNewspaper initialData={feedsData} />;
}
