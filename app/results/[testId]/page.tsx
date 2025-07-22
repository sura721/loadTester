export default function ResultPage({ params }: { params: { testId: string } }) {
  return (
    <div>
      <h1>Results for Test ID: {params.testId}</h1>
      <p>Loading results...</p>
    </div>
  );
}