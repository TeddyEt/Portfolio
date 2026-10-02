import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

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
        ...currentData.settings,
        ...(updatedData.settings || {}),
      },
    };

    // Save backup first
    if (currentData) {
      await fs.writeFile(backupFilePath, JSON.stringify(currentData, null, 2), 'utf-8');
    }

    // Write new data
    await fs.writeFile(dataFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');

    const { settings: _, ...publicResponse } = mergedData;
    return NextResponse.json({ success: true, data: publicResponse });
  } catch (err) {
    console.error('Error updating portfolio.json:', err);
    return NextResponse.json({ error: 'Internal server error while saving data' }, { status: 500 });
  }
}
