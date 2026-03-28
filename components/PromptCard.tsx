"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Bookmark, Copy, Eye } from "lucide-react"
import { Prompt } from "@/types"

interface PromptCardProps {
  prompt: Prompt
  isLiked?: boolean
  isFavorited?: boolean
  onLike?: (id: string) => void
  onFavorite?: (id: string) => void
  onCopy?: (content: string, id: string) => void
}

const categoryColors: Record<string, string> = {
  WRITING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CODING: "bg-green-500/20 text-green-400 border-green-500/30",
  IMAGE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LEARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LIFE: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  CREATIVE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  BUSINESS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

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

export default function PromptCard({
  prompt,
  isLiked = false,
  isFavorited = false,
  onLike,
  onFavorite,
  onCopy,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      onCopy?.(prompt.content, prompt.id)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const tags = JSON.parse(prompt.tags || "[]")

  return (
    <div className="group relative bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:glow-blue overflow-hidden">
      <Link href={`/prompt/${prompt.id}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
              categoryColors[prompt.category] || categoryColors.OTHER
            }`}
          >
            {categoryLabels[prompt.category] || "其他"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "已复制" : "复制"}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>

        {/* Description */}
        {prompt.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {prompt.description}
          </p>
        )}

        {/* Content Preview */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
            {prompt.content}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
              {prompt.author.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm text-muted-foreground">
              {prompt.author.name || "匿名用户"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike?.(prompt.id)
              }}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked
                  ? "text-red-400"
                  : "text-muted-foreground hover:text-red-400"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
              />
              <span>{prompt._count.likes}</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onFavorite?.(prompt.id)
              }}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isFavorited
                  ? "text-yellow-400"
                  : "text-muted-foreground hover:text-yellow-400"
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
              />
              <span>{prompt._count.favorites}</span>
            </button>

            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{prompt.viewCount}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
