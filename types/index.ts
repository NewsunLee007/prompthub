export interface Prompt {
  id: string
  title: string
  content: string
  description: string | null
  category: string
  tags: string
  authorId: string
  author: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  copyCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  _count: {
    likes: number
    favorites: number
  }
}

export interface Category {
  value: string
  label: string
  color: string
}

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}
