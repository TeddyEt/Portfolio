import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const pin = formData.get('pin');
    const file = formData.get('file');
    const targetType = formData.get('type') || 'upload'; // 'cv' | 'project' | 'upload'

    // Validate PIN
    const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');
    let validPin = '2027';
    try {
      const raw = await fs.readFile(dataFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      validPin = parsed?.settings?.adminPin || '2027';
    } catch (e) {
      // default pin
    }

    if (!pin || String(pin).trim() !== String(validPin).trim()) {
      return NextResponse.json({ error: 'Unauthorized: Invalid PIN' }, { status: 401 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const originalName = file.name || 'file';
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_');

    // Convert file to Buffer for maximum reliability across environments
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check for Vercel Blob token (supports all standard Vercel variable naming)
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.STORAGE_BLOB_READ_WRITE_TOKEN;

    // 1. Preferred on Vercel: Vercel Blob Storage if configured
    if (blobToken) {
      const blobFileName = targetType === 'cv' ? `CV_${Date.now()}.pdf` : `${baseName}_${Date.now()}${extension}`;
      const contentType = file.type || (targetType === 'cv' ? 'application/pdf' : 'application/octet-stream');

      try {
        // Try public access first
        const blob = await put(`uploads/${blobFileName}`, buffer, {
          access: 'public',
          addRandomSuffix: true,
          allowOverwrite: true,
          token: blobToken,
          contentType,
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          fileName: file.name,
        });
      } catch (blobErr) {
        // If the store is configured as private, upload with private access and proxy URL
        const isPrivateStore =
          blobErr.message?.includes('private store') ||
          blobErr.message?.includes('Cannot use public access') ||
          blobErr.message?.includes('private');

        if (isPrivateStore) {
          try {
            const privateBlob = await put(`uploads/${blobFileName}`, buffer, {
              access: 'private',
              addRandomSuffix: true,
              allowOverwrite: true,
              token: blobToken,
              contentType,
            });

            return NextResponse.json({
              success: true,
              url: `/api/blob?url=${encodeURIComponent(privateBlob.url)}`,
              fileName: file.name,
              isPrivate: true,
            });
          } catch (privateErr) {
            console.error('Private Blob upload error:', privateErr);
            return NextResponse.json(
              {
                error: `Vercel Blob upload failed: ${privateErr.message || privateErr}`,
              },
              { status: 500 }
            );
          }
        }

        console.error('Vercel Blob upload error:', blobErr);
        return NextResponse.json(
          {
            error: `Vercel Blob upload failed: ${blobErr.message || blobErr}`,
          },
          { status: 500 }
        );
      }
    }

    // 2. If running on Vercel without token detected
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            'Vercel Blob token (BLOB_READ_WRITE_TOKEN) is not available to this deployment. In Vercel Dashboard -> Settings -> Environment Variables, verify BLOB_READ_WRITE_TOKEN is checked for Production and redeploy. (Note: Your CV(3).pdf is now directly committed to the main branch and live on your site!)',
        },
        { status: 500 }
      );
    }

    // 3. Local filesystem storage (for local development or environments with writable disks)
    try {
      let destDir = path.join(process.cwd(), 'public', 'uploads');
      let relativeUrl = '';

      if (targetType === 'cv') {
        const destPath = path.join(destDir, 'CV.pdf');
        await fs.writeFile(destPath, buffer);
        await fs.writeFile(path.join(process.cwd(), 'public', 'CV.pdf'), buffer);
        relativeUrl = '/uploads/CV.pdf';
      } else {
        const fileName = `${baseName}_${Date.now()}${extension}`;
        const destPath = path.join(destDir, fileName);
        await fs.writeFile(destPath, buffer);
        relativeUrl = `/uploads/${fileName}`;
      }

      return NextResponse.json({
        success: true,
        url: relativeUrl,
        fileName: file.name,
      });
    } catch (fsErr) {
      console.error('Filesystem write error:', fsErr);
      return NextResponse.json({ error: fsErr.message || 'Filesystem write error' }, { status: 500 });
    }
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload file' }, { status: 500 });
  }
}
