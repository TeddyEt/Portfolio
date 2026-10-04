import { promises as fs } from 'fs';
import path from 'path';
import { get, put } from '@vercel/blob';

const dataFilePath = path.join(process.cwd(), 'data', 'portfolio.json');
const backupFilePath = path.join(process.cwd(), 'data', 'portfolio.backup.json');

function getBlobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    process.env.STORAGE_BLOB_READ_WRITE_TOKEN
  );
}

export async function getPortfolioData() {
  const token = getBlobToken();

  // 1. If running with Vercel Blob Storage, attempt reading remote state
  if (token) {
    // Try private access first (the user's store is private)
    try {
      const res = await get('data/portfolio.json', {
        access: 'private',
        token,
        useCache: false,
      });
      if (res && res.stream) {
        const text = await new Response(res.stream).text();
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (e1) {
      // If private failed, attempt public
      try {
        const res = await get('data/portfolio.json', {
          access: 'public',
          token,
          useCache: false,
        });
        if (res && res.stream) {
          const text = await new Response(res.stream).text();
          if (text) {
            return JSON.parse(text);
          }
        }
      } catch (e2) {
        // Fall back to local file below
      }
    }
  }

  // 2. Fall back to local file in data/portfolio.json
  try {
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading portfolio.json from disk:', err);
    return null;
  }
}

export async function savePortfolioData(data) {
  const token = getBlobToken();
  const jsonString = JSON.stringify(data, null, 2);

  // 1. If Vercel Blob is configured, save to blob store
  if (token) {
    try {
      // Try public access first
      await put('data/portfolio.json', jsonString, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
        contentType: 'application/json',
      });
    } catch (publicErr) {
      // If store is private, save with private access
      try {
        await put('data/portfolio.json', jsonString, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          token,
          contentType: 'application/json',
        });
      } catch (privateErr) {
        console.error('Failed to save to Vercel Blob:', privateErr);
        throw privateErr;
      }
    }
  }

  // 2. Also write to local file system if writable
  try {
    try {
      const current = await fs.readFile(dataFilePath, 'utf-8');
      await fs.writeFile(backupFilePath, current, 'utf-8');
    } catch (_) {}

    await fs.writeFile(dataFilePath, jsonString, 'utf-8');
  } catch (fsErr) {
    // If running in a read-only filesystem (like Vercel production)
    if (fsErr.code === 'EROFS' || fsErr.message?.includes('read-only')) {
      if (!token) {
        throw new Error(
          'Vercel filesystem is read-only and no Vercel Blob token was detected. Please verify your Blob Storage connection.'
        );
      }
      // If token saved successfully, EROFS is expected on Vercel and safe to ignore
      return;
    }
    throw fsErr;
  }
}
