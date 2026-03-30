import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface PromptItem {
  title: string
  content: string
  description?: string
  category: string
  tags?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prompts } = body as { prompts: PromptItem[] }

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: "请提供提示词数组" }, { status: 400 })
    }

    if (prompts.length > 100) {
      return NextResponse.json({ error: "单次最多批量上传 100 条" }, { status: 400 })
    }

    // 校验每条数据
    const errors: { index: number; error: string }[] = []
    prompts.forEach((item, idx) => {
      if (!item.title || item.title.trim().length < 2) {
        errors.push({ index: idx + 1, error: `第 ${idx + 1} 条：标题不能为空且至少2个字符` })
      }
      if (!item.content || item.content.trim().length < 10) {
        errors.push({ index: idx + 1, error: `第 ${idx + 1} 条：内容不能为空且至少10个字符` })
      }
      if (!item.category || item.category.trim().length === 0) {
        errors.push({ index: idx + 1, error: `第 ${idx + 1} 条：分类不能为空` })
      }
      if (item.tags && item.tags.length > 5) {
        errors.push({ index: idx + 1, error: `第 ${idx + 1} 条：标签最多5个` })
      }
    })

    if (errors.length > 0) {
      return NextResponse.json({ error: "数据校验失败", details: errors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 批量创建
    const created = await prisma.$transaction(
      prompts.map((item) =>
        prisma.prompt.create({
          data: {
            title: item.title.trim(),
            content: item.content.trim(),
            description: item.description?.trim() || null,
            category: item.category.trim(),
            tags: JSON.stringify(item.tags || []),
            authorId: user.id,
          },
        })
      )
    )

    return NextResponse.json(
      {
        success: true,
        count: created.length,
        message: `成功上传 ${created.length} 条提示词`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error batch creating prompts:", error)
    return NextResponse.json({ error: "批量上传失败，请重试" }, { status: 500 })
  }
}
