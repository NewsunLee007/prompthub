"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Upload,
  Plus,
  X,
  Sparkles,
  Settings,
  FileJson,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

interface Category {
  id: string
  name: string
  label: string
  color: string
  isSystem: boolean
}

interface PromptItem {
  title: string
  content: string
  description?: string
  category: string
  tags?: string[]
}

interface ParsedPrompt extends PromptItem {
  _id: string
  _valid: boolean
  _errors: string[]
  _expanded: boolean
}

const TEMPLATE_JSON: PromptItem[] = [
  {
    title: "专业邮件撰写助手",
    content:
      "你是一位专业的商务邮件撰写专家。请根据以下要求帮我撰写一封专业邮件：\n主题：[邮件主题]\n收件人：[收件人角色/关系]\n目的：[邮件目的]\n关键信息：[需要传达的关键信息]\n\n要求：语气专业但不失友好，结构清晰，简洁有力。",
    description: "适合撰写各类商务邮件，包括合作洽谈、项目汇报、问题沟通等",
    category: "WRITING",
    tags: ["邮件", "商务写作", "专业"],
  },
  {
    title: "代码 Review 助手",
    content:
      "请对以下代码进行 Code Review，从以下几个维度分析：\n1. 代码质量和可读性\n2. 潜在的 Bug 或安全问题\n3. 性能优化建议\n4. 最佳实践遵循情况\n5. 具体改进建议和示例\n\n代码：\n```\n[在此粘贴代码]\n```",
    description: "帮助进行代码审查，提供多维度的分析和改进建议",
    category: "CODING",
    tags: ["代码审查", "编程", "最佳实践"],
  },
]

export default function UploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 单条上传表单
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    tags: [] as string[],
  })

  // 批量上传状态
  const [batchPrompts, setBatchPrompts] = useState<ParsedPrompt[]>([])
  const [batchStatus, setBatchStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle")
  const [batchResult, setBatchResult] = useState<{
    count?: number
    message?: string
    error?: string
    details?: { index: number; error: string }[]
  }>({})
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (mounted) {
      fetchCategories()
    }
  }, [mounted])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // ─────────────── 单条上传逻辑 ───────────────
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (
        formData.tags.length < 5 &&
        !formData.tags.includes(tagInput.trim())
      ) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
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
    setLoading(true)
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push("/")
      } else {
        const error = await res.json()
        alert(error.error || "上传失败")
      }
    } catch (error) {
      console.error("Error uploading prompt:", error)
      alert("上传失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  // ─────────────── 批量上传逻辑 ───────────────

  const validatePrompt = (item: PromptItem, idx: number): ParsedPrompt => {
    const errors: string[] = []
    if (!item.title || item.title.trim().length < 2)
      errors.push("标题不能为空且至少2个字符")
    if (!item.content || item.content.trim().length < 10)
      errors.push("内容不能为空且至少10个字符")
    if (!item.category || item.category.trim().length === 0)
      errors.push("分类不能为空")
    if (item.tags && item.tags.length > 5) errors.push("标签最多5个")
    return {
      ...item,
      _id: `batch-${idx}-${Date.now()}`,
      _valid: errors.length === 0,
      _errors: errors,
      _expanded: errors.length > 0,
    }
  }

  const parseJsonFile = (text: string) => {
    try {
      const data = JSON.parse(text)
      const arr: PromptItem[] = Array.isArray(data) ? data : data.prompts
      if (!Array.isArray(arr)) throw new Error("JSON 格式错误：需要数组或包含 prompts 字段的对象")
      if (arr.length > 100) throw new Error("单次最多上传 100 条，请拆分后分批上传")
      const parsed = arr.map((item, idx) => validatePrompt(item, idx))
      setBatchPrompts(parsed)
      setBatchStatus("idle")
      setBatchResult({})
    } catch (err: any) {
      alert(`解析失败：${err.message}`)
    }
  }

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("请上传 .json 格式的文件")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => parseJsonFile(e.target?.result as string)
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleRemoveBatchItem = (id: string) => {
    setBatchPrompts((prev) => prev.filter((p) => p._id !== id))
  }

  const toggleExpand = (id: string) => {
    setBatchPrompts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, _expanded: !p._expanded } : p))
    )
  }

  const handleBatchSubmit = async () => {
    const validPrompts = batchPrompts.filter((p) => p._valid)
    if (validPrompts.length === 0) {
      alert("没有可上传的有效数据")
      return
    }
    setBatchStatus("uploading")
    try {
      const payload: PromptItem[] = validPrompts.map(
        ({ title, content, description, category, tags }) => ({
          title,
          content,
          description,
          category,
          tags,
        })
      )
      const res = await fetch("/api/prompts/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: payload }),
      })
      const data = await res.json()
      if (res.ok) {
        setBatchStatus("success")
        setBatchResult(data)
        setBatchPrompts([])
      } else {
        setBatchStatus("error")
        setBatchResult(data)
      }
    } catch (err) {
      setBatchStatus("error")
      setBatchResult({ error: "网络错误，请重试" })
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(TEMPLATE_JSON, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prompthub-batch-template.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount = batchPrompts.filter((p) => p._valid).length
  const invalidCount = batchPrompts.filter((p) => !p._valid).length

  // ─────────────── 渲染 ───────────────
  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8" />
            上传提示词
          </h1>
          <p className="text-muted-foreground">
            分享你的 AI 提示词，帮助更多人提升效率
          </p>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 border border-border">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "single"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="w-4 h-4" />
            单条上传
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "batch"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileJson className="w-4 h-4" />
            批量上传
          </button>
        </div>

        {/* ── 单条上传 ── */}
        {activeTab === "single" && (
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
                <p className="text-xs text-muted-foreground mt-1">
                  需要新分类？点击设置按钮去管理分类
                </p>
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
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      上传中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      发布提示词
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── 批量上传 ── */}
        {activeTab === "batch" && (
          <div className="space-y-6">
            {/* 说明卡片 */}
            <div className="bg-card rounded-2xl border border-border p-6 glass">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    JSON 批量上传
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    上传一个 JSON 文件，一次性批量添加多条提示词（最多 100 条）。
                    文件格式为数组，每条包含{" "}
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      title
                    </code>
                    、
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      content
                    </code>
                    、
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      category
                    </code>{" "}
                    等字段。
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="shrink-0 flex items-center gap-2 text-primary border-primary/30 hover:bg-primary/5"
                >
                  <Download className="w-4 h-4" />
                  下载模板
                </Button>
              </div>

              {/* 字段说明 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { field: "title", desc: "标题（必填，2-100字符）", required: true },
                  { field: "content", desc: "提示词内容（必填，≥10字符）", required: true },
                  { field: "category", desc: "分类名（必填，如 WRITING）", required: true },
                  { field: "description", desc: "使用场景描述（可选）", required: false },
                  { field: "tags", desc: "标签数组（可选，最多5个）", required: false },
                ].map((f) => (
                  <div
                    key={f.field}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                  >
                    <code className="text-primary font-mono">{f.field}</code>
                    {f.required && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                    <span className="text-muted-foreground">{f.desc}</span>
                  </div>
                ))}
              </div>

              {/* 分类参考 */}
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">分类参考：</span>
                {categories.map((cat) => (
                  <code
                    key={cat.name}
                    className="ml-2 text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                  >
                    {cat.name}
                  </code>
                ))}
              </div>
            </div>

            {/* 文件上传区域 */}
            {batchPrompts.length === 0 && batchStatus !== "success" && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(file)
                  }}
                />
                <FileJson
                  className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                    isDragOver ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="text-foreground font-medium mb-1">
                  拖拽 JSON 文件到此处，或点击选择文件
                </p>
                <p className="text-muted-foreground text-sm">
                  仅支持 .json 格式，最多 100 条
                </p>
              </div>
            )}

            {/* 上传成功提示 */}
            {batchStatus === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-semibold text-lg">
                  {batchResult.message}
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBatchStatus("idle")
                      setBatchResult({})
                    }}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    继续上传
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                  >
                    查看全部
                  </Button>
                </div>
              </div>
            )}

            {/* 上传错误提示 */}
            {batchStatus === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{batchResult.error}</span>
                </div>
                {batchResult.details && (
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    {batchResult.details.map((d, i) => (
                      <li key={i}>• {d.error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 解析预览列表 */}
            {batchPrompts.length > 0 && (
              <div className="space-y-4">
                {/* 统计栏 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-foreground font-medium">
                      共 {batchPrompts.length} 条
                    </span>
                    {validCount > 0 && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {validCount} 条有效
                      </span>
                    )}
                    {invalidCount > 0 && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {invalidCount} 条有误
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBatchPrompts([])
                        setBatchStatus("idle")
                        setBatchResult({})
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="text-muted-foreground"
                    >
                      清空重选
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBatchSubmit}
                      disabled={batchStatus === "uploading" || validCount === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                    >
                      {batchStatus === "uploading" ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          上传中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          上传 {validCount} 条
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 提示词卡片列表 */}
                <div className="space-y-3">
                  {batchPrompts.map((p, idx) => (
                    <div
                      key={p._id}
                      className={`bg-card rounded-xl border transition-colors ${
                        p._valid
                          ? "border-border"
                          : "border-red-500/40 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        {/* 序号 */}
                        <span className="text-xs text-muted-foreground w-6 text-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* 状态图标 */}
                        {p._valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}

                        {/* 标题和分类 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.title || (
                              <span className="text-muted-foreground italic">
                                无标题
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.category || "无分类"} ·{" "}
                            {p.content?.slice(0, 40)}
                            {(p.content?.length || 0) > 40 ? "..." : ""}
                          </p>
                          {/* 错误信息 */}
                          {!p._valid && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {p._errors.map((err, i) => (
                                <span
                                  key={i}
                                  className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full"
                                >
                                  {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 展开/折叠 */}
                        <button
                          onClick={() => toggleExpand(p._id)}
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title={p._expanded ? "收起" : "展开详情"}
                        >
                          {p._expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {/* 删除 */}
                        <button
                          onClick={() => handleRemoveBatchItem(p._id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                          title="移除此条"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 展开详情 */}
                      {p._expanded && (
                        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-2 text-xs text-muted-foreground">
                          {p.description && (
                            <p>
                              <span className="text-foreground font-medium">描述：</span>
                              {p.description}
                            </p>
                          )}
                          <p>
                            <span className="text-foreground font-medium">内容：</span>
                            <span className="font-mono whitespace-pre-wrap break-words">
                              {p.content}
                            </span>
                          </p>
                          {p.tags && p.tags.length > 0 && (
                            <p>
                              <span className="text-foreground font-medium">标签：</span>
                              {p.tags.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
