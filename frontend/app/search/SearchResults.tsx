"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { ChartColumnDecreasing } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis, ResponsiveContainer} from "recharts"
import { ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  sentiment: {
    label: "Count",
    color: ""
  },
  positive: {
    label: "Positive",
    color: "#22c55e"
  },
  negative: {
    label: "Negative",
    color: "#ef4444"
  },
  neutral: {
    label: "Neutral",
    color: "#6b7280"
  }
} satisfies ChartConfig

type SearchResult = {
  id: string;
  text: string;
  platform?: string;
  exchange?: string[];
  sentiment?: string;
  source?: string;
  reddit_score?: number;
  rating?: number;
  date?: string;
};

const exchangeLogos: Record<string, { name: string; logo: string }> = {
  binance: { name: "Binance", logo: "/logos/binance.png" },
  coinbase: { name: "Coinbase", logo: "/logos/coinbase.png" },
  kraken: { name: "Kraken", logo: "/logos/kraken.png" },
  okx: { name: "OKX", logo: "/logos/okx.png" },
  kucoin: { name: "Kucoin", logo: "/logos/kucoin.png" },
  cryptocom: { name: "Crypto.com", logo: "/logos/crypto.png" },
  bybit: { name: "Bybit.com", logo: "/logos/bybit.png" },
};

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "*:*";
  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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

  const getSentimentData = () => {
    const counts = [
      { sentiment: "Positive", count: 0, fill: "#22c55e"  },
      { sentiment: "Negative", count: 0, fill: "#ef4444" },
      { sentiment: "Neutral", count: 0, fill: "#6b7280" },
    ];
  
    results.forEach((r) => {
      const s = r.sentiment?.toLowerCase();
      if (s === "positive") counts[0].count += 1;
      else if (s === "negative") counts[1].count += 1;
      else counts[2].count += 1;
    });
  
    return counts;
  };  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="h-12 w-12 p-0"
        >
          <Home className="h-12 w-12" />
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
        >
          Search
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">
          Search Results for:{" "}
          <span className="text-blue-600">{decodeURIComponent(query)}</span>
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 py-2 text-sm flex items-center gap-2">
              <ChartColumnDecreasing className="w-4 h-4" /> Plots
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Sentiment Distribution</DialogTitle>
            </DialogHeader>

            <ChartContainer config={chartConfig} className="h-[280px] px-4 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getSentimentData()}
                  margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="sentiment"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    width={30}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: "12px" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {getSentimentData().map((entry) => (
                      <Cell
                        key={entry.sentiment}
                        fill={
                          chartConfig[entry.sentiment.toLowerCase() as keyof typeof chartConfig].color
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </DialogContent>
        </Dialog>
      </div>

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
                {doc.exchange?.length &&
                  doc.exchange.map((ex) => {
                    const key = ex.toLowerCase().replace(/\W/g, "");
                    const exchange = exchangeLogos[key];
                    if (!exchange) return null;

                    return (
                      <Badge
                        key={ex}
                        variant="outline"
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 font-bold"
                      >
                        <img src={exchange.logo} alt={exchange.name} className="w-4 h-4" />
                        {exchange.name}
                      </Badge>
                    );
                })}
                {doc.source && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-bold">
                    Source: {capitalize(doc.source)}
                  </Badge>
                )}

                {doc.sentiment && (
                  <Badge
                    className={
                      doc.sentiment === "positive"
                        ? "bg-green-500 text-white font-bold"
                        : doc.sentiment === "negative"
                        ? "bg-red-500 text-white font-bold"
                        : "bg-gray-500 text-white font-bold"
                    }
                  >
                    Sentiment: {capitalize(doc.sentiment)}
                  </Badge>
                )}

                {doc.source?.startsWith("r/") && typeof doc.reddit_score === "number" && (
                  <Badge className="bg-orange-500 text-white font-bold">
                    Reddit Score: {doc.reddit_score}
                  </Badge>
                )}

                {!doc.source?.startsWith("r/") && typeof doc.rating === "number" && (
                  <Badge className="bg-yellow-500 text-white font-bold">
                    Rating: {doc.rating}
                  </Badge>
                )}

                {doc.date && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-bold">
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