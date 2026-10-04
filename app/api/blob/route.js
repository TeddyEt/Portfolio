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

    const blob = await get(blobUrl, {
      access: 'private',
      token: blobToken,
    });

    if (!blob || !blob.body) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(blob.body, {
      status: 200,
      headers: {
        'Content-Type': blob.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Private blob proxy error:', err);
    return new Response('Failed to retrieve file', { status: 500 });
  }
}
