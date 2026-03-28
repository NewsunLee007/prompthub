import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// 超级管理员邮箱
const SUPER_ADMIN_EMAIL = "newsunlee007@gmail.com"

// 检查用户是否有权限编辑/删除提示词
async function checkPermission(session: any, promptId: string) {
  if (!session?.user?.email) {
    return { allowed: false, status: 401, error: "Unauthorized" }
  }

  // 超级管理员有所有权限
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    return { allowed: true }
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: { author: true },
  })

  if (!prompt) {
    return { allowed: false, status: 404, error: "Prompt not found" }
  }

  // 只有作者可以编辑/删除
  if (prompt.author.email !== session.user.email) {
    return { allowed: false, status: 403, error: "Forbidden" }
  }

  return { allowed: true, prompt }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.prompt.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            favorites: true,
          },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const permission = await checkPermission(session, id)
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status }
      )
    }

    const body = await request.json()
    const { title, content, description, category, tags } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        title,
        content,
        description,
        category,
        tags: JSON.stringify(tags || []),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            favorites: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPrompt)
  } catch (error) {
    console.error("Error updating prompt:", error)
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const permission = await checkPermission(session, id)
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.status }
      )
    }

    await prisma.prompt.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}
