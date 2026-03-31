"use client"

import { useState } from "react"
import { Checkbox, Check, Trash2, Tag, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/ui/Notification"
import { Prompt } from "@/types"

interface BatchManagementProps {
  prompts: Prompt[]
  onRefresh: () => void
}

export default function BatchManagement({ prompts, onRefresh }: BatchManagementProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const { addNotification } = useNotification()

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPrompts(prev => {
      if (prev.includes(promptId)) {
        return prev.filter(id => id !== promptId)
      } else {
        return [...prev, promptId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPrompts([])
    } else {
      setSelectedPrompts(prompts.map(prompt => prompt.id))
    }
    setSelectAll(!selectAll)
  }

  const handleBatchDelete = async () => {
    if (selectedPrompts.length === 0) {
      addNotification({
        type: "info",
        message: "请先选择要删除的提示词"
      })
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedPrompts.length} 个提示词吗？`)) {
      return
    }

    try {
      // 模拟API调用，实际项目中应该调用真实的批量删除API
      // const res = await fetch('/api/prompts/batch', {
      //   method: "DELETE",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ promptIds: selectedPrompts }),
      // })

      // 模拟成功响应
      setTimeout(() => {
        addNotification({
          type: "success",
          message: `成功删除 ${selectedPrompts.length} 个提示词`
        })
        setSelectedPrompts([])
        setSelectAll(false)
        onRefresh()
      }, 500)
    } catch (error) {
      console.error("Error deleting prompts:", error)
      addNotification({
        type: "error",
        message: "批量删除失败，请稍后重试"
      })
    }
  }

  const handleBatchCategory = () => {
    if (selectedPrompts.length === 0) {
      addNotification({
        type: "info",
        message: "请先选择要分类的提示词"
      })
      return
    }

    // 这里可以打开一个模态框让用户选择分类
    addNotification({
      type: "info",
      message: "分类功能开发中"
    })
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">批量管理</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="w-5 h-5"
            />
            <span className="text-sm">全选</span>
          </label>
        </div>
      </div>

      {selectedPrompts.length > 0 && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">已选择 {selectedPrompts.length} 个提示词</span>
            <button
              onClick={() => setSelectedPrompts([])}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              清除选择
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              批量删除
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchCategory}
              className="flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              批量分类
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="relative">
            <div 
              className="absolute top-4 left-4 z-10 w-5 h-5 rounded border border-border bg-background flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelectPrompt(prompt.id)}
            >
              {selectedPrompts.includes(prompt.id) && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className={`opacity-${selectedPrompts.includes(prompt.id) ? 70 : 100} transition-opacity`}>
              {/* 这里可以复用 PromptCard 组件，或者使用简化版 */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-lg font-semibold text-foreground mb-2">{prompt.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{prompt.category}</span>
                  <span className="text-xs text-muted-foreground">{prompt._count.likes} 点赞</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CheckboxProps {
  checked: boolean
  onCheckedChange: () => void
  className?: string
}

function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onCheckedChange}
      className={`w-5 h-5 rounded border border-border flex items-center justify-center transition-colors ${className}`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="w-4 h-4 text-primary" />}
    </button>
  )
}
