"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

declare global {
    interface Window {
        FB: any;
    }
}

type Props = {
    onStart?: () => void;
    onSuccess?: () => void;
    onError?: (err: any) => void;
    className?: string;
    label?: string;
};

export default function ConnectButton({
    onStart,
    onSuccess,
    onError,
    className,
    label,
}: Props) {
    const [ready, setReady] = useState(false);

    // nos aseguramos que el SDK esté listo
    useEffect(() => {
        const check = () =>
            setReady(typeof window !== "undefined" && !!window.FB);
        const id = setInterval(check, 300);
        check();
        return () => clearInterval(id);
    }, []);

    const openEmbeddedSignup = useCallback(() => {
        if (!window.FB) return;
        try {
            onStart?.();

            window.FB.login(
                async (resp: any) => {
                    try {
                        if (resp?.authResponse?.code) {
                            // Envía el "code" a tu backend para el intercambio por token
                            await fetch("/api/whatsapp/es/callback", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ code: resp.authResponse.code }),
                            });
                            onSuccess?.();
                            // aquí puedes refrescar UI / estado del tenant
                        } else {
                            console.warn("Embedded Signup cancelado o sin code", resp);
                            onError?.(resp);
                        }
                    } catch (err) {
                        console.error("Error en callback de embedded signup", err);
                        onError?.(err);
                    }
                },
                {
                    config_id: process.env.NEXT_PUBLIC_FB_ES_CONFIG_ID, // tu Configuration ID
                    response_type: "code",
                    override_default_response_type: true,
                    // Opcional: datos extra del setup
                    // extras: { setup: { solution_id: "...", preverified_id: "..." } }
                }
            );
        } catch (err) {
            console.error("Error al iniciar embedded signup", err);
            onError?.(err);
        }
    }, []);

    return (
        <Button
            onClick={openEmbeddedSignup}
            disabled={!ready}
            className={`${className ?? ""} rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50`}
        >
            {ready ? (label ?? "Conectar WhatsApp") : "Cargando…"}
        </Button>
    );
}
