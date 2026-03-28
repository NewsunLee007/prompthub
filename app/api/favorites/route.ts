import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { promptId } = body

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_promptId: {
          userId: user.id,
          promptId,
        },
      },
    })

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      })
      return NextResponse.json({ favorited: false })
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        promptId,
      },
    })

    return NextResponse.json({ favorited: true })
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ favoritedPrompts: [] })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favorites: {
          select: { promptId: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ favoritedPrompts: [] })
    }

    return NextResponse.json({
      favoritedPrompts: user.favorites.map((fav) => fav.promptId),
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    )
  }
}
