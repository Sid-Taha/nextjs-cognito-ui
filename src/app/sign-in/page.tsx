// src\app\sign-in\page.tsx
import SignInForm from "@/components/sign-in-form"
import AuthLayout from "@/components/auth-layout"

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  )
}
