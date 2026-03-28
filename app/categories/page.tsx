"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FolderPlus, Trash2, Sparkles, Settings, Pencil, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

interface Category {
  id: string
  name: string
  label: string
  color: string
  isSystem: boolean
  description: string | null
  createdAt: string
}

const colorOptions = [
  { value: "blue", label: "蓝色", class: "bg-blue-500" },
  { value: "green", label: "绿色", class: "bg-green-500" },
  { value: "purple", label: "紫色", class: "bg-purple-500" },
  { value: "yellow", label: "黄色", class: "bg-yellow-500" },
  { value: "pink", label: "粉色", class: "bg-pink-500" },
  { value: "orange", label: "橙色", class: "bg-orange-500" },
  { value: "cyan", label: "青色", class: "bg-cyan-500" },
  { value: "red", label: "红色", class: "bg-red-500" },
  { value: "gray", label: "灰色", class: "bg-gray-500" },
]

export default function CategoriesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    color: "blue",
  })
  const [editForm, setEditForm] = useState({
    label: "",
    description: "",
    color: "blue",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // 并行获取数据，减少等待时间
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", {
        // 添加缓存控制
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted && status === "authenticated") {
      fetchCategories()
    }
  }, [mounted, status, fetchCategories])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.label.trim()) return

    setCreating(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          label: formData.label.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        }),
      })

      if (res.ok) {
        const newCategory = await res.json()
        setCategories([...categories, newCategory])
        setShowForm(false)
        setFormData({ name: "", label: "", description: "", color: "blue" })
      } else {
        const error = await res.json()
        alert(error.error || "创建分类失败")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      alert("创建分类失败")
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditForm({
      label: category.label,
      description: category.description || "",
      color: category.color,
    })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm.label.trim()) {
      alert("分类名称不能为空")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editForm.label.trim(),
          description: editForm.description.trim() || undefined,
          color: editForm.color,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setCategories(categories.map((c) => (c.id === id ? updated : c)))
        setEditingId(null)
      } else {
        const error = await res.json()
        alert(error.error || "更新失败")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      alert("更新失败")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ label: "", description: "", color: "blue" })
  }

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert("系统默认分类不能删除")
      return
    }
    if (!confirm("确定要删除这个分类吗？")) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || "删除失败")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("删除失败")
    }
  }

  // 预渲染骨架屏，减少白屏时间
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background grid-bg">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-64 bg-muted rounded-lg animate-pulse mb-8" />
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            分类管理
          </h1>
          <p className="text-muted-foreground">管理系统分类和自定义分类</p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            {showForm ? "取消创建" : "新建分类"}
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 glass">
            <h3 className="text-lg font-semibold mb-4">新建分类</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    分类标识 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""),
                      })
                    }
                    placeholder="如: MY_CATEGORY"
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">仅限大写字母、数字和下划线</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    分类名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="如: 我的分类"
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="分类描述（可选）"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">颜色</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-lg ${color.class} transition-all ${
                        formData.color === color.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={creating || !formData.name.trim() || !formData.label.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      创建中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      创建分类
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all"
              >
                {editingId === category.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">分类名称</label>
                      <input
                        type="text"
                        value={editForm.label}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">描述</label>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="分类描述"
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">颜色</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, color: color.value })}
                            className={`w-6 h-6 rounded ${color.class} transition-all ${
                              editForm.color === color.value
                                ? "ring-2 ring-white ring-offset-1 ring-offset-background scale-110"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80"
                      >
                        <X className="w-3 h-3" />
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-${category.color}-500/20 flex items-center justify-center`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-${category.color}-500`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{category.label}</h3>
                          <p className="text-xs text-muted-foreground">{category.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="编辑分类"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {!category.isSystem && (
                          <button
                            onClick={() => handleDelete(category.id, category.isSystem)}
                            className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                            title="删除分类"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {category.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          category.isSystem
                            ? "bg-primary/10 text-primary"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {category.isSystem ? "系统" : "自定义"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
