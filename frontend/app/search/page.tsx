"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "*:*";
  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const queryString = searchParams.toString();
        const res = await fetch(`http://127.0.0.1:5000/api/search?${queryString}`);
        const data = await res.json();

        if (res.ok) {
          setResults(data.results || []);
        } else {
          setError(data.error || "Unknown error");
        }
      } catch {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);
  
  const handleSearch = () => {
    if (!searchInput.trim()) return;
  
    const params = new URLSearchParams({
      q: searchInput.trim(),
    });
  
    router.push(`/search?${params.toString()}`);
  };  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-12 w-12"
        >
            <Home className="h-8 w-8 mx-auto my-auto" />
        </Button>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search something..."
          className="flex-1 h-12 text-base"
        />
        <Button
            onClick={handleSearch}
            className="h-12 text-base px-6 cursor-pointer"
        >Search</Button>
      </div>
      <h3 className="text-2xl font-bold mb-6">
        Search Results for:{" "}
        <span className="text-blue-600">{decodeURIComponent(query)}</span>
      </h3>

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
        {results.map((doc) => {
          const isExpanded = expandedMap[doc.id] ?? false;

          return (
            <Card key={doc.id} className="bg-white shadow-sm border rounded-md">
              <CardContent>
                <div className="flex flex-col gap-1">
                <span
                    className={`text-lg font-bold text-gray-900 whitespace-pre-wrap break-words ${
                        isExpanded ? "" : "line-clamp-3"
                    }`}
                    >
                    {doc.text}
                </span>
                  {doc.text[0].length > 300 && (
                    <Button
                        variant="link"
                        onClick={() => toggleExpand(doc.id)}
                        className="p-0 h-auto text-sm font-semibold text-blue-600 self-start hover:underline underline-offset-2"
                    >
                        {isExpanded ? "Show less" : "Show more"}
                    </Button>                  
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-wrap gap-2 text-sm text-gray-600">
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
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}