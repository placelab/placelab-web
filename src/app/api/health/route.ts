import { NextResponse } from 'next/server';

export async function GET() {
  const result: Record<string, unknown> = {};

  // 1) 환경변수 존재 여부
  result.env = {
    DROPBOX_REFRESH_TOKEN: !!process.env.DROPBOX_REFRESH_TOKEN,
    DROPBOX_APP_KEY: !!process.env.DROPBOX_APP_KEY,
    DROPBOX_APP_SECRET: !!process.env.DROPBOX_APP_SECRET,
    DROPBOX_ACCESS_TOKEN: !!process.env.DROPBOX_ACCESS_TOKEN,
    BEHOLD_FEED_ID: !!process.env.BEHOLD_FEED_ID,
  };

  // 2) Dropbox 토큰 갱신 시도
  try {
    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN ?? '',
        client_id: process.env.DROPBOX_APP_KEY ?? '',
        client_secret: process.env.DROPBOX_APP_SECRET ?? '',
      }),
      cache: 'no-store',
    });
    const body = await res.json();
    result.token_refresh = {
      ok: res.ok,
      status: res.status,
      has_access_token: !!body.access_token,
      error: body.error ?? null,
      error_description: body.error_description ?? null,
    };

    // 3) 토큰 성공 시 폴더 목록 시도
    if (res.ok && body.access_token) {
      const listRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${body.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/Projects' }),
        cache: 'no-store',
      });
      const listBody = await listRes.json();
      result.list_projects = {
        ok: listRes.ok,
        status: listRes.status,
        entries: listBody.entries?.map((e: { '.tag': string; name: string }) => `${e['.tag']}:${e.name}`) ?? null,
        error: listBody.error_summary ?? null,
      };
    }
  } catch (e) {
    result.token_refresh = { error: String(e) };
  }

  // 4) Behold 피드 테스트
  try {
    const feed = process.env.BEHOLD_FEED_ID ?? '';
    const url = feed.startsWith('http') ? feed : `https://feeds.behold.so/${feed}`;
    const beholdRes = await fetch(url, { cache: 'no-store' });
    const beholdBody = await beholdRes.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(beholdBody); } catch { /* ignore */ }
    result.behold = {
      url,
      status: beholdRes.status,
      ok: beholdRes.ok,
      is_array: Array.isArray(parsed),
      length: Array.isArray(parsed) ? parsed.length : null,
      raw_preview: beholdBody.slice(0, 400),
      posts_preview: Array.isArray(parsed) ? (parsed as unknown[])[0] : Array.isArray((parsed as Record<string, unknown>)?.posts) ? ((parsed as Record<string, unknown[]>).posts)[0] : null,
    };
  } catch (e) {
    result.behold = { error: String(e) };
  }

  return NextResponse.json(result, { status: 200 });
}
