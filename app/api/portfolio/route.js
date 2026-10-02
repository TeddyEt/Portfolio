import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');
const backupFilePath = path.join(process.cwd(), 'data', 'portfolio.backup.json');

async function getPortfolioData() {
  try {
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading portfolio.json:', err);
    return null;
  }
}

export async function GET() {
  const data = await getPortfolioData();
  if (!data) {
    return NextResponse.json({ error: 'Failed to load portfolio data' }, { status: 500 });
  }

  // Return data safely; don't expose adminPin in public response
  const { settings, ...publicData } = data;
  return NextResponse.json(publicData);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, data: updatedData, action } = body;

    const currentData = await getPortfolioData();
    const validPin = currentData?.settings?.adminPin || '2027';

    // Verify PIN action
    if (action === 'verify') {
      if (!pin || String(pin).trim() !== String(validPin).trim()) {
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
      }
      return NextResponse.json({ success: true, valid: true });
    }

    if (!pin || String(pin).trim() !== String(validPin).trim()) {
      return NextResponse.json({ error: 'Invalid Admin PIN' }, { status: 401 });
    }

    if (!updatedData || typeof updatedData !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    // Preserve existing settings/PIN unless explicitly updated with a new one
    const mergedData = {
      ...updatedData,
      settings: {
        ...currentData?.settings,
        ...(updatedData.settings || {}),
      },
    };

    // 1. If Vercel Blob is configured
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.STORAGE_BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      try {
        await put('data/portfolio.json', JSON.stringify(mergedData, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          token: blobToken,
        });
      } catch (blobErr) {
        console.error('Blob portfolio write error:', blobErr);
      }
    }

    // 2. Local filesystem write
    try {
      if (currentData) {
        await fs.writeFile(backupFilePath, JSON.stringify(currentData, null, 2), 'utf-8');
      }
      await fs.writeFile(dataFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');
    } catch (fsErr) {
      if (fsErr.code === 'EROFS' || fsErr.message?.includes('read-only')) {
        if (blobToken) {
          const { settings: _, ...publicResponse } = mergedData;
          return NextResponse.json({ success: true, data: publicResponse });
        }
        return NextResponse.json(
          {
            error:
              'Vercel filesystem is read-only. Connect Vercel Blob (free) in your Vercel Dashboard (Storage -> Create Store -> Blob) to enable live edits on Vercel, or save changes locally and push via Git.',
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }

    const { settings: _, ...publicResponse } = mergedData;
    return NextResponse.json({ success: true, data: publicResponse });
  } catch (err) {
    console.error('Error updating portfolio.json:', err);
    return NextResponse.json({ error: 'Internal server error while saving data' }, { status: 500 });
  }
}
