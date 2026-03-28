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
  id: string
  name: string
  label: string
  color: string
  isSystem: boolean
}

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}
