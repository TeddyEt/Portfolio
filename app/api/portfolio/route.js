import { NextResponse } from 'next/server';
import { getPortfolioData, savePortfolioData } from '../../../lib/portfolio';

export const dynamic = 'force-dynamic';

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

    await savePortfolioData(mergedData);

    const { settings: _, ...publicResponse } = mergedData;
    return NextResponse.json({ success: true, data: publicResponse });
  } catch (err) {
    console.error('Error updating portfolio data:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while saving data' },
      { status: 500 }
    );
  }
}
