"use client"

import { useState, useEffect } from "react"
import { BarChart2, TrendingUp, Users, Copy, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/ui/Notification"

interface AnalyticsData {
  totalPrompts: number
  totalCopies: number
  totalLikes: number
  totalFavorites: number
  monthlyStats: {
    month: string
    copies: number
    likes: number
  }[]
  topPrompts: {
    id: string
    title: string
    copies: number
    likes: number
  }[]
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // 模拟API调用，实际项目中应该调用真实的分析API
      // const res = await fetch('/api/analytics')
      // const data = await res.json()

      // 模拟数据
      const mockData: AnalyticsData = {
        totalPrompts: 120,
        totalCopies: 580,
        totalLikes: 320,
        totalFavorites: 180,
        monthlyStats: [
          { month: "1月", copies: 80, likes: 45 },
          { month: "2月", copies: 120, likes: 75 },
          { month: "3月", copies: 150, likes: 90 },
          { month: "4月", copies: 130, likes: 65 },
          { month: "5月", copies: 100, likes: 45 },
        ],
        topPrompts: [
          { id: "1", title: "AI写作助手", copies: 120, likes: 80 },
          { id: "2", title: "代码生成器", copies: 95, likes: 65 },
          { id: "3", title: "图像生成提示词", copies: 85, likes: 70 },
          { id: "4", title: "学习助手", copies: 75, likes: 55 },
          { id: "5", title: "创意写作提示", copies: 65, likes: 45 },
        ],
      }

      setAnalytics(mockData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      addNotification({
        type: "error",
        message: "加载分析数据失败，请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold mb-6">使用分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-card rounded-lg p-6 border border-border animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="py-8 text-center">
        <h3 className="text-xl font-semibold mb-4">使用分析</h3>
        <p className="text-muted-foreground">暂无分析数据</p>
      </div>
    )
  }

  return (
    <section className="py-8">
      <h3 className="text-xl font-semibold mb-6">使用分析</h3>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalPrompts}</div>
              <div className="text-sm text-muted-foreground">总提示词</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Copy className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalCopies}</div>
              <div className="text-sm text-muted-foreground">总复制次数</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalLikes}</div>
              <div className="text-sm text-muted-foreground">总点赞数</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.totalFavorites}</div>
              <div className="text-sm text-muted-foreground">总收藏数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 月度统计 */}
      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <h4 className="text-lg font-semibold mb-4">月度统计</h4>
        <div className="space-y-4">
          {analytics.monthlyStats.map((stat, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{stat.month}</span>
                <span className="text-sm font-medium">复制: {stat.copies} | 点赞: {stat.likes}</span>
              </div>
              <div className="flex gap-2">
                <div 
                  className="flex-1 bg-primary/20 rounded-full h-2"
                  style={{ width: `${(stat.copies / Math.max(...analytics.monthlyStats.map(s => s.copies))) * 100}%` }}
                />
                <div 
                  className="flex-1 bg-accent/20 rounded-full h-2"
                  style={{ width: `${(stat.likes / Math.max(...analytics.monthlyStats.map(s => s.likes))) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 热门提示词 */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h4 className="text-lg font-semibold mb-4">热门提示词</h4>
        <div className="space-y-3">
          {analytics.topPrompts.map((prompt, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <span className="font-medium">{prompt.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" />
                  {prompt.copies}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {prompt.likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
