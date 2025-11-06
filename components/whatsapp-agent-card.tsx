"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Agent {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  whatsappConnected: boolean
  phoneNumber: string | null
}

interface WhatsAppAgentCardProps {
  agent: Agent
  index: number
}

export function WhatsAppAgentCard({ agent, index }: WhatsAppAgentCardProps) {
  const [isConnected, setIsConnected] = useState(agent.whatsappConnected)
  const [phoneNumber, setPhoneNumber] = useState(agent.phoneNumber || "")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnected(true)
    setIsConnecting(false)
    setIsOpen(false)
  }

  const handleDisconnect = async () => {
    setIsConnecting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsConnected(false)
    setPhoneNumber("")
    setIsConnecting(false)
  }

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
      <CardContent className="space-y-4">
        {isConnected && phoneNumber && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 animate-in zoom-in duration-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Connected</p>
              <p className="text-xs text-muted-foreground truncate">{phoneNumber}</p>
            </div>
          </div>
        )}

        {isConnected ? (
          <Button
            variant="outline"
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-destructive/50 hover:text-destructive bg-transparent"
            onClick={handleDisconnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Disconnect WhatsApp
              </>
            )}
          </Button>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20">
                <MessageSquare className="h-4 w-4" />
                Connect to WhatsApp
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md animate-in fade-in zoom-in duration-300">
              <DialogHeader>
                <DialogTitle className="text-balance">Connect {agent.name}</DialogTitle>
                <DialogDescription className="leading-relaxed">
                  Enter the WhatsApp Business phone number you want to connect to this agent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01]"
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={!phoneNumber || isConnecting}
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Connect Agent
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
