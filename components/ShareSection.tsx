"use client"

import { useState } from "react"
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/ui/Notification"

interface ShareSectionProps {
  promptId: string
  promptTitle: string
}

export default function ShareSection({ promptId, promptTitle }: ShareSectionProps) {
  const [copied, setCopied] = useState(false)
  const { addNotification } = useNotification()

  const shareUrl = `${window.location.origin}/prompt/${promptId}`
  const shareText = `查看这个有用的 AI 提示词: ${promptTitle}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      addNotification({
        type: "success",
        message: "链接已复制到剪贴板"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying link:", error)
      addNotification({
        type: "error",
        message: "复制链接失败，请稍后重试"
      })
    }
  }

  const handleShare = (platform: string) => {
    let url = ""
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      default:
        return
    }

    window.open(url, "_blank", "width=600,height=400")
  }

  return (
    <section className="py-6">
      <h3 className="text-lg font-semibold mb-4">分享</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="flex items-center gap-2"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin")}
          className="flex items-center gap-2"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "已复制" : "复制链接"}
        </Button>
      </div>
    </section>
  )
}
