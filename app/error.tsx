"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          页面加载出错
        </h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "Something went wrong!"}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
