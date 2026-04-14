"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Search, MapPin, Loader2, X } from "lucide-react"

// Custom debounce hook - avoids need for external use-debounce package
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

export interface AddressData {
  fullAddress: string
  addressLine1: string
  addressLine2: string
  city: string
  county: string
  postcode: string
  country: string
}

interface AddressAutocompleteProps {
  value?: AddressData | null
  onChange: (address: AddressData | null) => void
  onPostcodeChange?: (postcode: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  className?: string
  dark?: boolean
}

interface AddressSuggestion {
  id: string
  address: string
  description: string
}

// UK Postcode lookup using api.postcodes.io (free, no API key required)
async function searchPostcodes(query: string): Promise<AddressSuggestion[]> {
  if (!query || query.length < 2) return []
  
  try {
    // Try to detect if it's a postcode pattern
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i
    const partialPostcodePattern = /^[A-Z]{1,2}[0-9]/i
    
    if (postcodePattern.test(query.trim()) || partialPostcodePattern.test(query.trim())) {
      // Search for postcodes
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(query.trim())}/autocomplete`
      )
      
      if (!response.ok) {
        // Try validate endpoint for exact matches
        const validateResponse = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(query.trim())}/validate`
        )
        const validateData = await validateResponse.json()
        
        if (validateData.result === true) {
          const lookupResponse = await fetch(
            `https://api.postcodes.io/postcodes/${encodeURIComponent(query.trim())}`
          )
          const lookupData = await lookupResponse.json()
          
          if (lookupData.result) {
            const r = lookupData.result
            return [{
              id: r.postcode,
              address: r.postcode,
              description: `${r.admin_ward || ""}, ${r.admin_district || ""}, ${r.region || ""}`.replace(/^, |, $/g, "")
            }]
          }
        }
        return []
      }
      
      const data = await response.json()
      
      if (data.result && Array.isArray(data.result)) {
        // Get details for each postcode
        const suggestions = await Promise.all(
          data.result.slice(0, 6).map(async (postcode: string) => {
            try {
              const detailResponse = await fetch(
                `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
              )
              const detailData = await detailResponse.json()
              
              if (detailData.result) {
                const r = detailData.result
                return {
                  id: r.postcode,
                  address: r.postcode,
                  description: `${r.admin_ward || ""}, ${r.admin_district || ""}, ${r.region || ""}`.replace(/^, |, $/g, "")
                }
              }
              return {
                id: postcode,
                address: postcode,
                description: ""
              }
            } catch {
              return {
                id: postcode,
                address: postcode,
                description: ""
              }
            }
          })
        )
        return suggestions
      }
    }
    
    // For non-postcode queries, search by outcode (first part of postcode)
    const response = await fetch(
      `https://api.postcodes.io/outcodes/${encodeURIComponent(query.trim().split(" ")[0])}`
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data.result) {
        const r = data.result
        return [{
          id: r.outcode,
          address: r.outcode,
          description: `${r.admin_district?.[0] || ""}, ${r.admin_county?.[0] || r.region?.[0] || ""}`.replace(/^, |, $/g, "")
        }]
      }
    }
    
    return []
  } catch (error) {
    console.error("Postcode search error:", error)
    return []
  }
}

// Lookup full postcode details
async function lookupPostcode(postcode: string): Promise<AddressData | null> {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.result) {
      const r = data.result
      return {
        fullAddress: `${r.admin_ward || ""}, ${r.admin_district || ""}, ${r.postcode}`.replace(/^, /, ""),
        addressLine1: "",
        addressLine2: r.admin_ward || "",
        city: r.admin_district || r.parish || "",
        county: r.admin_county || r.region || "",
        postcode: r.postcode,
        country: r.country || "England",
      }
    }
    
    return null
  } catch {
    return null
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onPostcodeChange,
  placeholder = "Start typing postcode or address...",
  dark = false,
  error,
  disabled,
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value?.postcode || "")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const results = await searchPostcodes(query)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setHighlightedIndex(-1)
    } catch {
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    onPostcodeChange?.(newValue)
    debouncedSearch(newValue)
  }

  const handleSelectSuggestion = useCallback(async (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.address)
    setIsOpen(false)
    setSuggestions([])
    
    // Lookup full details
    const addressData = await lookupPostcode(suggestion.address)
    if (addressData) {
      onChange(addressData)
      onPostcodeChange?.(addressData.postcode)
    } else {
      // Create minimal address data from suggestion
      onChange({
        fullAddress: suggestion.address,
        addressLine1: "",
        addressLine2: "",
        city: suggestion.description.split(",")[0]?.trim() || "",
        county: suggestion.description.split(",")[1]?.trim() || "",
        postcode: suggestion.address,
        country: "England",
      })
      onPostcodeChange?.(suggestion.address)
    }
  }, [onChange, onPostcodeChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleClear = () => {
    setInputValue("")
    onChange(null)
    onPostcodeChange?.("")
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      highlightedElement?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightedIndex])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={cn(
            dark
              ? "w-full h-14 pl-5 pr-10 rounded-2xl border-2 bg-white/10 border-white/20 text-white text-base focus:outline-none focus:border-white/60 transition-all placeholder:text-white/30"
              : cn(
                  "w-full h-12 pl-4 pr-10 rounded-xl border bg-background text-foreground text-base",
                  "placeholder:text-muted-foreground transition-all duration-200",
                  "border-input focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground",
                  error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
                  disabled && "opacity-50 cursor-not-allowed bg-muted"
                )
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 w-full mt-2 py-2 bg-popover border border-border rounded-xl shadow-lg",
            "max-h-64 overflow-y-auto",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={highlightedIndex === index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                highlightedIndex === index
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              )}
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {suggestion.address}
                </p>
                {suggestion.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
