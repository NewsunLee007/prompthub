"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ReactNode, useEffect, useState } from "react"

interface SessionProviderProps {
  children: ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
