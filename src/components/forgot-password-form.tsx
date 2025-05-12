// src\components\forgot-password-form.tsx
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";

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
import { forgotPassword } from "@/lib/aws/cognito";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: "OTP sent",
        description: "Check your email for the verification code",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center tracking-tight">
            Check your email
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            We&apos;ve sent a verification code to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              If you don&apos;t see the email in your inbox, check your spam
              folder. The code will expire in 10 minutes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Link href="/reset-password" className="w-full">
            <Button variant="outline" className="w-full h-11 font-medium">
              Create a new password
            </Button>
          </Link>

          <Link href="/sign-in" className="w-full">
            <Button variant="ghost" className="w-full h-11 font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">
          Reset password
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a verification code
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 transition-all border-slate-200 dark:border-slate-800"
              required
            />
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
                Sending OTP...
              </>
            ) : (
              "Send OTP to email"
            )}
          </Button>
          <Link href="/sign-in" className="w-full">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
