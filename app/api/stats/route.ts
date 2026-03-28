import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 获取提示词总数
    const totalPrompts = await prisma.prompt.count()
    
    // 获取分类数量
    const categories = await prisma.prompt.groupBy({
      by: ['category'],
    })
    const totalCategories = categories.length
    
    // 获取总复制次数（月复用）
    const copyStats = await prisma.prompt.aggregate({
      _sum: {
        copyCount: true,
      },
    })
    const monthlyCopies = copyStats._sum.copyCount || 0
    
    // 获取总点赞数
    const totalLikes = await prisma.like.count()
    
    // 获取总收藏数
    const totalFavorites = await prisma.favorite.count()
    
    // 获取用户总数
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      totalPrompts,
      totalCategories,
      monthlyCopies,
      totalLikes,
      totalFavorites,
      totalUsers,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
