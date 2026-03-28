"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, FileText, Heart, Bookmark, Sparkles } from "lucide-react"
import Navbar from "@/components/Navbar"
import PromptCard from "@/components/PromptCard"
import { Prompt } from "@/types"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"uploads" | "favorites" | "likes">(
    "uploads"
  )
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    uploads: 0,
    likes: 0,
    favorites: 0,
  })

  // Prevent static generation - always render on client
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  useEffect(() => {
    if (session) {
      fetchUserPrompts()
      fetchStats()
    }
  }, [session, activeTab])

  const fetchUserPrompts = async () => {
    setLoading(true)
    try {
      let endpoint = "/api/prompts"
      if (activeTab === "favorites") {
        endpoint = "/api/favorites"
      } else if (activeTab === "likes") {
        endpoint = "/api/likes"
      }

      const res = await fetch(endpoint)
      const data = await res.json()

      if (activeTab === "uploads") {
        setPrompts(data.prompts || [])
      } else {
        // For favorites and likes, we need to fetch the actual prompt details
        const promptIds =
          activeTab === "favorites"
            ? data.favoritedPrompts || []
            : data.likedPrompts || []

        if (promptIds.length > 0) {
          const promptPromises = promptIds.map((id: string) =>
            fetch(`/api/prompts/${id}`).then((r) => r.json())
          )
          const promptData = await Promise.all(promptPromises)
          setPrompts(promptData.filter((p) => p.id))
        } else {
          setPrompts([])
        }
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [promptsRes, likesRes, favoritesRes] = await Promise.all([
        fetch("/api/prompts"),
        fetch("/api/likes"),
        fetch("/api/favorites"),
      ])

      const promptsData = await promptsRes.json()
      const likesData = await likesRes.json()
      const favoritesData = await favoritesRes.json()

      setStats({
        uploads: promptsData.pagination?.total || 0,
        likes: likesData.likedPrompts?.length || 0,
        favorites: favoritesData.favoritedPrompts?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8 glass">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold glow-blue">
              {session?.user?.name?.[0]?.toUpperCase() ||
                session?.user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {session?.user?.name || "用户"}
              </h1>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {stats.uploads}
              </div>
              <div className="text-sm text-muted-foreground">上传</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {stats.likes}
              </div>
              <div className="text-sm text-muted-foreground">点赞</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {stats.favorites}
              </div>
              <div className="text-sm text-muted-foreground">收藏</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "uploads"
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <FileText className="w-4 h-4" />
            我的上传
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "favorites"
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            我的收藏
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "likes"
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Heart className="w-4 h-4" />
            我的点赞
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-card rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {activeTab === "uploads" && "还没有上传过提示词"}
              {activeTab === "favorites" && "还没有收藏任何提示词"}
              {activeTab === "likes" && "还没有点赞过提示词"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "uploads" && "去上传你的第一个提示词吧！"}
              {activeTab === "favorites" && "浏览提示词广场，收藏你喜欢的"}
              {activeTab === "likes" && "为你喜欢的提示词点赞"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
