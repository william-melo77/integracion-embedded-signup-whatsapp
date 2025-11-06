"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { WhatsAppAgentCard } from "@/components/whatsapp-agent-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CheckCircle2, XCircle } from "lucide-react"

const agents = [
  {
    id: "1",
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets with contextual responses",
    status: "active" as const,
    whatsappConnected: true,
    phoneNumber: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Sales Assistant",
    description: "Provides product information and assists with sales inquiries",
    status: "active" as const,
    whatsappConnected: false,
    phoneNumber: null,
  },
  {
    id: "3",
    name: "Documentation Helper",
    description: "Answers technical questions based on product documentation",
    status: "inactive" as const,
    whatsappConnected: true,
    phoneNumber: "+1 (555) 987-6543",
  },
  {
    id: "4",
    name: "HR Assistant",
    description: "Helps employees with HR policies and benefits information",
    status: "active" as const,
    whatsappConnected: false,
    phoneNumber: null,
  },
  {
    id: "5",
    name: "Legal Advisor",
    description: "Provides legal information and contract analysis",
    status: "inactive" as const,
    whatsappConnected: false,
    phoneNumber: null,
  },
  {
    id: "6",
    name: "Marketing Analyst",
    description: "Analyzes marketing data and provides strategic insights",
    status: "active" as const,
    whatsappConnected: true,
    phoneNumber: "+1 (555) 456-7890",
  },
]

export default function IntegrationsPage() {
  const connectedCount = agents.filter((a) => a.whatsappConnected).length

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2 text-balance">WhatsApp Integration</h1>
            <p className="text-muted-foreground">Connect your agents to WhatsApp for seamless communication</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Agents</p>
                    <p className="text-2xl font-semibold text-foreground">{agents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <p className="text-2xl font-semibold text-foreground">{connectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Not Connected</p>
                    <p className="text-2xl font-semibold text-foreground">{agents.length - connectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                About WhatsApp Integration
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Connect your AI agents to WhatsApp Business API to enable real-time conversations with your customers.
                Each agent can be connected to a unique phone number for dedicated communication channels.
              </CardDescription>
            </CardHeader>
          </Card>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Agent Connections</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agents.map((agent, index) => (
                <WhatsAppAgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
