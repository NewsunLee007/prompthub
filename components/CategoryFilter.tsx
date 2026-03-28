"use client"

interface Category {
  id: string
  name: string
  label: string
  color: string
  isSystem: boolean
}

interface CategoryFilterProps {
  categories: Category[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("ALL")}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          selected === "ALL"
            ? "bg-primary text-white"
            : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
        }`}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSelect(category.name)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            selected === category.name
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
