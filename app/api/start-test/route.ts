 
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

 
function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function POST(req: NextRequest) {
  try {
    const { url, concurrency, duration } = await req.json();

    if (!url || !concurrency || !duration) {
      return NextResponse.json({ error: 'URL, concurrency, and duration are required' }, { status: 400 });
    }
 
    const testId = `tst_${nanoid()}`;
    console.log(`Generated real test ID: ${testId}`);

    
    await kv.hset(`test:${testId}`, {
      id: testId,
      url,
      concurrency,
      duration,
      status: 'running',
      createdAt: Date.now(),
    });
    console.log(`Test metadata saved for ${testId}`);
 
    const baseUrl = getBaseUrl();
    const workerPromises = [];

    for (let i = 0; i < concurrency; i++) {
 
      const promise = fetch(`${baseUrl}/api/run-worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, testId }),
      });
      workerPromises.push(promise);
        }
    Promise.all(workerPromises)
      .then(() => console.log(`All ${concurrency} workers for test ${testId} have been dispatched.`))
      .catch((err) => console.error(`Error dispatching workers for ${testId}`, err));
 
    Promise.allSettled(workerPromises).finally(async () => {
      await kv.hset(`test:${testId}`, { status: 'completed', completedAt: Date.now() });
      console.log(`Test ${testId} marked as completed.`);
    });
    
 
    return NextResponse.json({ testId });

  } catch (error) {
    console.error('Error in start-test API:', error);
    return NextResponse.json({ error: 'Failed to start test' }, { status: 500 });
  }
}