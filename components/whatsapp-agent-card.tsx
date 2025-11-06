"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import EmbeddedSignupWhatsappButton from "@/components/embedded-signup-whatsapp-button";

interface Agent {
    id: string;
    name: string;
    description: string;
    status: "active" | "inactive";
    whatsappConnected: boolean;
}

interface WhatsAppAgentCardProps {
    agent: Agent;
    index: number;
}

export function WhatsAppAgentCard({ agent, index }: WhatsAppAgentCardProps) {
    const [isConnected, setIsConnected] = useState(agent.whatsappConnected);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        // Simulate simple API call (5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsConnected(true);
        setIsConnecting(false);
    };

    const handleDisconnect = async () => {
        setIsConnecting(true);
        // Simulate simple API call (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsConnected(false);
        setIsConnecting(false);
    };

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
                        variant={
                            agent.status === "active" ? "default" : "secondary"
                        }
                        className={`${
                            agent.status === "active"
                                ? "bg-primary text-primary-foreground"
                                : ""
                        } transition-all duration-200`}
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
                <CardDescription className="text-sm leading-relaxed">
                    {agent.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isConnected ? (
                    <div className="flex items-center gap-2 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 transition-all duration-200 bg-transparent"
                            disabled
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Conectado a WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-2 transition-all duration-200 hover:border-destructive/50 hover:text-destructive"
                            onClick={handleDisconnect}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Desconectando...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-4 w-4" />
                                    Desconectar
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <EmbeddedSignupWhatsappButton
                        onStart={() => setIsConnecting(true)}
                        onSuccess={() => {
                            setIsConnecting(false);
                            setIsConnected(true);
                        }}
                        onError={() => setIsConnecting(false)}
                        label={isConnecting ? "Conectando..." : "Conectar a WhatsApp"}
                        className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
                    />
                )}
            </CardContent>
        </Card>
    );
}
