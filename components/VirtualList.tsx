"use client"

import React from "react"
import { FixedSizeList as List } from "react-window"

interface VirtualListProps {
  itemCount: number
  itemSize: number
  children: (index: number) => React.ReactNode
  width?: string | number
  height?: string | number
  gap?: number
}

export default function VirtualList({
  itemCount,
  itemSize,
  children,
  width = "100%",
  height = 600,
  gap = 0,
}: VirtualListProps) {
  return (
    <List
      width={width}
      height={height}
      itemCount={itemCount}
      itemSize={itemSize + gap}
    >
      {({ index, style }) => (
        <div style={{ ...style, paddingBottom: gap }}>
          {children(index)}
        </div>
      )}
    </List>
  )
}
