"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "搜索提示词...",
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory')
    return saved ? JSON.parse(saved) : []
  })
  const [suggestions, setSuggestions] = useState<string[]>([
    "AI写作提示词",
    "代码生成",
    "图像生成",
    "学习助手",
    "创意写作"
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(newValue.length > 0)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    addToHistory(suggestion)
    setIsOpen(false)
  }

  const handleHistoryClick = (item: string) => {
    onChange(item)
    setIsOpen(false)
  }

  const addToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const clearInput = () => {
    onChange('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(value.toLowerCase())
  )

  const filteredHistory = searchHistory.filter(item => 
    item.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={containerRef} role="search" aria-label="搜索提示词">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? "search-suggestions" : undefined}
        />
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="清除搜索" 
          >
            <X className="w-full h-full" aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen && (filteredSuggestions.length > 0 || filteredHistory.length > 0) && (
        <div 
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in"
          role="listbox"
          aria-label="搜索建议"
        >
          {filteredHistory.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>搜索历史</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  aria-label="清除搜索历史"
                >
                  清除
                </button>
              </div>
              {filteredHistory.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="py-2 px-3 text-sm hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  role="option"
                  aria-label={`搜索历史: ${item}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {filteredSuggestions.length > 0 && (
            <div className="p-3">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                搜索建议
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="py-2 px-3 text-sm hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  role="option"
                  aria-label={`搜索建议: ${suggestion}`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
