"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { confirmForgotPassword } from "@/lib/aws/cognito"

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await confirmForgotPassword(email, code, newPassword)
      setIsSuccess(true)
      toast({
        title: "Password Reset Successful",
        description: "You can now sign in with your new password",
      })
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center tracking-tight">Password Reset</h1>
          <p className="text-center text-sm text-muted-foreground">
            Your password has been successfully changed.
          </p>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Link href="/sign-in" className="w-full">
            <Button variant="default" className="w-full h-11 font-medium">
              Go to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">Set New Password</h1>
        <p className="text-center text-sm text-muted-foreground">
          Enter your email, the code you received, and your new password
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button
            type="submit"
            className={cn("w-full h-11 font-medium", "bg-gradient-to-r from-primary to-primary/90")}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
          <Link href="/sign-in" className="w-full">
            <Button type="button" variant="ghost" className="w-full h-11 font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}