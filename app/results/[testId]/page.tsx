export default async function ResultPage({ params }: { params: Promise<{ testId: string }> }) {
  const {testId} = await params
  return (
    <div>
      <h1>Results for Test ID: {testId}</h1>
      <p>Loading results...</p>
    </div>
  );
}