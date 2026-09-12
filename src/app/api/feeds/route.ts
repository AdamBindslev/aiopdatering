import { NextResponse } from 'next/server';
import { getAllFeeds } from '@/lib/rss';

export const revalidate = 900; // 15 minutes ISR

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('refresh') === 'true';

  try {
    const data = await getAllFeeds(force);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': force
          ? 'no-store, max-age=0'
          : 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke hente feeds', details: (error as Error).message },
      { status: 500 }
    );
  }
}
