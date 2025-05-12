"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Cognito configuration
const poolData = {
  UserPoolId: 'us-east-1_iVomSPj8O',
  ClientId: '38f5ummg4pu7le5rsdegepsmd5',
};
const userPool = new CognitoUserPool(poolData);

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.acceptTerms) {
      setError("Please fill all required fields and accept the terms.")
      setIsLoading(false)
      toast({
        title: "Registration failed",
        description: "Please fill all required fields and try again.",
        variant: "destructive",
      })
      return
    }

    // Prepare user attributes
    const attributeList = []
    const emailAttribute = new CognitoUserAttribute({
      Name: 'email',
      Value: formData.email,
    })
    attributeList.push(emailAttribute)

    // Sign up user with Cognito
    userPool.signUp(
      formData.name, 
      formData.password, 
      attributeList, 
      null, 
      (err, result) => {
        setIsLoading(false)

        if (err) {
          console.error(err.message || JSON.stringify(err))
          setError(err.message || "An error occurred during registration")
          toast({
            title: "Registration failed",
            description: err.message || "An error occurred during registration",
            variant: "destructive",
          })
          return
        }

        console.log('User successfully signed up:', result)
        toast({
          title: "Account created",
          description: "Please verify your email to continue.",
        })
        
        // Redirect to OTP verification page with both email and username
        router.push(
          "/verify-otp?" + 
          new URLSearchParams({
            email: formData.email,
            username: formData.name
          }).toString()
        )
      }
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center tracking-tight">Create an account</h1>
        <p className="text-center text-sm text-muted-foreground">Enter your details to create your account</p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="johndoe"
              value={formData.name}
              onChange={handleChange}
              className="h-11 transition-all border-slate-200 dark:border-slate-800"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="h-11 transition-all border-slate-200 dark:border-slate-800"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
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
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: checked === true }))}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              required
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline underline-offset-4 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline underline-offset-4 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button
            type="submit"
            className={cn(
              "w-full h-11 font-medium transition-all",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}