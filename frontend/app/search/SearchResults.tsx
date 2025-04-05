"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ThumbsUpIcon, ThumbsDownIcon, CircleCheck } from "lucide-react";
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
import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Legend, Line, LineChart} from "recharts"
import { ChartTooltip, ChartTooltipContent, ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartConfigSentiment = {
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

const chartConfigSource = {
  reddit: {
    label: "Reddit",
    color: "#ff4500"
  },
  trustpilot: {
    label: "TrustPilot",
    color: "#007f4e"
  },
  appstore: {
    label: "App Store",
    color: "#0d96f6"
  },
  playstore: {
    label: "Play Store",
    color: "#34a853"
  },
} satisfies ChartConfig

const chartConfigExchange = {
  binance: { label: "Binance", color: "#f0b90b" },
  coinbase: { label: "Coinbase", color: "#1652f0" },
  kraken: { label: "Kraken", color: "#5841d8" },
  okx: { label: "OKX", color: "#000000" },
  kucoin: { label: "Kucoin", color: "#28c0b1" },
  cryptocom: { label: "Crypto.com", color: "#103f68" },
  bybit: { label: "Bybit", color: "#f2a900" }
} satisfies ChartConfig;

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
  type: string;
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
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  const handleFeedback = async (docId: string, value: number) => {
    try {
      await fetch("http://127.0.0.1:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doc_id: docId, value }),
      });

      setFeedbackGiven((prev) => ({ ...prev, [docId]: true }));
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

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
      { sentiment: "Positive", count: 0, fill: "#22c55e" },
      { sentiment: "Negative", count: 0, fill: "#ef4444" },
      { sentiment: "Neutral", count: 0, fill: "#6b7280" },
    ];
  
    results.forEach((r) => {
      const s = r.sentiment?.toLowerCase();
      if (s === "positive") counts[0].count += 1;
      else if (s === "negative") counts[1].count += 1;
      else if (s === "neutral") counts[2].count += 1;
    });
  
    // Filter out 0-count entries
    return counts.filter((entry) => entry.count > 0);
  };

  const getSourceData = () => {
    const counts = [
      { source: "Reddit", count: 0, fill: "#ff4500" },       // Reddit
      { source: "TrustPilot", count: 0, fill: "#007f4e" },   // TrustPilot
      { source: "App Store", count: 0, fill: "#0d96f6" },    // App Store
      { source: "Play Store", count: 0, fill: "#34a853" },   // Play Store
    ];
  
    results.forEach((r) => {
      const s = r.source?.toLowerCase() || "";
  
      if (s.startsWith("r/")) counts[0].count += 1;
      else if (s.includes("trustpilot")) counts[1].count += 1;
      else if (s.includes("app store")) counts[2].count += 1;
      else if (s.includes("play store")) counts[3].count += 1;
    });
  
    return counts.filter((entry) => entry.count > 0);
  };

  const getExchangeData = () => {
    const counts: Record<string, { exchange: string; count: number; fill: string }> = {};
  
    // Initialize counts from config
    Object.keys(chartConfigExchange).forEach((key) => {
      counts[key] = {
        exchange: chartConfigExchange[key as keyof typeof chartConfigExchange].label,
        count: 0,
        fill: chartConfigExchange[key as keyof typeof chartConfigExchange].color
      };
    });
  
    // Aggregate counts
    results.forEach((r) => {
      r.exchange?.forEach((ex) => {
        const key = ex.toLowerCase().replace(/\W/g, ""); // Normalize
        if (counts[key]) {
          counts[key].count += 1;
        }
      });
    });
  
    return Object.values(counts).filter((entry) => entry.count > 0);
  };

  const getTimeSeriesDataByYear = () => {
    const counts: Record<string, number> = {};
  
    results.forEach((r) => {
      if (!r.date) return;
  
      const year = new Date(r.date).getFullYear().toString();
  
      counts[year] = (counts[year] || 0) + 1;
    });
  
    // Convert to array sorted by year
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };    

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="h-12 w-12 p-0 cursor-pointer"
        >
          <Home className="h-12 w-12" />
        </Button>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search something..."
          className="flex-1 h-12 text-base cursor-text"
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
            <Button className="h-10 px-4 py-2 text-sm flex items-center gap-2 cursor-pointer">
              <ChartColumnDecreasing className="w-4 h-4" /> Plots
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] h-[650px]">
            <DialogHeader><DialogTitle>Plots</DialogTitle></DialogHeader>
            <div className="grid sm:grid-cols-2 gap-x-2 gap-y-1 h-[550px] overflow-y-auto">
              {/* Sentiment Chart */}
              {getSentimentData().length > 0 ? (
                <ChartContainer
                  config={chartConfigSentiment}
                  className="h-[250px] min-w-0 w-full p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      accessibilityLayer
                      data={getSentimentData()}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      barCategoryGap={30}
                    >
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="sentiment" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
                      <YAxis width={30} allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />                
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {getSentimentData().map((entry) => (
                          <Cell
                            key={entry.sentiment}
                            fill={chartConfigSentiment[entry.sentiment.toLowerCase() as keyof typeof chartConfigSentiment].color}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-gray-500 text-sm">No sentiment data to display.</p>
              )}

              {/* Source Chart */}
              {getSourceData().length > 0 ? (
                <ChartContainer
                  config={chartConfigSource}
                  className="h-[250px] min-w-0 w-full p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend
                        iconType="square"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                      <Pie
                        data={getSourceData()}
                        dataKey="count"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        label
                      >
                        {getSourceData().map((entry) => (
                          <Cell key={entry.source} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-gray-500 text-sm">No source data to display.</p>
              )}

              {getExchangeData().length > 0 ? (
                <ChartContainer
                  config={chartConfigExchange}
                  className="h-[250px] min-w-0 w-full p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend iconType="square" layout="horizontal" verticalAlign="bottom" align="center" />
                      <Pie
                        data={getExchangeData()}
                        dataKey="count"
                        nameKey="exchange"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        label
                      >
                        {getExchangeData().map((entry) => (
                          <Cell key={entry.exchange} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-gray-500 text-sm">No exchange data to display.</p>
              )}

              {getTimeSeriesDataByYear().length > 0 ? (
                <ChartContainer
                config={{
                  count: { label: "count", color: "#3b82f6" },
                }}
                className="h-[250px] min-w-0 w-full p-2 bg-white border border-gray-200 rounded-lg"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTimeSeriesDataByYear()}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      width={30}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>                            
              ) : (
                <p className="text-gray-500 text-sm">No timeline data to display.</p>
              )}
            </div>
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
            <Card
              key={doc.id}
              className="bg-white shadow-sm border rounded-md cursor-pointer"
              onClick={() => router.push(`/document/${doc.id}`)}
            >
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up to Card
                        toggleExpand(doc.id);
                      }}
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
                  <>
                    <Badge className="bg-orange-500 text-white font-bold">
                      Reddit Score: {doc.reddit_score}
                    </Badge>
                    <Badge
                      className={`text-white font-bold ${
                        doc.type === "submission"
                          ? "bg-blue-600"
                          : doc.type === "comment"
                          ? "bg-gray-600"
                          : "bg-orange-500"
                      }`}
                    >
                      Type: Reddit {capitalize(doc.type)}
                    </Badge>
                  </>
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
              <div className="flex items-center gap-2 px-4 py-2 border-t mt-2">
                {!feedbackGiven[doc.id] ? (
                  <>
                    <span className="text-sm font-medium">Was this document relevant to your query ?</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={feedbackGiven[doc.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(doc.id, 1);
                      }}
                    >
                      <ThumbsUpIcon className="h-12 w-12" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={feedbackGiven[doc.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(doc.id, -1);
                      }}
                    >
                      <ThumbsDownIcon className="h-12 w-12" />
                    </Button>
                  </>
                ): (
                  <span className="text-sm font-medium flex items-center gap-2 text-green-600">
                    <CircleCheck className="h-5 w-5" />
                    Thank you for your feedback!
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}