// src\components\sign-in-form.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

// AWS Cognito setup - Updated with your new User Pool details
const poolData = {
  UserPoolId: "us-east-1_iVomSPj8O", // Your User Pool ID
  ClientId: "38f5ummg4pu7le5rsdegepsmd5", // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

// Cognito Hosted UI configuration
const cognitoConfig = {
  domain: "taha-ahmed-app-2.auth.us-east-1.amazoncognito.com",
  clientId: "38f5ummg4pu7le5rsdegepsmd5",
  redirectUri: "http://nextjs-cognito-ui-aiyo.vercel.app/callback",
};

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const signInUser = (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const user = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      user.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Sign-in successful:", result);
          setErrorMessage(null);
          toast({
            title: "Sign-in successful",
            description: "Welcome back!",
          });
          router.push("/dashboard");
          resolve();
        },
        onFailure: (err) => {
          console.error(
            "Error signing in:",
            err.message || JSON.stringify(err)
          );
          setErrorMessage("Incorrect username or password.");
          toast({
            title: "Sign in failed",
            description: "Incorrect credentials. Please try again.",
            variant: "destructive",
          });
          reject(err);
        },
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await signInUser(formData.username, formData.password);
    } catch (err) {
      console.error("Sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFederatedSignIn = (provider: string) => {
    const { domain, clientId, redirectUri } = cognitoConfig;
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const state = Math.random().toString(36).substring(2);

    const promptParam = provider === "Microsoft" ? "&prompt=select_account" : ""; 

    // Generate the sign-in URL with specified identity provider
    const loginUrl = `https://${domain}/oauth2/authorize?identity_provider=${provider}&response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=openid%20email%20profile&state=${state}${promptParam}`;

    // Store state for verification in callback
    sessionStorage.setItem("oauth_state", state);

    // Redirect to provider sign-in
    window.location.href = loginUrl;
  };

  const handleGoogleSignIn = () => {
    handleFederatedSignIn("Google");
  };

  const handleMicrosoftSignIn = () => {
    handleFederatedSignIn("Microsoft");
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">
          Welcome back
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="text-red-600 text-sm text-center">{errorMessage}</div>
        )}

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="h-11 transition-all border-slate-200 dark:border-slate-800"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="h-11 transition-all border-slate-200 dark:border-slate-800"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button
            type="submit"
            className={cn(
              "w-full h-11 font-medium transition-all",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex flex-col gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-2"
              onClick={handleMicrosoftSignIn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                className="h-5 w-5"
              >
                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
              </svg>
              Continue with Microsoft
            </Button>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}