// src\components\otp-verification-form.tsx
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Cognito configuration - same as in SignUpForm
const poolData = {
  UserPoolId: 'us-east-1_iVomSPj8O',
  ClientId: '38f5ummg4pu7le5rsdegepsmd5',
};
const userPool = new CognitoUserPool(poolData);

export default function OtpVerificationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const username = searchParams.get("username") || ""  // Get username from URL if available
  const { toast } = useToast()

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // Take only the last character if multiple are pasted
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setError("")

    // Get the username from the URL or email
    const userIdentifier = username || email

    if (!userIdentifier) {
      setError("Username is required to resend verification code")
      setIsResending(false)
      return
    }

    // Create Cognito user object
    const userData = {
      Username: userIdentifier,
      Pool: userPool,
    }
    const cognitoUser = new CognitoUser(userData)

    // Request new verification code
    cognitoUser.resendConfirmationCode((err, result) => {
      setIsResending(false)

      if (err) {
        console.error("Error resending code:", err)
        setError(err.message || "Failed to resend verification code")
        toast({
          title: "Failed to resend code",
          description: err.message || "An error occurred. Please try again.",
          variant: "destructive",
        })
        return
      }

      console.log("Code resent successfully:", result)
      toast({
        title: "OTP Resent",
        description: `A new verification code has been sent to ${email}`,
      })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const verificationCode = otp.join("")
    
    // Get the username from the URL or email
    const userIdentifier = username || email

    if (!userIdentifier) {
      setError("Username is required to verify your account")
      setIsLoading(false)
      return
    }

    // Create Cognito user object
    const userData = {
      Username: userIdentifier,
      Pool: userPool,
    }
    const cognitoUser = new CognitoUser(userData)

    // Confirm registration with code
    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      setIsLoading(false)

      if (err) {
        console.error("Verification error:", err)
        setError(err.message || "Verification failed")
        toast({
          title: "Verification Failed",
          description: err.message || "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        })
        return
      }

      console.log("Verification successful:", result)
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully.",
      })

      // Redirect to sign-in page or dashboard
      router.push("/sign-in")
    })
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">Verify your email</h1>
        <p className="text-center text-sm text-muted-foreground">
          We&apos;ve sent a 6-digit verification code to <span className="font-medium">{email || "your email"}</span>
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="h-14 w-14 text-center text-lg font-medium transition-all border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20"
                autoFocus={index === 0}
                disabled={isLoading}
                required
              />
            ))}
          </div>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary hover:underline underline-offset-4 transition-colors h-auto p-0"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Didn't receive the code? Resend"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button
            type="submit"
            className={cn(
              "w-full h-11 font-medium transition-all",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            )}
            disabled={isLoading || otp.some((digit) => !digit)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
          <Button type="button" variant="ghost" className="w-full h-11 font-medium" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}