"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Flame, Target } from "lucide-react"
import PromptCard from "@/components/PromptCard"
import { Prompt } from "@/types"
import { Button } from "@/components/ui/button"

interface RecommendationSectionProps {
  onLike: (id: string) => void
  onFavorite: (id: string) => void
  onCopy: (content: string, id: string) => void
  likedPrompts: string[]
  favoritedPrompts: string[]
}

export default function RecommendationSection({
  onLike,
  onFavorite,
  onCopy,
  likedPrompts,
  favoritedPrompts,
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<{
    trending: Prompt[]
    popular: Prompt[]
    personalized: Prompt[]
  }>({
    trending: [],
    popular: [],
    personalized: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      // 模拟API调用，实际项目中应该调用真实的推荐API
      // const res = await fetch('/api/recommendations')
      // const data = await res.json()
      
      // 模拟数据
      const mockData = {
        trending: [
          {
            id: "1",
            title: "AI写作助手",
            description: "帮助你快速生成高质量的文章内容",
            content: "作为一名专业的写作助手，我需要你帮助我生成一篇关于人工智能发展趋势的文章。文章应该包括以下几个方面：1. 人工智能的当前发展状况 2. 未来发展趋势 3. 对社会的影响 4. 面临的挑战和机遇。请确保文章结构清晰，内容详实，语言流畅。",
            category: "WRITING",
            tags: JSON.stringify(["写作", "AI", "内容生成"]),
            authorId: "1",
            author: {
              id: "1",
              name: "AI专家",
              image: null,
              email: null
            },
            copyCount: 50,
            _count: {
              likes: 120,
              favorites: 80
            },
            viewCount: 500,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            title: "代码生成器",
            description: "根据需求快速生成高质量的代码",
            content: "作为一名专业的程序员，我需要你帮助我生成一个React组件，该组件是一个带有搜索功能的用户列表。组件应该包括以下功能：1. 搜索输入框 2. 用户列表展示 3. 搜索过滤功能 4. 响应式设计。请使用React Hooks和TypeScript来实现。",
            category: "CODING",
            tags: JSON.stringify(["代码", "React", "TypeScript"]),
            authorId: "2",
            author: {
              id: "2",
              name: "代码大师",
              image: null,
              email: null
            },
            copyCount: 40,
            _count: {
              likes: 95,
              favorites: 65
            },
            viewCount: 420,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        popular: [
          {
            id: "3",
            title: "图像生成提示词",
            description: "生成高质量的AI图像",
            content: "请生成一张未来城市的科幻风格图像，要求：1. 高楼大厦鳞次栉比 2. 飞行汽车在空中穿梭 3. 霓虹灯闪烁 4. 雨天效果 5. 赛博朋克风格。请确保图像细节丰富，色彩鲜明，构图合理。",
            category: "IMAGE",
            tags: JSON.stringify(["图像生成", "科幻", "赛博朋克"]),
            authorId: "3",
            author: {
              id: "3",
              name: "图像艺术家",
              image: null,
              email: null
            },
            copyCount: 60,
            _count: {
              likes: 150,
              favorites: 100
            },
            viewCount: 600,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "4",
            title: "学习助手",
            description: "帮助你高效学习和记忆",
            content: "作为一名学习助手，我需要你帮助我制定一个学习计划，用于准备机器学习考试。计划应该包括：1. 学习内容的优先级 2. 每天的学习时间安排 3. 复习策略 4. 考试准备技巧。请确保计划合理可行，适合一个月的备考时间。",
            category: "LEARNING",
            tags: JSON.stringify(["学习", "教育", "机器学习"]),
            authorId: "4",
            author: {
              id: "4",
              name: "学习专家",
              image: null,
              email: null
            },
            copyCount: 35,
            _count: {
              likes: 85,
              favorites: 70
            },
            viewCount: 380,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        personalized: [
          {
            id: "5",
            title: "创意写作提示",
            description: "激发你的写作灵感",
            content: "作为一名创意写作教练，我需要你为我提供10个创意写作的主题，每个主题都应该包含：1. 主题名称 2. 简短的背景描述 3. 写作方向建议。主题应该涵盖不同的 genres，包括科幻、奇幻、悬疑、浪漫等。",
            category: "WRITING",
            tags: JSON.stringify(["创意写作", "灵感", "写作主题"]),
            authorId: "5",
            author: {
              id: "5",
              name: "作家",
              image: null,
              email: null
            },
            copyCount: 25,
            _count: {
              likes: 75,
              favorites: 55
            },
            viewCount: 320,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }

      setRecommendations(mockData)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">推荐提示词</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="py-12">
      {/* 热门提示词 */}
      {recommendations.popular.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">热门提示词</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.popular.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isLiked={likedPrompts.includes(prompt.id)}
                isFavorited={favoritedPrompts.includes(prompt.id)}
                onLike={onLike}
                onFavorite={onFavorite}
                onCopy={onCopy}
              />
            ))}
          </div>
        </div>
      )}

      {/* 趋势提示词 */}
      {recommendations.trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">趋势提示词</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.trending.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isLiked={likedPrompts.includes(prompt.id)}
                isFavorited={favoritedPrompts.includes(prompt.id)}
                onLike={onLike}
                onFavorite={onFavorite}
                onCopy={onCopy}
              />
            ))}
          </div>
        </div>
      )}

      {/* 个性化推荐 */}
      {recommendations.personalized.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">为你推荐</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.personalized.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isLiked={likedPrompts.includes(prompt.id)}
                isFavorited={favoritedPrompts.includes(prompt.id)}
                onLike={onLike}
                onFavorite={onFavorite}
                onCopy={onCopy}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
