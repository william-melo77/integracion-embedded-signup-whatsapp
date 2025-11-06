"use client";

import Script from "next/script";

export default function FbSdkLoader() {
    return (
        <Script
            id="fb-sdk"
            src="https://connect.facebook.net/en_US/sdk.js"
            strategy="afterInteractive"
            onLoad={() => {
                // @ts-ignore
                window.FB?.init({
                    appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
                    autoLogAppEvents: true,
                    xfbml: false,
                    version: "v24.0",
                });
            }}
        />
    );
}