import { NextRequest } from 'next/server';

async function getDropboxToken(): Promise<string> {
  const refresh = process.env.DROPBOX_REFRESH_TOKEN;
  const key     = process.env.DROPBOX_APP_KEY;
  const secret  = process.env.DROPBOX_APP_SECRET;
  if (refresh && key && secret) {
    const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh, client_id: key, client_secret: secret }),
    });
    if (r.ok) return ((await r.json()).access_token as string);
  }
  return process.env.DROPBOX_ACCESS_TOKEN ?? '';
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) return new Response('Missing path', { status: 400 });

  try {
    const token = await getDropboxToken();
    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({ path }).replace(/[\u0080-\uFFFF]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`),
      },
    });

    if (!res.ok) return new Response('Image not found', { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new Response('Error fetching image', { status: 500 });
  }
}
