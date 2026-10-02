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

    // Check for Vercel Blob token (supports all standard Vercel variable naming)
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.STORAGE_BLOB_READ_WRITE_TOKEN;

    // 1. Preferred on Vercel: Vercel Blob Storage if configured
    if (blobToken) {
      try {
        const blobFileName = targetType === 'cv' ? 'CV.pdf' : `${baseName}_${Date.now()}${extension}`;
        const blob = await put(`uploads/${blobFileName}`, file, {
          access: 'public',
          addRandomSuffix: targetType !== 'cv',
          token: blobToken,
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          fileName: file.name,
        });
      } catch (blobErr) {
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
            'Vercel Blob token not detected in this deployment runtime. After connecting Blob Storage in Vercel, push a git commit to trigger a fresh deployment so Vercel injects BLOB_READ_WRITE_TOKEN. (Note: Your CV(3).pdf is already integrated directly into the git repository and live on the site!)',
        },
        { status: 500 }
      );
    }

    // 3. Local filesystem storage (for local development or environments with writable disks)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

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
