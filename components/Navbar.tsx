"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Plus, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function Navbar() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Prevent hydration mismatch during build
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden glow-blue group-hover:glow-purple transition-all duration-300">
                <Image 
                  src="/logo.png" 
                  alt="PromptHub Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold gradient-text">PromptHub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <User className="w-4 h-4 mr-2" />
                登录
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border" aria-label="主导航">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="返回首页">
            <div className="w-8 h-8 rounded-lg overflow-hidden glow-blue group-hover:glow-purple transition-all duration-300">
              <Image 
                src="/logo.png" 
                alt="PromptHub Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-cover"
                loading="lazy"
                priority={false}
              />
            </div>
            <span className="text-xl font-bold gradient-text">PromptHub</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/upload" aria-label="上传提示词">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    上传提示词
                  </Button>
                </Link>

                <div className="flex items-center gap-2" role="group" aria-label="用户操作">
                  <Link href="/categories" aria-label="分类管理">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  
                  <Link href="/profile" aria-label="用户资料">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      {session.user?.name || "用户"}
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-muted-foreground hover:text-red-400"
                    aria-label="登出"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/login" aria-label="登录">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
