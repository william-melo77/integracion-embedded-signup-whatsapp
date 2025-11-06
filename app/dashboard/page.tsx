"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { AgentCard } from "@/components/agent-card"
import { StatsCards } from "@/components/stats-cards"

const agents = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets with contextual responses",
    status: "active" as const,
    queries: 1247,
    accuracy: 94,
    lastActive: "2 minutes ago",
  },
  {
    id: "2",
    name: "Sales Assistant",
    description: "Provides product information and assists with sales inquiries",
    status: "active" as const,
    queries: 892,
    accuracy: 91,
    lastActive: "5 minutes ago",
  },
  {
    id: "3",
    name: "Documentation Helper",
    description: "Answers technical questions based on product documentation",
    status: "inactive" as const,
    queries: 634,
    accuracy: 96,
    lastActive: "1 hour ago",
  },
  {
    id: "4",
    name: "HR Assistant",
    description: "Helps employees with HR policies and benefits information",
    status: "active" as const,
    queries: 423,
    accuracy: 89,
    lastActive: "12 minutes ago",
  },
  {
    id: "5",
    name: "Legal Advisor",
    description: "Provides legal information and contract analysis",
    status: "inactive" as const,
    queries: 156,
    accuracy: 97,
    lastActive: "3 hours ago",
  },
  {
    id: "6",
    name: "Marketing Analyst",
    description: "Analyzes marketing data and provides strategic insights",
    status: "active" as const,
    queries: 789,
    accuracy: 92,
    lastActive: "8 minutes ago",
  },
]

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl font-semibold text-foreground mb-2 text-balance">AI RAG Agents Dashboard</h1>
            <p className="text-muted-foreground animate-in fade-in duration-700 delay-100">
              Monitor and manage your intelligent agents
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <StatsCards agents={agents} />
          </div>

          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
