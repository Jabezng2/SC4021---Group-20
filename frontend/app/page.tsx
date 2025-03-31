// app/page.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Home() {
  const [query, setQuery] = useState("")

  const handleSearch = () => {
    if (!query.trim()) return
    // You can replace this with navigation or API call
    alert(`Searching for: ${query}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-6">Cryptopinion Search</h1>

      <div className="w-full max-w-xl flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search for crypto exchanges, coins, sentiment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Optional: Recent searches, suggested tags, etc */}
    </div>
  )
}