"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Activity, TrendingUp, Clock } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  queries: number
  accuracy: number
  lastActive: string
}

interface AgentCardProps {
  agent: Agent
  index: number
}

export function AgentCard({ agent, index }: AgentCardProps) {
  return (
    <Card
      className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
            <Bot className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <Badge
            variant={agent.status === "active" ? "default" : "secondary"}
            className={`${agent.status === "active" ? "bg-primary text-primary-foreground" : ""} transition-all duration-200`}
          >
            {agent.status === "active" && (
              <span className="inline-block h-2 w-2 rounded-full bg-primary-foreground mr-1.5 animate-pulse" />
            )}
            {agent.status}
          </Badge>
        </div>
        <CardTitle className="text-lg text-balance transition-colors duration-200 group-hover:text-primary">
          {agent.name}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">{agent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Queries</span>
            </div>
            <span className="font-semibold text-foreground">{agent.queries.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Accuracy</span>
            </div>
            <span className="font-semibold text-foreground">{agent.accuracy}%</span>
          </div>
          <div className="flex items-center justify-between text-sm transition-all duration-200 hover:translate-x-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last active</span>
            </div>
            <span className="text-muted-foreground">{agent.lastActive}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
