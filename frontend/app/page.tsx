"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const suggestions: Record<string, string> = {
  // Adding the &feature filters the fees feature by sentiment i.e above 0.5
  // This means that some sentiments if value is sub 0.5 will not appear.
  // This is a sentiment relevance filtering
  "Binance fees": "q=binance+fees&feature=fees",
  "Coinbase customer service": "q=coinbase+customer+service&feature=customer_service", // Needs investigation (&feature)
  "security issues": "q=security+issues&feature=security",
  "degraded performance": "q=degraded+performance&feature=performance", // Needs investigation (&feature)
  "user interface": "q=user+interface&feature=user_interface",
}

const exchangeOptions = [
  "Binance",
  "Coinbase",
  "Kraken",
  "OKX",
  "Kucoin",
  "Crypto.com",
  "Bybit",
]

export default function Home() {
  const [query, setQuery] = useState("")
  const [sentiment, setSentiment] = useState("")
  const [source, setSource] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [type, setType] = useState("")
  const [feature, setFeature] = useState("")
  const [exchanges, setExchanges] = useState<string[]>([])

  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return

    const params = new URLSearchParams({ q: query.trim() })
    if (sentiment) params.set("sentiment", sentiment)
    if (source) params.set("source", source)
    if (startDate && endDate) {
      params.set("start_date", format(startDate, "yyyy-MM-dd"))
      params.set("end_date", format(endDate, "yyyy-MM-dd"))
    }
    if (type) params.set("type", type)
    if (exchanges.length > 0) {
      params.set("exchange", exchanges.join("+"))
    }
    if (feature) params.set("feature", feature)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-6">Cryptopinion Search</h1>

      <div className="w-full max-w-xl flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search for exchanges, coins, or sentiment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-12 text-base cursor-text"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 px-4">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="p-4 w-[600px] grid grid-cols-2 gap-4">
            <div>
              <DropdownMenuLabel>Sentiment</DropdownMenuLabel>
              <Select value={sentiment} onValueChange={setSentiment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <DropdownMenuLabel>Source</DropdownMenuLabel>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="trustpilot">TrustPilot</SelectItem>
                  <SelectItem value="app store">App Store</SelectItem>
                  <SelectItem value="play store">Play Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              <div className="flex flex-col gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (!date) return
                        if (!endDate || date <= endDate) setStartDate(date)
                      }}                                            
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "PPP")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (!date) return
                        if (!startDate || date >= startDate) setEndDate(date)
                      }}                      
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <DropdownMenuLabel>Reddit Type</DropdownMenuLabel>
              <Select
                value={type}
                onValueChange={setType}
                disabled={source !== "" && source !== "reddit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission">Reddit Submission</SelectItem>
                  <SelectItem value="comment">Reddit Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <DropdownMenuLabel>Exchanges</DropdownMenuLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {exchanges.length > 0 ? `${exchanges.length} selected` : "Select exchanges"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 max-h-64 overflow-y-auto p-2">
                  <div className="grid gap-2">
                    {exchangeOptions.map((exchange) => {
                      const value = exchange.toLowerCase().replace(/\W/g, "")
                      return (
                        <label key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={value}
                            checked={exchanges.includes(value)}
                            onCheckedChange={(checked) => {
                              setExchanges((prev) =>
                                checked
                                  ? [...prev, value]
                                  : prev.filter((ex) => ex !== value)
                              )
                            }}
                          />
                          <span className="text-sm">{exchange}</span>
                        </label>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <DropdownMenuLabel>Features</DropdownMenuLabel>
              <Select
                value={feature}
                onValueChange={setFeature}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fees">Exchange Fees</SelectItem>
                  <SelectItem value="user_interface">User Interface</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="coin_listings">Coin Listings</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="h-12 text-base px-6 cursor-pointer"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      <div className="mt-6 w-full max-w-xl">
        <h2 className="text-lg font-medium mb-2">Try:</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(suggestions).map(([label, queryString]) => (
            <Tag
              key={label}
              onClick={() => router.push(`/search?${queryString}`)}
              className="cursor-pointer hover:opacity-80 transition"
            >
              {label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  )
}