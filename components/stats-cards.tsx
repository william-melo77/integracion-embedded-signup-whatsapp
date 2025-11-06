"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bot, Activity, TrendingUp, Zap } from "lucide-react"

interface Agent {
  status: "active" | "inactive"
  queries: number
  accuracy: number
}

interface StatsCardsProps {
  agents: Agent[]
}

export function StatsCards({ agents }: StatsCardsProps) {
  const activeAgents = agents.filter((a) => a.status === "active").length
  const totalQueries = agents.reduce((sum, a) => sum + a.queries, 0)
  const avgAccuracy = Math.round(agents.reduce((sum, a) => sum + a.accuracy, 0) / agents.length)

  const stats = [
    {
      title: "Total Agents",
      value: agents.length,
      icon: Bot,
      description: `${activeAgents} active`,
    },
    {
      title: "Total Queries",
      value: totalQueries.toLocaleString(),
      icon: Activity,
      description: "Last 30 days",
    },
    {
      title: "Avg Accuracy",
      value: `${avgAccuracy}%`,
      icon: TrendingUp,
      description: "Across all agents",
    },
    {
      title: "Active Now",
      value: activeAgents,
      icon: Zap,
      description: "Processing requests",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <stat.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
