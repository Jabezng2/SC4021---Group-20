"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResult = {
  id: string;
  text: string;
  platform?: string;
  exchange?: string;
  sentiment?: string;
  source?: string;
  reddit_score?: number;
  rating?: number;
  date?: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "*:*";

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const queryString = searchParams.toString();
        const res = await fetch(
          `http://127.0.0.1:5000/api/search?${queryString}`
        );
        const data = await res.json();

        if (res.ok) {
          setResults(data.results || []);
        } else {
          setError(data.error || "Unknown error");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for:{" "}
        <span className="text-blue-600">{decodeURIComponent(query)}</span>
      </h1>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      )}

      {error && <p className="text-red-600 font-medium">Error: {error}</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}

      <div className="space-y-4">
        {results.map((doc) => (
          <Card key={doc.id} className="bg-white shadow-sm border rounded-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">
                {doc.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm text-gray-600">
              {doc.source && (
                <Badge variant="secondary">Source: {doc.source}</Badge>
              )}
              {doc.exchange && (
                <Badge variant="outline">Exchange: {doc.exchange}</Badge>
              )}
              {doc.sentiment && (
                <Badge
                  className={
                    doc.sentiment === "positive"
                      ? "bg-green-500 text-white"
                      : doc.sentiment === "negative"
                      ? "bg-red-500 text-white"
                      : "bg-gray-500 text-white"
                  }
                >
                  Sentiment: {doc.sentiment}
                </Badge>
              )}

              {/* Conditional score display */}
              {doc.source?.startsWith("r/") &&
                typeof doc.reddit_score === "number" && (
                  <Badge variant="outline">
                    Reddit Score: {doc.reddit_score}
                  </Badge>
                )}
              {!doc.source?.startsWith("r/") &&
                typeof doc.rating === "number" && (
                  <Badge variant="outline">Rating: {doc.rating}</Badge>
                )}

              {doc.date && (
                <Badge variant="secondary">
                  Date: {new Date(doc.date).toLocaleDateString()}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
