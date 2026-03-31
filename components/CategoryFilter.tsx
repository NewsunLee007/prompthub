"use client"

import { Category } from "@/types"

interface CategoryFilterProps {
  categories: Category[]
  selected: string[]
  onSelect: (categories: string[]) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const handleAllClick = () => {
    if (selected.includes("ALL")) {
      onSelect([])
    } else {
      onSelect(["ALL"])
    }
  }

  const handleCategoryClick = (categoryName: string) => {
    let newSelected: string[]
    
    if (categoryName === "ALL") {
      newSelected = selected.includes("ALL") ? [] : ["ALL"]
    } else if (selected.includes("ALL")) {
      newSelected = [categoryName]
    } else if (selected.includes(categoryName)) {
      newSelected = selected.filter(c => c !== categoryName)
    } else {
      newSelected = [...selected, categoryName]
    }
    
    onSelect(newSelected)
  }

  const isAllSelected = selected.includes("ALL")
  const isAnySelected = selected.length > 0 && !isAllSelected

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="分类过滤器">
      <button
        onClick={handleAllClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          isAllSelected
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : isAnySelected
            ? "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
            : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
        }`}
        aria-pressed={isAllSelected}
        aria-label="选择所有分类"
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => handleCategoryClick(category.name)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            isAllSelected
              ? "bg-card text-muted-foreground border border-border opacity-60 cursor-not-allowed"
              : selected.includes(category.name)
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
          }`}
          disabled={isAllSelected}
          aria-pressed={selected.includes(category.name)}
          aria-label={`选择分类: ${category.label}`}
        >
          {category.label}
        </button>
      ))}
      {isAnySelected && (
        <button
          onClick={() => onSelect([])}
          className="px-4 py-2 text-sm font-medium rounded-full bg-card text-muted-foreground hover:text-primary border border-border hover:border-primary/50 transition-all duration-200"
          aria-label="清除所有选择"
        >
          清除
        </button>
      )}
    </div>
  )
}
