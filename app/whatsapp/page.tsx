"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WaEvent =
    | {
          type: "WA_EMBEDDED_SIGNUP";
          event: "FINISH";
          data: { phone_number_id?: string; waba_id?: string };
      }
    | {
          type: "WA_EMBEDDED_SIGNUP";
          event: "CANCEL";
          data: { current_step?: string };
      }
    | {
          type: "WA_EMBEDDED_SIGNUP";
          event: "ERROR";
          data: { error_message?: string };
      }
    | Record<string, any>;

export default function WhatsAppEmbeddedSignupPage() {
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [sdkResponse, setSdkResponse] = useState<any>(null);
    const codeRef = useRef<string | null>(null);
    const [wabaId, setWabaId] = useState<string | null>(null);
    const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ handler asíncrono separado
    const handleLoginResponse = useCallback(
        async (response: any) => {
            setSdkResponse(response);
            const code = response?.authResponse?.code as string | undefined;
            if (!code) {
                alert("No se recibió authorization code.");
                return;
            }
            setLoading(true);
            try {
                const res = await fetch("/api/whatsapp/exchange-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        waba_id: wabaId,
                        phone_number_id: phoneNumberId,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error || "Fallo al canjear el code");
                }
                const data = await res.json();
                window.location.href = `/whatsapp/success?tenant=${encodeURIComponent(
                    data?.tenantId || ""
                )}`;
            } catch (e: any) {
                alert(e?.message || "Error al integrar WhatsApp");
            } finally {
                setLoading(false);
            }
        },
        [wabaId, phoneNumberId]
    );

    // === Listener de postMessage (facebook.com / web.facebook.com) ===
    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (
                ![
                    "https://www.facebook.com",
                    "https://web.facebook.com",
                ].includes(event.origin)
            )
                return;

            try {
                const data: WaEvent = JSON.parse(event.data as string);
                setSessionInfo(data);

                if (data && (data as any).type === "WA_EMBEDDED_SIGNUP") {
                    if ((data as any).event === "FINISH") {
                        const pId = (data as any).data?.phone_number_id ?? null;
                        const wId = (data as any).data?.waba_id ?? null;
                        setPhoneNumberId(pId);
                        setWabaId(wId);
                        console.log("Phone number ID", pId, "WABA ID", wId);
                    } else if ((data as any).event === "CANCEL") {
                        console.warn(
                            "Cancel at",
                            (data as any).data?.current_step
                        );
                    } else if ((data as any).event === "ERROR") {
                        console.error(
                            "Error",
                            (data as any).data?.error_message
                        );
                    }
                }
            } catch {
                // Meta a veces manda mensajes no-json (logs internos), ignóralos con seguridad
                // console.log('Non JSON Responses', event.data);
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // ✅ callback síncrono para FB.login
    const fbLoginCallback = useCallback(
        (response: any) => {
            // No returns, no await aquí
            void handleLoginResponse(response);
        },
        [handleLoginResponse]
    );

    // === Lanzar Embedded Signup ===
    const launchWhatsAppSignup = useCallback(() => {
        const FB = (window as any).FB;
        if (!FB) {
            alert(
                "El SDK de Facebook aún no está listo. Intenta en unos segundos."
            );
            return;
        }
        FB.login(fbLoginCallback, {
            config_id: process.env.NEXT_PUBLIC_EMBEDDED_SIGNUP_CONFIG_ID,
            response_type: "code",
            override_default_response_type: true,
            extras: { version: "v3" },
        });
    }, [fbLoginCallback]);

    return (
        <main className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-semibold mb-2">Embedded Signup</h1>
            <p className="text-sm text-gray-600 mb-6">
                Conecta tu WhatsApp Business con nuestro sistema.
            </p>

            <button
                onClick={launchWhatsAppSignup}
                disabled={loading}
                style={{
                    backgroundColor: "#1877f2",
                    border: 0,
                    borderRadius: 4,
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: 16,
                    fontWeight: "bold",
                    height: 40,
                    padding: "0 24px",
                }}
            >
                {loading ? "Conectando…" : "Login with Facebook"}
            </button>

            <div className="mt-6">
                <p className="font-medium mb-2">Session info response:</p>
                <pre className="rounded border p-3 text-sm overflow-auto">
                    {JSON.stringify(sessionInfo, null, 2)}
                </pre>
            </div>

            <div className="mt-6">
                <p className="font-medium mb-2">SDK response:</p>
                <pre className="rounded border p-3 text-sm overflow-auto">
                    {JSON.stringify(sdkResponse, null, 2)}
                </pre>
            </div>
        </main>
    );
}
