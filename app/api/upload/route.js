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

    // 1. Preferred on Vercel: Vercel Blob Storage if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobFileName = targetType === 'cv' ? 'CV.pdf' : `${baseName}_${Date.now()}${extension}`;
        const blob = await put(`uploads/${blobFileName}`, file, {
          access: 'public',
          addRandomSuffix: targetType !== 'cv',
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          fileName: file.name,
        });
      } catch (blobErr) {
        console.error('Vercel Blob upload error:', blobErr);
      }
    }

    // 2. Local filesystem storage (for local development or environments with writable disks)
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
      // Serverless environments like Vercel have a read-only filesystem
      if (fsErr.code === 'EROFS' || fsErr.message?.includes('read-only')) {
        return NextResponse.json(
          {
            error:
              'Vercel filesystem is read-only. Connect Vercel Blob (free) in your Vercel Dashboard (Storage -> Create Store -> Blob) to enable live uploads on Vercel, or push your CV directly via git.',
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload file' }, { status: 500 });
  }
}
