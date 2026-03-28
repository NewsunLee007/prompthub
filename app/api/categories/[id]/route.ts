import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id },
    })
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    // 系统分类不能删除
    if (category.isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system category" },
        { status: 403 }
      )
    }
    
    // 检查是否有提示词使用此分类
    const promptsCount = await prisma.prompt.count({
      where: { category: category.name },
    })
    
    if (promptsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing prompts" },
        { status: 400 }
      )
    }
    
    await prisma.category.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
