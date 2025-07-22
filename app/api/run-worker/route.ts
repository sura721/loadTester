 
import { kv } from '@vercel/kv';
import chromium from '@sparticuz/chromium';
import playwright from 'playwright-core';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Worker function started...');
  let browser = null;

  try {
     const { url, testId } = await req.json();

    if (!url || !testId) {
      return NextResponse.json({ error: 'URL and testId are required' }, { status: 400 });
    }

    console.log(`Starting browser for URL: ${url}`);

     browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless:true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });  
     const metrics = await page.evaluate(() => {
      const paintTimings = performance.getEntriesByType('paint');
      const fcp = paintTimings.find(p => p.name === 'first-contentful-paint')?.startTime;
      const lcp = performance.getEntriesByType('largest-contentful-paint').pop()?.startTime;
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;

      return {
        lcp: lcp ? Math.round(lcp) : null, 
        fcp: fcp ? Math.round(fcp) : null,
        ttfb: ttfb ? Math.round(ttfb) : null,
      };
    });

    console.log('Metrics collected:', metrics);

     const result = {
      ...metrics,
      error: null,
    };

     await kv.rpush(`results:${testId}`, JSON.stringify(result));
    console.log(`Result saved to KV for testId: ${testId}`);

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('An error occurred in the worker:', error);

     const testId = (await req.json().catch(() => ({})))?.testId;
    if(testId) {
      const errorResult = { lcp: null, fcp: null, ttfb: null, error: (error as Error).message };
      await kv.rpush(`results:${testId}`, JSON.stringify(errorResult));
    }

    return NextResponse.json({ error: 'Failed to run test' }, { status: 500 });
    
  } finally {
     if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
}