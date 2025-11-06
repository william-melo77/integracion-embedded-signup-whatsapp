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
