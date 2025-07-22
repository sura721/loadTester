// components/result-dashboard.tsx

"use client";

import { TestMetadata, TestResult } from "@/app/results/[testId]/page";
import { useEffect, useState } from "react";

interface Props {
  initialMetadata: TestMetadata;
  initialResults: TestResult[];
}

export function ResultDashboard({ initialMetadata, initialResults }: Props) {
  const [metadata, setMetadata] = useState(initialMetadata);
  const [results, setResults] = useState(initialResults);

   useEffect(() => {
    console.log("--- DATA RECEIVED ON CLIENT ---");
    console.log("Metadata:", metadata);
    console.log("Results:", results);
    console.log(`Received ${results.length} out of ${metadata.concurrency} expected results.`);
  }, []); 
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Results for Test: {metadata.id}</h1>
      <p className="text-muted-foreground">Testing URL: {metadata.url}</p>
      <hr className="my-4" />

      <h2 className="text-xl font-semibold mt-6">Raw Data Received:</h2>
      <p>Check your browser's developer console to see the raw data.</p>
      <pre className="bg-slate-900 p-4 rounded-md mt-2 overflow-x-auto text-sm">
        {JSON.stringify({ metadata, results }, null, 2)}
      </pre>
    </div>
  );
}