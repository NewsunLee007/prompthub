import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { copyCount: { increment: 1 } },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, copyCount: prompt.copyCount })
  } catch (error) {
    console.error("Error copying prompt:", error)
    return NextResponse.json(
      { error: "Failed to copy prompt" },
      { status: 500 }
    )
  }
}
