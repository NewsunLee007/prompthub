"use client"

import React from "react"
import { FixedSizeGrid as Grid } from "react-window"

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
    <Grid
      columnCount={1}
      columnWidth={width}
      rowCount={itemCount}
      rowHeight={itemSize + gap}
      width={width}
      height={height}
    >
      {({ columnIndex, rowIndex, style }) => (
        <div style={{ ...style, paddingBottom: gap }}>
          {children(rowIndex)}
        </div>
      )}
    </Grid>
  )
}
