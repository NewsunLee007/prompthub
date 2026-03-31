"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Send, Heart as LikeIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/ui/Notification"

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
}

interface CommentSectionProps {
  promptId: string
}

export default function CommentSection({ promptId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchComments()
  }, [promptId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      // 模拟API调用，实际项目中应该调用真实的评论API
      // const res = await fetch(`/api/prompts/${promptId}/comments`)
      // const data = await res.json()
      
      // 模拟数据
      const mockComments: Comment[] = [
        {
          id: "1",
          content: "这个提示词非常有用，帮我生成了高质量的内容！",
          author: {
            name: "用户1"
          },
          createdAt: "2026-03-30T10:00:00Z",
          likes: 5,
          isLiked: false
        },
        {
          id: "2",
          content: "感谢分享，我会试试看这个提示词。",
          author: {
            name: "用户2"
          },
          createdAt: "2026-03-30T11:30:00Z",
          likes: 2,
          isLiked: true
        }
      ]

      setComments(mockComments)
    } catch (error) {
      console.error("Error fetching comments:", error)
      addNotification({
        type: "error",
        message: "加载评论失败，请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      // 模拟API调用，实际项目中应该调用真实的评论API
      // const res = await fetch(`/api/prompts/${promptId}/comments`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ content: newComment }),
      // })
      // const data = await res.json()

      // 模拟新评论
      const newCommentData: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: "当前用户"
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      }

      setComments([newCommentData, ...comments])
      setNewComment("")
      addNotification({
        type: "success",
        message: "评论发布成功"
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      addNotification({
        type: "error",
        message: "发布评论失败，请稍后重试"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      // 模拟API调用，实际项目中应该调用真实的点赞API
      // const res = await fetch(`/api/comments/${commentId}/like`, {
      //   method: "POST"
      // })
      // const data = await res.json()

      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      // 模拟API调用，实际项目中应该调用真实的删除API
      // const res = await fetch(`/api/comments/${commentId}`, {
      //   method: "DELETE"
      // })

      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId))
      addNotification({
        type: "success",
        message: "评论已删除"
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      addNotification({
        type: "error",
        message: "删除评论失败，请稍后重试"
      })
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold mb-4">评论</h3>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-1 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="py-8">
      <h3 className="text-xl font-semibold mb-6">评论 ({comments.length})</h3>

      {/* 评论表单 */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            U
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="分享你的想法..."
              className="w-full p-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none min-h-[100px]"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <Button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                发布评论
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* 评论列表 */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                    {comment.author.name[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{comment.author.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="删除评论"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-3">{comment.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    comment.isLiked
                      ? "text-red-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={comment.isLiked ? "取消点赞" : "点赞"}
                >
                  <LikeIcon
                    className={`w-4 h-4 ${
                      comment.isLiked ? "fill-current" : ""
                    }`}
                  />
                  <span>{comment.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium text-foreground mb-2">暂无评论</h4>
          <p className="text-muted-foreground">成为第一个评论的人吧！</p>
        </div>
      )}
    </section>
  )
}
