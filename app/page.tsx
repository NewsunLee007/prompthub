"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Zap } from "lucide-react"
import Navbar from "@/components/Navbar"
import PromptCard from "@/components/PromptCard"
import CategoryFilter from "@/components/CategoryFilter"
import SearchBar from "@/components/SearchBar"
import { Prompt, Category } from "@/types"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [likedPrompts, setLikedPrompts] = useState<string[]>([])
  const [favoritedPrompts, setFavoritedPrompts] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
    fetchLikedPrompts()
    fetchFavoritedPrompts()
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [selectedCategory, searchQuery, page])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "ALL") params.append("category", selectedCategory)
      if (searchQuery) params.append("search", searchQuery)
      params.append("page", page.toString())
      params.append("limit", "12")

      const res = await fetch(`/api/prompts?${params}`)
      const data = await res.json()
      setPrompts(data.prompts)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPrompts = async () => {
    try {
      const res = await fetch("/api/likes")
      const data = await res.json()
      setLikedPrompts(data.likedPrompts || [])
    } catch (error) {
      console.error("Error fetching likes:", error)
    }
  }

  const fetchFavoritedPrompts = async () => {
    try {
      const res = await fetch("/api/favorites")
      const data = await res.json()
      setFavoritedPrompts(data.favoritedPrompts || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }

  const handleLike = async (id: string) => {
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: id }),
      })
      const data = await res.json()
      
      if (data.liked) {
        setLikedPrompts([...likedPrompts, id])
      } else {
        setLikedPrompts(likedPrompts.filter((pid) => pid !== id))
      }
      fetchPrompts()
    } catch (error) {
      console.error("Error liking prompt:", error)
    }
  }

  const handleFavorite = async (id: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: id }),
      })
      const data = await res.json()
      
      if (data.favorited) {
        setFavoritedPrompts([...favoritedPrompts, id])
      } else {
        setFavoritedPrompts(favoritedPrompts.filter((pid) => pid !== id))
      }
      fetchPrompts()
    } catch (error) {
      console.error("Error favoriting prompt:", error)
    }
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await fetch(`/api/prompts/${id}/copy`, { method: "POST" })
      fetchPrompts()
    } catch (error) {
      console.error("Error copying prompt:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>发现、分享、复用 AI 提示词</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">PromptHub</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            探索社区精选的 AI 提示词，提升你的工作效率。上传你的提示词，与他人分享你的创意。
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">提示词</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">5000+</div>
                <div className="text-sm text-muted-foreground">月复用</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">8</div>
                <div className="text-sm text-muted-foreground">分类</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value)
              setPage(1)
            }}
          />
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category)
              setPage(1)
            }}
          />
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-card rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  isLiked={likedPrompts.includes(prompt.id)}
                  isFavorited={favoritedPrompts.includes(prompt.id)}
                  onLike={handleLike}
                  onFavorite={handleFavorite}
                  onCopy={handleCopy}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  第 {page} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              暂无提示词
            </h3>
            <p className="text-muted-foreground">
              成为第一个分享提示词的人吧！
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
