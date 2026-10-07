import { get } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return new Response('Missing blob URL', { status: 400 });
    }

    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.STORAGE_BLOB_READ_WRITE_TOKEN;

    let result = null;

    // Try private access first (private store)
    try {
      result = await get(blobUrl, {
        access: 'private',
        token: blobToken,
      });
    } catch (err1) {
      // Try public access fallback
      try {
        result = await get(blobUrl, {
          access: 'public',
          token: blobToken,
        });
      } catch (err2) {
        console.error('Failed to get blob with private and public access:', err1, err2);
      }
    }

    const stream = result?.stream || result?.body;

    if (!result || !stream) {
      return new Response('File not found', { status: 404 });
    }

    const contentType =
      result?.blob?.contentType ||
      result?.headers?.get?.('content-type') ||
      'application/octet-stream';

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Private blob proxy error:', err);
    return new Response('Failed to retrieve file', { status: 500 });
  }
}
