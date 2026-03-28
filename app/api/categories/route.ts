import { NextResponse } from "next/server"

const categories = [
  { value: "WRITING", label: "写作助手", color: "bg-blue-500" },
  { value: "CODING", label: "代码编程", color: "bg-green-500" },
  { value: "IMAGE", label: "图像生成", color: "bg-purple-500" },
  { value: "LEARNING", label: "学习辅导", color: "bg-yellow-500" },
  { value: "LIFE", label: "生活助手", color: "bg-pink-500" },
  { value: "CREATIVE", label: "创意灵感", color: "bg-orange-500" },
  { value: "BUSINESS", label: "商业分析", color: "bg-cyan-500" },
  { value: "OTHER", label: "其他", color: "bg-gray-500" },
]

export async function GET() {
  return NextResponse.json(categories)
}
