"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Save, X, Plus, Settings, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Prompt } from "@/types"

interface Category {
  id: string
  name: string
  label: string
  color: string
  isSystem: boolean
}

// 超级管理员邮箱
const SUPER_ADMIN_EMAIL = "newsunlee007@gmail.com"

export default function EditPromptPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    tags: [] as string[],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (mounted && params.id) {
      fetchPrompt()
      fetchCategories()
    }
  }, [mounted, params.id])

  const fetchPrompt = async () => {
    try {
      const res = await fetch(`/api/prompts/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPrompt(data)
        // 解析标签
        const parsedTags = JSON.parse(data.tags || "[]")
        setFormData({
          title: data.title,
          content: data.content,
          description: data.description || "",
          category: data.category,
          tags: parsedTags,
        })
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching prompt:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 检查权限：作者或超级管理员
  const isAuthor = session?.user?.email === prompt?.author?.email
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL
  const canEdit = isAuthor || isSuperAdmin

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            无权访问
          </h2>
          <p className="text-muted-foreground mb-4">
            只有作者或管理员可以编辑此提示词
          </p>
          <Button onClick={() => router.push(`/prompt/${params.id}`)}>
            返回详情页
          </Button>
        </div>
      </div>
    )
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        })
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/prompts/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push(`/prompt/${params.id}`)
      } else {
        const error = await res.json()
        alert(error.error || "保存失败")
      }
    } catch (error) {
      console.error("Error updating prompt:", error)
      alert("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3">
            <Save className="w-8 h-8" />
            编辑提示词
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin && !isAuthor && (
              <span className="text-yellow-400">管理员模式：正在编辑他人创建的提示词</span>
            )}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="给你的提示词起个名字"
                required
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                分类 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/categories")}
                  className="px-3"
                  title="管理分类"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                标签
                <span className="text-muted-foreground ml-2">
                  (最多5个，回车添加)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="输入标签后按回车"
                maxLength={20}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                使用场景描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="描述这个提示词适合什么场景使用"
                rows={3}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                提示词内容 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="在这里输入你的提示词内容..."
                required
                minLength={10}
                rows={8}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none font-mono text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/prompt/${params.id}`)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    保存修改
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
