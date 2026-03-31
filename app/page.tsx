"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Zap } from "lucide-react"
import Navbar from "@/components/Navbar"
import { useNotification } from "@/components/ui/Notification"
import { Prompt, Category } from "@/types"
import { Button } from "@/components/ui/button"

// 懒加载组件
import dynamic from 'next/dynamic'
const PromptCard = dynamic(() => import('@/components/PromptCard'), { ssr: false })
const CategoryFilter = dynamic(() => import('@/components/CategoryFilter'), { ssr: false })
const SearchBar = dynamic(() => import('@/components/SearchBar'), { ssr: false })
const RecommendationSection = dynamic(() => import('@/components/RecommendationSection'), { ssr: false })

interface Stats {
  totalPrompts: number
  totalCategories: number
  monthlyCopies: number
  totalLikes: number
  totalFavorites: number
  totalUsers: number
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["ALL"])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [likedPrompts, setLikedPrompts] = useState<string[]>([])
  const [favoritedPrompts, setFavoritedPrompts] = useState<string[]>([])
  const { addNotification } = useNotification()
  const [stats, setStats] = useState<Stats>({
    totalPrompts: 0,
    totalCategories: 8,
    monthlyCopies: 0,
    totalLikes: 0,
    totalFavorites: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    fetchCategories()
    fetchLikedPrompts()
    fetchFavoritedPrompts()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [selectedCategories, searchQuery, page])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) {
        console.error("Categories API error:", res.status)
        setCategories([])
        return
      }
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (!selectedCategories.includes("ALL")) {
        selectedCategories.forEach(category => {
          params.append("categories", category)
        })
      }
      if (searchQuery) params.append("search", searchQuery)
      params.append("page", page.toString())
      params.append("limit", "12")

      const res = await fetch(`/api/prompts?${params}`)
      if (!res.ok) {
        console.error("API error:", res.status, res.statusText)
        setPrompts([])
        setTotalPages(1)
        return
      }
      const data = await res.json()
      setPrompts(data.prompts || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching prompts:", error)
      setPrompts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPrompts = async () => {
    try {
      const res = await fetch("/api/likes")
      if (!res.ok) {
        setLikedPrompts([])
        return
      }
      const data = await res.json()
      setLikedPrompts(data.likedPrompts || [])
    } catch (error) {
      console.error("Error fetching likes:", error)
      setLikedPrompts([])
    }
  }

  const fetchFavoritedPrompts = async () => {
    try {
      const res = await fetch("/api/favorites")
      if (!res.ok) {
        setFavoritedPrompts([])
        return
      }
      const data = await res.json()
      setFavoritedPrompts(data.favoritedPrompts || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
      setFavoritedPrompts([])
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
        addNotification({
          type: "success",
          message: "已点赞此提示词"
        })
      } else {
        setLikedPrompts(likedPrompts.filter((pid) => pid !== id))
        addNotification({
          type: "info",
          message: "已取消点赞"
        })
      }
      
      // 局部更新：只更新当前卡片的点赞数，不刷新整个列表
      setPrompts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            _count: {
              ...p._count,
              likes: data.likesCount
            }
          }
        }
        return p
      }))
    } catch (error) {
      console.error("Error liking prompt:", error)
      addNotification({
        type: "error",
        message: "操作失败，请稍后重试"
      })
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
        addNotification({
          type: "success",
          message: "已收藏此提示词"
        })
      } else {
        setFavoritedPrompts(favoritedPrompts.filter((pid) => pid !== id))
        addNotification({
          type: "info",
          message: "已取消收藏"
        })
      }
      
      // 局部更新：只更新当前卡片的收藏数，不刷新整个列表
      setPrompts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            _count: {
              ...p._count,
              favorites: data.favoritesCount
            }
          }
        }
        return p
      }))
    } catch (error) {
      console.error("Error favoriting prompt:", error)
      addNotification({
        type: "error",
        message: "操作失败，请稍后重试"
      })
    }
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      await fetch(`/api/prompts/${id}/copy`, { method: "POST" })
      fetchPrompts()
      addNotification({
        type: "success",
        message: "提示词已复制到剪贴板"
      })
    } catch (error) {
      console.error("Error copying prompt:", error)
      addNotification({
        type: "error",
        message: "复制失败，请稍后重试"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>发现、分享、复用 AI 提示词</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
            <span className="gradient-text">PromptHub</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            探索社区精选的 AI 提示词，提升你的工作效率。上传你的提示词，与他人分享你的创意。
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">{stats.totalPrompts}+</div>
                <div className="text-sm text-muted-foreground">提示词</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <TrendingUp className="w-7 h-7 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">{stats.monthlyCopies}+</div>
                <div className="text-sm text-muted-foreground">月复用</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">{stats.totalCategories}</div>
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
            selected={selectedCategories}
            onSelect={(categories) => {
              setSelectedCategories(categories)
              setPage(1)
            }}
          />
        </div>

        {/* Recommendation Section */}
        <RecommendationSection
          onLike={handleLike}
          onFavorite={handleFavorite}
          onCopy={handleCopy}
          likedPrompts={likedPrompts}
          favoritedPrompts={favoritedPrompts}
        />

        {/* Prompts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-card rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
