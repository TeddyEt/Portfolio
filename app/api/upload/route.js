import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name || 'file';
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
    
    let destDir = path.join(process.cwd(), 'public', 'uploads');
    let relativeUrl = '';

    if (targetType === 'cv') {
      // For CV, maintain predictable CV.pdf naming while backing up
      const destPath = path.join(destDir, 'CV.pdf');
      await fs.writeFile(destPath, buffer);
      // Also copy to root public for direct access
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
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
