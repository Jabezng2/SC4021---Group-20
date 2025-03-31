// app/page.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tag } from "@/components/ui/tag"

const suggestions = [
  "Binance fees",
  "Coinbase customer service",
  "security issues",
  "slow performance",
  "UI complaints"
]

export default function Home() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return
    const encodedQuery = encodeURIComponent(query.trim())
    router.push(`/search?q=${encodedQuery}`)
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
          className="flex-1 h-12 text-base"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          className="h-12 text-base px-6 cursor-pointer"
          onClick={handleSearch}
          >Search</Button>
      </div>

      {/* Suggested Queries */}
      <div className="mt-6 w-full max-w-xl">
        <h2 className="text-lg font-medium mb-2">Try:</h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <Tag
              key={tag}
              onClick={() => {
                setQuery(tag)
                router.push(`/search?q=${encodeURIComponent(tag)}`)
              }}
              className="cursor-pointer hover:opacity-80 transition"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  )
}