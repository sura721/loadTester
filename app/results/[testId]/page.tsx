 
import { kv } from '@vercel/kv';
import { ResultDashboard } from '@/components/result-dashboard';
export interface TestResult {
  workerId: number;
  lcp: number | null;
  fcp: number | null;
  ttfb: number | null;
  error: string | null;
}

export interface TestMetadata {
  id: string;
  url: string;
  concurrency: number;
  duration: number;
  status: 'running' | 'completed';
  createdAt: number;
  completedAt?: number;
}

 async function getTestResults(testId: string): Promise<{ metadata: TestMetadata | null; results: TestResult[] }> {
  try {
    const metadata = await kv.hgetall(`test:${testId}`) as TestMetadata | null;
    const resultStrings = await kv.lrange(`results:${testId}`, 0, -1);
    const results = resultStrings.map(res => JSON.parse(res as string) as TestResult);
    return { metadata, results };
  } catch (error) {
    console.error("Failed to fetch test results:", error);
    return { metadata: null, results: [] };
  }
}

export default async function ResultPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } =await params;
  const { metadata, results } = await getTestResults(testId);

  if (!metadata) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Test not found.</h1>
        <p>The test ID "{testId}" does not exist or could not be loaded.</p>
      </div>
    );
  }

   return <ResultDashboard initialMetadata={metadata} initialResults={results} />;
}