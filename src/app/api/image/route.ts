import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) return new Response('Missing path', { status: 400 });

  try {
    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
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
