# Implementación de Facebook Embedded SignUp para WhatsApp Business

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura de Archivos y Carpetas](#estructura-de-archivos-y-carpetas)
4. [Variables de Entorno](#variables-de-entorno)
5. [Componentes de la Aplicación](#componentes-de-la-aplicación)
6. [Flujo Completo Paso a Paso](#flujo-completo-paso-a-paso)
7. [Código Completo](#código-completo)
8. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)

---

## Introducción

Este proyecto implementa el **Facebook Embedded SignUp** para WhatsApp Business como **Tech Provider**. Permite que los clientes conecten sus cuentas de WhatsApp Business (WABAs) a través de un flujo embebido de Facebook, capturando automáticamente:

- **business_id** - ID del negocio en Facebook
- **waba_id** - ID de la cuenta de WhatsApp Business
- **phone_number_id** - ID del número de teléfono registrado
- **access_token** - Token de acceso de larga duración
- **code** - Authorization code del SDK de Facebook

Todos estos datos se envían automáticamente a un backend externo para su registro y gestión.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. MetaSdkLoader (Carga SDK de Facebook)            │   │
│  │     • Se ejecuta en layout.tsx (global)              │   │
│  │     • Inicializa window.FB                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. WhatsAppEmbeddedSignupPage                       │   │
│  │     • Usuario hace clic en "Login with Facebook"     │   │
│  │     • Llama a FB.login() con config_id               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. Dual Event Listeners                             │   │
│  │     A. postMessage → {business_id, waba_id, phone_id}│   │
│  │     B. FB.login callback → {code}                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. useEffect (Espera TODOS los valores)             │   │
│  │     • Valida que code + IDs estén disponibles        │   │
│  │     • Envía al backend                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js API)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. /api/whatsapp/exchange-code                      │   │
│  │     • Recibe: code, waba_id, phone_number_id,        │   │
│  │               business_id                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  6. Intercambio con Facebook Graph API               │   │
│  │     • Envía: code + client_id + client_secret        │   │
│  │     • Recibe: access_token + token_type              │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  7. Envío a Backend Externo (Agentik)                │   │
│  │     • POST al endpoint de integrations               │   │
│  │     • Incluye header x-tenant-id                     │   │
│  │     • Payload completo con todos los datos           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos y Carpetas

```
integracion-embedded-signup-whatsapp/
├── app/
│   ├── layout.tsx                    # Layout principal - carga MetaSdkLoader
│   ├── whatsapp/
│   │   └── page.tsx                  # Página de Embedded SignUp
│   └── api/
│       └── whatsapp/
│           └── exchange-code/
│               └── route.ts          # API endpoint para intercambiar code
├── components/
│   └── MetaSdkLoader.tsx             # Componente que carga el SDK de Facebook
├── .env                              # Variables de entorno (NO subir a git)
└── package.json
```

### Descripción de Archivos Clave

| Archivo | Propósito | Cuándo se ejecuta |
|---------|-----------|-------------------|
| `components/MetaSdkLoader.tsx` | Carga el SDK de Facebook globalmente | Al cargar cualquier página |
| `app/layout.tsx` | Layout raíz que incluye MetaSdkLoader | En cada render de la app |
| `app/whatsapp/page.tsx` | Página principal del flujo de signup | Cuando el usuario visita `/whatsapp` |
| `app/api/whatsapp/exchange-code/route.ts` | Endpoint backend para intercambiar code por token | Cuando el frontend envía el code |

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ===== PÚBLICAS (NEXT_PUBLIC_*) - Se exponen al cliente =====

# ID de tu aplicación de Facebook
NEXT_PUBLIC_FB_APP_ID=tu_facebook_app_id

# ID de configuración del Embedded SignUp (de Meta Business Suite)
NEXT_PUBLIC_EMBEDDED_SIGNUP_CONFIG_ID=tu_config_id

# Versión de la API de Meta Graph
NEXT_PUBLIC_META_API_VERSION=v24.0

# ===== PRIVADAS - SOLO en el servidor (NUNCA se exponen al cliente) =====

# ID de tu aplicación de Facebook (mismo que el público)
META_APP_ID=tu_facebook_app_id

# Secret de tu aplicación de Facebook (NUNCA exponer al cliente)
META_APP_SECRET=tu_facebook_app_secret

# Endpoint de tu backend externo para registrar integrations
AGENTIK_INTEGRATIONS_ENDPOINT=https://tu-backend.com/api/integrations/whatsapp

# ID del tenant por defecto (para multi-tenancy)
DEFAULT_TENANT_ID=tu_tenant_id
```

> ⚠️ **IMPORTANTE**: El archivo `.env` debe estar en `.gitignore` para nunca subir las credenciales a Git.

### ¿Dónde obtener estos valores?

- **NEXT_PUBLIC_FB_APP_ID / META_APP_ID**: [Meta Developer Console](https://developers.facebook.com/apps) → Tu App → Settings → Basic
- **META_APP_SECRET**: Meta Developer Console → Tu App → Settings → Basic → App Secret
- **NEXT_PUBLIC_EMBEDDED_SIGNUP_CONFIG_ID**: [Meta Business Suite](https://business.facebook.com/) → WhatsApp Business → Embedded Signup → Configuration ID
- **AGENTIK_INTEGRATIONS_ENDPOINT**: URL de tu propio backend donde se registrarán las WABAs
- **DEFAULT_TENANT_ID**: UUID de tu tenant en tu base de datos

---

## Componentes de la Aplicación

### 1. MetaSdkLoader.tsx

**Ubicación**: `components/MetaSdkLoader.tsx`

**Propósito**: Cargar el SDK de Facebook de manera global y asíncrona.

**¿Cuándo se carga?**: En el `layout.tsx`, por lo que está disponible en TODAS las páginas.

**Funcionalidades**:
- Carga el script `https://connect.facebook.net/en_US/sdk.js`
- Inicializa `window.FB` con tu App ID
- Define tipos TypeScript para `window.FB`

**Flujo**:
```
1. Component monta
2. useEffect define window.fbAsyncInit
3. <Script> carga el SDK de Facebook
4. SDK ejecuta window.fbAsyncInit
5. window.FB queda inicializado y disponible
```

---

### 2. layout.tsx

**Ubicación**: `app/layout.tsx`

**Propósito**: Layout raíz de Next.js que envuelve toda la aplicación.

**¿Por qué incluimos MetaSdkLoader aquí?**
- Para que el SDK de Facebook esté disponible ANTES de que el usuario llegue a `/whatsapp`
- Evita errores de "FB is not defined"
- Carga una sola vez para toda la aplicación

---

### 3. WhatsAppEmbeddedSignupPage

**Ubicación**: `app/whatsapp/page.tsx`

**Propósito**: Página principal donde ocurre el flujo de Embedded SignUp.

**Componentes clave**:

#### A. Estados (useState)
```typescript
const [authCode, setAuthCode] = useState<string | null>(null);
const [businessId, setBusinessId] = useState<string | null>(null);
const [wabaId, setWabaId] = useState<string | null>(null);
const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
const [accessToken, setAccessToken] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

#### B. Listener de postMessage (useEffect #1)
- **Escucha**: Mensajes de `facebook.com` y `web.facebook.com`
- **Captura**: `business_id`, `waba_id`, `phone_number_id`
- **Cuándo se dispara**: Cuando el usuario completa el flujo de Embedded SignUp

#### C. Handler de FB.login (handleLoginResponse)
- **Recibe**: La respuesta del SDK con el authorization `code`
- **Guarda**: El `code` en el estado `authCode`
- **NO ejecuta**: El envío al backend (eso lo hace el useEffect)

#### D. useEffect de sincronización (useEffect #2)
- **Espera**: Que TODOS los valores estén disponibles (`authCode`, `businessId`, `wabaId`, `phoneNumberId`)
- **Ejecuta**: El fetch al endpoint `/api/whatsapp/exchange-code`
- **Evita**: Race conditions entre `postMessage` y `FB.login` callback

---

### 4. Exchange Code API Route

**Ubicación**: `app/api/whatsapp/exchange-code/route.ts`

**Propósito**: Endpoint backend que intercambia el authorization code por un access token.

**Flujo interno**:

1. **Validar** que `code`, `business_id`, `waba_id` estén presentes
2. **Intercambiar** el `code` con Facebook Graph API
3. **Recibir** `access_token` y `token_type`
4. **Construir** el payload para el backend externo
5. **Enviar** al endpoint de Agentik con header `x-tenant-id`
6. **Responder** al frontend con el resultado completo

---

## Flujo Completo Paso a Paso

### Paso 1: Carga Inicial de la Aplicación

```
1. Usuario visita http://localhost:3000/whatsapp
2. Next.js renderiza layout.tsx
3. <MetaSdkLoader /> se monta y carga el SDK de Facebook
4. window.FB se inicializa con el appId
5. WhatsAppEmbeddedSignupPage se renderiza
6. useEffect de postMessage se activa y empieza a escuchar
```

---

### Paso 2: Usuario Inicia el Flujo

```
7. Usuario hace clic en "Login with Facebook"
8. launchWhatsAppSignup() verifica que window.FB esté disponible
9. Llama a FB.login(fbLoginCallback, {config_id, response_type: "code", ...})
10. Se abre un popup/modal de Facebook con el flujo de Embedded SignUp
```

---

### Paso 3: Usuario Completa el SignUp en Facebook

```
11. Usuario completa el proceso en el popup de Facebook
12. Facebook cierra el popup y ejecuta DOS eventos ASÍNCRONOS:
    
    A. postMessage Event:
       • Facebook envía un mensaje via window.postMessage
       • El listener captura el evento
       • Extrae: business_id, waba_id, phone_number_id
       • setBusinessId(bId), setWabaId(wId), setPhoneNumberId(pId)
    
    B. FB.login Callback:
       • Facebook ejecuta fbLoginCallback(response)
       • handleLoginResponse extrae el code
       • setAuthCode(code)
```

> ⚠️ **IMPORTANTE**: Estos dos eventos pueden llegar en CUALQUIER ORDEN. Por eso usamos un `useEffect` que espera a que AMBOS estén completos.

---

### Paso 4: Sincronización y Envío al Backend

```
13. useEffect de sincronización se dispara cuando:
    • authCode cambia (de null a "AQC...")
    • businessId cambia (de null a "1038330114284347")
    • wabaId cambia (de null a "842944001426150")
    • phoneNumberId cambia (de null a "917005114825033")

14. useEffect valida que TODOS los valores estén presentes:
    if (!authCode || !businessId || !wabaId || !phoneNumberId) {
        return; // ← Espera hasta que todos estén
    }

15. Ejecuta fetch POST a /api/whatsapp/exchange-code con:
    {
      code: authCode,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      business_id: businessId
    }
```

---

### Paso 5: Backend Intercambia el Code

```
16. /api/whatsapp/exchange-code recibe el request
17. Valida que todos los campos requeridos estén presentes
18. Construye URL: https://graph.facebook.com/v24.0/oauth/access_token
19. Envía GET con query params:
    • client_id: META_APP_ID
    • client_secret: META_APP_SECRET (NUNCA expuesto al cliente)
    • code: authCode
20. Facebook responde con:
    {
      access_token: "EAAZAPGTcOBUg...",
      token_type: "bearer"
    }
```

---

### Paso 6: Registro en Backend Externo

```
21. Backend construye el payload:
    {
      business_id: "1038330114284347",
      waba_id: "842944001426150",
      status: "ACTIVE",
      access_token: "EAAZAPGTcOBUg...",
      token_type: "bearer",
      phone_number_id: "917005114825033"
    }

22. Envía POST a AGENTIK_INTEGRATIONS_ENDPOINT con:
    • Header: x-tenant-id: DEFAULT_TENANT_ID
    • Body: payload completo

23. Backend de Agentik crea/actualiza la integración en la base de datos

24. Responde con el resultado (éxito o error)
```

---

### Paso 7: Respuesta al Frontend

```
25. /api/whatsapp/exchange-code responde al frontend con:
    {
      ok: true,
      access_token: "EAAZAPGTcOBUg...",
      token_type: "bearer",
      registrationForward: "sent" | "failed",
      registrationResponse: {...}
    }

26. Frontend actualiza los estados:
    • setAccessToken(access_token)
    • setRegistrationForward("sent")
    • setRegistrationResponse({...})

27. UI muestra los resultados:
    • Access Token recibido ✅
    • Registro externo: Estado sent ✅
```

---

## Código Completo

### components/MetaSdkLoader.tsx

```tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
    interface Window {
        fbAsyncInit?: () => void;
        FB: any;
    }
}

export default function MetaSdkLoader() {
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB?.init({
                appId: process.env.NEXT_PUBLIC_FB_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: process.env.NEXT_PUBLIC_META_API_VERSION || "v24.0",
            });
        };
    }, []);

    return (
        <Script
            id="facebook-jssdk"
            src="https://connect.facebook.net/en_US/sdk.js"
            async
            defer
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
```

---

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MetaSdkLoader from "@/components/MetaSdkLoader";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "v0 App",
    description: "Created with v0",
    generator: "v0.app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`font-sans antialiased`}>
                <MetaSdkLoader />
                {children}
                <Analytics />
            </body>
        </html>
    );
}
```

---

### app/whatsapp/page.tsx

```tsx
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
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [token_type, settoken_type] = useState<string | null>(null);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [registrationForward, setRegistrationForward] = useState<
        string | null
    >(null);
    const [registrationResponse, setRegistrationResponse] = useState<any>(null);
    const [whatsappSendStatus, setWhatsappSendStatus] = useState<string | null>(
        null
    );
    const [whatsappSendPayload, setWhatsappSendPayload] = useState<any>(null);
    const codeRef = useRef<string | null>(null);
    const [wabaId, setWabaId] = useState<string | null>(null);
    const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // ✅ Guardar el code en estado cuando llega del SDK
    const [authCode, setAuthCode] = useState<string | null>(null);

    // ✅ Este useEffect se ejecuta cuando AMBOS (code + IDs) están disponibles
    useEffect(() => {
        // Solo ejecutar si tenemos TODOS los valores necesarios
        if (!authCode || !businessId || !wabaId || !phoneNumberId) {
            return;
        }

        // Evitar doble ejecución
        if (loading || accessToken) {
            return;
        }

        console.log("✅ Todos los valores disponibles, enviando al backend:", {
            authCode,
            businessId,
            wabaId,
            phoneNumberId,
        });

        setLoading(true);

        const exchangeCode = async () => {
            try {
                const res = await fetch("/api/whatsapp/exchange-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: authCode,
                        waba_id: wabaId,
                        phone_number_id: phoneNumberId,
                        business_id: businessId,
                    }),
                });
                
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error || "Fallo al canjear el code");
                }
                
                const data = await res.json();
                
                // Guardar token y expiración en UI
                setAccessToken(data?.access_token ?? null);
                settoken_type(
                    typeof data?.token_type === "string"
                        ? data.token_type
                        : null
                );
                
                // Estado del registro externo
                setRegistrationForward(
                    typeof data?.registrationForward === "string"
                        ? data.registrationForward
                        : null
                );
                setRegistrationResponse(data?.registrationResponse ?? null);
            } catch (e: any) {
                alert(e?.message || "Error al integrar WhatsApp");
            } finally {
                setLoading(false);
            }
        };

        void exchangeCode();
    }, [authCode, businessId, wabaId, phoneNumberId, loading, accessToken]);

    // ✅ handler asíncrono separado - solo guarda el code
    const handleLoginResponse = useCallback(
        (response: any) => {
            setSdkResponse(response);
            const code = response?.authResponse?.code as string | undefined;
            
            if (!code) {
                alert("No se recibió authorization code.");
                return;
            }
            
            console.log("📥 Code recibido del SDK:", code);
            setAuthCode(code);
        },
        []
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
                        const bId = (data as any).data?.business_id ?? null;
                        setPhoneNumberId(pId);
                        setWabaId(wId);
                        setBusinessId(bId);
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
                // Meta a veces manda mensajes no-json (logs internos), ignóralos
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // ✅ callback síncrono para FB.login
    const fbLoginCallback = useCallback(
        (response: any) => {
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

            <div className="mt-6">
                <p className="font-medium mb-2">Access Token recibido:</p>
                {accessToken ? (
                    <pre className="rounded border p-3 text-sm overflow-auto break-all">
                        {accessToken}
                    </pre>
                ) : (
                    <p className="text-sm text-gray-600">Aún no recibido.</p>
                )}
                {token_type !== null && (
                    <p className="text-sm mt-2">Token Type: {token_type}</p>
                )}
            </div>

            {/* Banner de registro externo */}
            <div className="mt-6">
                <p className="font-medium mb-2">Registro externo:</p>
                {registrationForward ? (
                    <div
                        className={
                            "rounded border p-3 text-sm " +
                            (registrationForward === "sent"
                                ? "border-green-300 bg-green-50"
                                : "border-orange-300 bg-orange-50")
                        }
                    >
                        <p className="mb-2">
                            Estado: <strong>{registrationForward}</strong>
                        </p>
                        <pre className="rounded border p-3 text-xs overflow-auto">
                            {JSON.stringify(registrationResponse, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">Aún no enviado.</p>
                )}
            </div>
        </main>
    );
}
```

---

### app/api/whatsapp/exchange-code/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

const META_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || "v24.0";
const META_APP_ID = process.env.META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

type Body = {
    code: string;
    waba_id?: string | null;
    phone_number_id?: string | null;
    business_id?: string | null;
};

export async function POST(req: NextRequest) {
    try {
        const { code, waba_id, phone_number_id, business_id } = (await req.json()) as Body;
        if (!code)
            return NextResponse.json({ error: "Falta code" }, { status: 400 });

        // 1) Intercambiar el code por access_token
        const url = new URL(
            `https://graph.facebook.com/${META_VERSION}/oauth/access_token`
        );
        url.searchParams.set("client_id", META_APP_ID);
        url.searchParams.set("client_secret", META_APP_SECRET);
        url.searchParams.set("code", code);

        const tokenRes = await fetch(url.toString(), { method: "GET" });
        const tokenJson = await tokenRes.json();
        if (!tokenRes.ok || !tokenJson?.access_token) {
            return NextResponse.json(
                { error: "Intercambio fallido", details: tokenJson },
                { status: 500 }
            );
        }

        const accessToken = tokenJson.access_token as string;
        const token_type = tokenJson.token_type as string | undefined;

        // 2) Construir el resumen a enviar por WhatsApp
        const maskedToken =
            accessToken.length > 10
                ? `${accessToken.slice(0, 4)}…${accessToken.slice(-6)}`
                : "***";

        // 5) Registrar integración en backend externo (server-side, seguro)
        const INTEGRATIONS_ENDPOINT =
            process.env.AGENTIK_INTEGRATIONS_ENDPOINT ||
            "https://agentik.config.54.90.172.124.sslip.io/api/integrations/whatsapp";

        const DEFAULT_TENANT_ID =
            process.env.DEFAULT_TENANT_ID ||
            "b2c58ae4-b79d-4e1b-840e-75c9cd2cd556";

        // Permitir override del tenant via header entrante
        const tenantId = DEFAULT_TENANT_ID;

        // ✅ VALIDAR que los campos requeridos existan
        if (!business_id) {
            console.error("❌ business_id faltante en el request");
            return NextResponse.json(
                { error: "business_id es requerido" },
                { status: 400 }
            );
        }
        if (!waba_id) {
            console.error("❌ waba_id faltante en el request");
            return NextResponse.json(
                { error: "waba_id es requerido" },
                { status: 400 }
            );
        }

        // ✅ Construir body correctamente - NO usar || undefined
        const registrationBody: Record<string, any> = {
            business_id: business_id,
            waba_id: waba_id,
            status: "ACTIVE",
            access_token: accessToken,
            token_type: token_type || "bearer",
        };
        
        // Agregar phone_number_id solo si existe
        if (phone_number_id) {
            registrationBody.phone_number_id = phone_number_id;
        }

        // 🔍 Log para debugging
        console.log("📤 Enviando a backend Agentik:", {
            endpoint: INTEGRATIONS_ENDPOINT,
            tenantId,
            body: registrationBody,
        });

        const regRes = await fetch(INTEGRATIONS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": tenantId,
            },
            body: JSON.stringify(registrationBody),
        });
        const regJson = await regRes.json().catch(() => ({}));

        // 🔍 Log de la respuesta
        console.log("📥 Respuesta del backend Agentik:", {
            status: regRes.status,
            ok: regRes.ok,
            response: regJson,
        });

        // 6) Responder agregando resultados del envío WhatsApp y del registro externo
        const responsePayload: Record<string, any> = {
            ok: true,
            token_type,
            access_token: accessToken,
            masked_access_token: maskedToken,
            registrationForward: regRes.ok ? "sent" : "failed",
            registrationResponse: regJson,
        };

        return NextResponse.json(responsePayload, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Error inesperado" },
            { status: 500 }
        );
    }
}
```

---

## Resolución de Problemas Comunes

### 1. "El SDK de Facebook aún no está listo"

**Causa**: El SDK no ha terminado de cargar cuando el usuario hace clic.

**Solución**: 
- Espera unos segundos y vuelve a intentar
- Verifica que `NEXT_PUBLIC_FB_APP_ID` esté configurado correctamente
- Abre la consola del navegador y verifica si hay errores

---

### 2. "business_id es requerido" en el backend

**Causa**: Race condition - el `FB.login` callback se ejecuta antes de recibir el `postMessage`.

**Solución**: Ya implementada con el `useEffect` de sincronización que espera a que TODOS los valores estén disponibles.

---

### 3. "Intercambio fallido" en el backend

**Causas posibles**:
- `META_APP_SECRET` incorrecto
- `code` ya fue usado (los codes son de un solo uso)
- App ID no coincide

**Solución**:
- Verifica las credenciales en `.env`
- Revisa los logs del servidor para ver el error exacto de Facebook
- Genera un nuevo code volviendo a hacer el flujo de signup

---

### 4. Access Token no se muestra en la UI

**Causa**: El endpoint `/api/whatsapp/exchange-code` está fallando.

**Solución**:
- Abre la consola del navegador (F12) y revisa la pestaña "Network"
- Busca la llamada a `/api/whatsapp/exchange-code` y ve la respuesta
- Revisa los logs del servidor (terminal donde corre `npm run dev`)

---

### 5. El registro en Agentik falla

**Causas posibles**:
- Endpoint de Agentik incorrecto
- `x-tenant-id` inválido
- Backend de Agentik tiene validaciones diferentes

**Solución**:
- Verifica `AGENTIK_INTEGRATIONS_ENDPOINT` en `.env`
- Revisa los logs del servidor para ver el payload exacto que se envía
- Compara el payload con lo que espera tu backend de Agentik
- Verifica que el header `x-tenant-id` sea correcto

---

## Mejores Prácticas

1. **Nunca expongas el `META_APP_SECRET`** - Solo usa `NEXT_PUBLIC_*` para variables que pueden ser públicas
2. **Valida TODOS los inputs** en el backend antes de usarlos
3. **Implementa rate limiting** en tu endpoint de exchange-code para evitar abuso
4. **Guarda los access tokens de forma segura** en tu backend (encriptados)
5. **Implementa manejo de errores robusto** en cada paso del flujo
6. **Logea TODO** en desarrollo, pero limita los logs en producción (nunca logues tokens completos)

---

## Conclusión

Esta implementación proporciona un flujo completo y robusto para integrar WhatsApp Business usando el Embedded SignUp de Facebook. El uso de `useEffect` para sincronizar los eventos asíncronos evita race conditions y asegura que todos los datos necesarios estén disponibles antes de enviar al backend.

**Ventajas de esta arquitectura**:
- ✅ Maneja race conditions correctamente
- ✅ Separa responsabilidades (frontend/backend)
- ✅ Mantiene el `app_secret` seguro (solo en servidor)
- ✅ Valida datos en cada paso
- ✅ Proporciona debugging fácil con logs
- ✅ Escalable para multi-tenancy

Para cualquier duda o problema, revisa los logs del navegador (`console.log`) y del servidor, donde encontrarás información detallada de cada paso del flujo.
