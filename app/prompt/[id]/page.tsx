"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Heart,
  Bookmark,
  Copy,
  Eye,
  ArrowLeft,
  Trash2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Prompt } from "@/types"

const categoryLabels: Record<string, string> = {
  WRITING: "写作助手",
  CODING: "代码编程",
  IMAGE: "图像生成",
  LEARNING: "学习辅导",
  LIFE: "生活助手",
  CREATIVE: "创意灵感",
  BUSINESS: "商业分析",
  OTHER: "其他",
}

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [mounted, setMounted] = useState(false)

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && params.id) {
      fetchPrompt()
      checkUserInteractions()
    }
  }, [mounted, params.id])
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const fetchPrompt = async () => {
    try {
      const res = await fetch(`/api/prompts/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPrompt(data)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching prompt:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserInteractions = async () => {
    try {
      const [likesRes, favoritesRes] = await Promise.all([
        fetch("/api/likes"),
        fetch("/api/favorites"),
      ])
      const likesData = await likesRes.json()
      const favoritesData = await favoritesRes.json()

      setIsLiked(likesData.likedPrompts?.includes(params.id as string))
      setIsFavorited(favoritesData.favoritedPrompts?.includes(params.id as string))
    } catch (error) {
      console.error("Error checking interactions:", error)
    }
  }

  const handleCopy = async () => {
    if (!prompt) return

    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)

      await fetch(`/api/prompts/${prompt.id}/copy`, { method: "POST" })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleLike = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: params.id }),
      })
      const data = await res.json()
      setIsLiked(data.liked)
      fetchPrompt()
    } catch (error) {
      console.error("Error liking prompt:", error)
    }
  }

  const handleFavorite = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: params.id }),
      })
      const data = await res.json()
      setIsFavorited(data.favorited)
      fetchPrompt()
    } catch (error) {
      console.error("Error favoriting prompt:", error)
    }
  }

  const handleDelete = async () => {
    if (!prompt || !confirm("确定要删除这个提示词吗？")) return

    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            提示词不存在
          </h2>
          <Link href="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const tags = JSON.parse(prompt.tags || "[]")
  const isAuthor = session?.user?.email === prompt.author.email

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 glass">
          <div className="flex items-start justify-between mb-4">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              {categoryLabels[prompt.category] || "其他"}
            </span>
            <div className="flex items-center gap-2">
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {prompt.title}
          </h1>

          {prompt.description && (
            <p className="text-muted-foreground mb-4">{prompt.description}</p>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {prompt.author.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium text-foreground">
                {prompt.author.name || "匿名用户"}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(prompt.createdAt).toLocaleDateString("zh-CN")}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">提示词内容</h2>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <div className="bg-muted rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {prompt.content}
            </pre>
          </div>
        </div>

        {/* Tags & Stats */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 glass">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">无标签</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="w-5 h-5" />
                <span>{prompt.viewCount} 浏览</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Copy className="w-5 h-5" />
                <span>{prompt.copyCount} 复制</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleLike}
            variant="outline"
            className={`flex-1 gap-2 ${
              isLiked
                ? "border-red-400 text-red-400 hover:bg-red-500/10"
                : ""
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{isLiked ? "已点赞" : "点赞"}</span>
            <span className="ml-1">({prompt._count.likes})</span>
          </Button>

          <Button
            onClick={handleFavorite}
            variant="outline"
            className={`flex-1 gap-2 ${
              isFavorited
                ? "border-yellow-400 text-yellow-400 hover:bg-yellow-500/10"
                : ""
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
            />
            <span>{isFavorited ? "已收藏" : "收藏"}</span>
            <span className="ml-1">({prompt._count.favorites})</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
