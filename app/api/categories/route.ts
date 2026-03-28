import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// 默认系统分类
const defaultCategories = [
  { name: "WRITING", label: "写作助手", color: "blue", isSystem: true },
  { name: "CODING", label: "代码编程", color: "green", isSystem: true },
  { name: "IMAGE", label: "图像生成", color: "purple", isSystem: true },
  { name: "LEARNING", label: "学习辅导", color: "yellow", isSystem: true },
  { name: "LIFE", label: "生活助手", color: "pink", isSystem: true },
  { name: "CREATIVE", label: "创意灵感", color: "orange", isSystem: true },
  { name: "BUSINESS", label: "商业分析", color: "cyan", isSystem: true },
  { name: "OTHER", label: "其他", color: "gray", isSystem: true },
]

// 初始化系统分类
async function initCategories() {
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }
}

export async function GET() {
  try {
    // 确保系统分类存在
    await initCategories()
    
    // 获取所有分类
    const categories = await prisma.category.findMany({
      orderBy: [
        { isSystem: "desc" },
        { createdAt: "asc" },
      ],
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, label, description, color } = body
    
    if (!name || !label) {
      return NextResponse.json(
        { error: "Name and label are required" },
        { status: 400 }
      )
    }
    
    // 检查是否已存在
    const existing = await prisma.category.findUnique({
      where: { name: name.toUpperCase() },
    })
    
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }
    
    const category = await prisma.category.create({
      data: {
        name: name.toUpperCase(),
        label,
        description,
        color: color || "blue",
        isSystem: false,
      },
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
