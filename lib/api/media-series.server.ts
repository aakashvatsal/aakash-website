import 'server-only';

import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth.server';
import type { MediaSeriesOverview, MediaSeriesRecommendation } from '@/lib/api/media';

const BACKEND_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1';

async function privateSeriesRead<T>(endpoint: string): Promise<T> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) throw new Error('Admin authentication required.');
  const base = new URL(BACKEND_URL);
  if (process.env.NODE_ENV !== 'production' && ['localhost', '::1'].includes(base.hostname)) {
    base.hostname = '127.0.0.1';
  }
  const url = `${base.toString().replace(/\/$/, '')}/media/core/series${endpoint}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'x-owner-session': token },
  });
  if (!response.ok) throw new Error(`Series analytics API returned ${response.status}.`);
  return response.json() as Promise<T>;
}

export function getPrivateMediaSeriesOverview(days = 90) {
  return privateSeriesRead<MediaSeriesOverview>(`?days=${Math.min(Math.max(14, days), 365)}`);
}

export function getPrivateMediaSeriesRecommendations(days = 90) {
  return privateSeriesRead<MediaSeriesRecommendation[]>(`/recommendations?days=${Math.min(Math.max(14, days), 365)}`);
}
