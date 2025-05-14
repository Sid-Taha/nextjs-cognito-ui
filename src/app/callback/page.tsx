// src\app\callback\page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  const exchangeCodeForToken = async (code: string) => {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", "38f5ummg4pu7le5rsdegepsmd5");
    params.append("code", code);
    params.append("redirect_uri", "https://nextjs-cognito-ui-aiyo.vercel.app/callback");

    const response = await fetch(
      "https://taha-ahmed-app-2.auth.us-east-1.amazoncognito.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    return response.json(); // returns { access_token, id_token, refresh_token }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      router.push(
        `/sign-in?error=${error}&description=${encodeURIComponent(
          errorDescription || ""
        )}`
      );
      return;
    }

    const savedState = sessionStorage.getItem("oauth_state");
    if (!savedState || state !== savedState) {
      router.push("/sign-in?error=invalid_state");
      return;
    }

    sessionStorage.removeItem("oauth_state");

    if (code) {
      // ⬇️ Use your token exchange function here
      exchangeCodeForToken(code)
        .then((tokens) => {
          console.log("Tokens received:", tokens);

          // Optionally store them
          localStorage.setItem("access_token", tokens.access_token);
          localStorage.setItem("id_token", tokens.id_token);

          router.push("/dashboard");
        })
        .catch((err) => {
          console.error("Token exchange failed", err);
          router.push("/sign-in?error=token_exchange_failed");
        });
    } else {
      router.push("/sign-in?error=no_code");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging you in...</h1>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
