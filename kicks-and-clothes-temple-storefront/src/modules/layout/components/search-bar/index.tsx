"use client"

import { MagnifyingGlassMini, XMark } from "@medusajs/icons"
import { useRouter, useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"

const SearchBar = () => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const params = useParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const countryCode = params.countryCode as string || "gh"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      setQuery("")
    }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="relative flex items-center gap-x-2 min-w-[250px]">
      <form onSubmit={handleSearch} className="flex items-center gap-x-2 w-full">
        <MagnifyingGlassMini className="w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you looking for?"
          className="w-full text-sm border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-black transition-colors placeholder-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMark className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </form>
    </div>
  )
}

export default SearchBar
