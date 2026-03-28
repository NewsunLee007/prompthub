import type { Metadata } from "next"
import { Inter } from "next/font/google"
import SessionProvider from "@/components/SessionProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PromptHub - AI 提示词共享平台",
  description: "发现、分享、复用 AI 提示词，提升你的工作效率",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
