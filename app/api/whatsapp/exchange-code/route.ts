import { NextRequest, NextResponse } from "next/server";

const META_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || "v24.0";
const META_APP_ID = process.env.META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

// Fallbacks para envío
const DEFAULT_SENDER_PHONE_ID = process.env.META_ID_NUMBER; // phone_number_id
const INFO_RECEIVER_NUMBER = process.env.USER_RECEIVE_INFO_NUMBER; // E.164 sin '+'

type Body = {
    code: string;
    waba_id?: string | null;
    phone_number_id?: string | null;
};

function normalizeE164NoPlus(n?: string | null) {
    if (!n) return null;
    // El endpoint acepta dígitos; quitamos espacios, + y otros símbolos.
    return n.replace(/[^\d]/g, "");
}

export async function POST(req: NextRequest) {
    try {
        const { code, waba_id, phone_number_id } = (await req.json()) as Body;
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
        const expiresIn = tokenJson.expires_in as number | undefined;

        // 2) Construir el resumen a enviar por WhatsApp
        const maskedToken =
            accessToken.length > 10
                ? `${accessToken.slice(0, 4)}…${accessToken.slice(-6)}`
                : "***";

        const bodyLines = [
            "✅ *Embedded Signup completado*",
            "",
            `• WABA ID: ${waba_id || "—"}`,
            `• Phone Number ID: ${
                phone_number_id || DEFAULT_SENDER_PHONE_ID || "—"
            }`,
            `• Access Token: ${maskedToken}`,
            `• Expira en (s): ${expiresIn ?? "—"}`,
            "",
            "_Este mensaje fue enviado automáticamente por el backend._",
        ];
        const textBody = bodyLines.join("\n");

        // 3) Elegir el sender (phone_number_id) para el POST /messages
        const senderPhoneId = (
            phone_number_id ||
            DEFAULT_SENDER_PHONE_ID ||
            ""
        ).trim();
        if (!senderPhoneId) {
            // No podemos enviar si no tenemos un phone_number_id válido
            return NextResponse.json({
                ok: true,
                warning:
                    "No se envió WhatsApp: falta phone_number_id (ni evento ni META_ID_NUMBER).",
                tenantId: "TENANT_ID_EXAMPLE",
                expiresIn,
            });
        }

        // 4) Enviar mensaje de WhatsApp (texto) usando el token recién obtenido
        //    Nota: Para enviar "text" se requiere ventana de 24h abierta.
        //    Como lo enviarás a tu propio número, suele estar OK; si no, usa plantilla.
        const to = normalizeE164NoPlus(INFO_RECEIVER_NUMBER);
        if (!to) {
            return NextResponse.json({
                ok: true,
                warning:
                    "No se envió WhatsApp: USER_RECEIVE_INFO_NUMBER inválido.",
                tenantId: "TENANT_ID_EXAMPLE",
                expiresIn,
            });
        }

        const sendUrl = `https://graph.facebook.com/${META_VERSION}/${DEFAULT_SENDER_PHONE_ID}/messages`;
        const sendPayload = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: textBody },
        };

        const sendRes = await fetch(sendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sendPayload),
        });

        const sendJson = await sendRes.json();

        // Si falla por la ventana de 24h (o falta opt-in), te devolverá error 470 u otros.
        // Puedes controlar aquí un fallback a TEMPLATE si quieres.
        if (!sendRes.ok) {
            return NextResponse.json(
                {
                    ok: true,
                    tenantId: "TENANT_ID_EXAMPLE",
                    expiresIn,
                    access_token: accessToken,
                    masked_access_token: maskedToken,
                    whatsappSend: "failed",
                    sendError: sendJson,
                },
                { status: 200 }
            );
        }

        return NextResponse.json({
            ok: true,
            tenantId: "TENANT_ID_EXAMPLE",
            expiresIn,
            access_token: accessToken,
            masked_access_token: maskedToken,
            whatsappSend: "sent",
            sendResponse: sendJson,
        });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Error inesperado" },
            { status: 500 }
        );
    }
}
