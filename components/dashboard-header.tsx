"use client"

import { Button } from "@/components/ui/button"
import { Bot, LogOut, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">RAG Agents</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/integrations">
            <Button variant="outline" className="gap-2 transition-all duration-200 hover:scale-105 bg-transparent">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="transition-all duration-200 hover:scale-105"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
