// src\app\verify-otp\page.tsx
import { Suspense } from 'react'
import AuthLayout from "@/components/auth-layout"

// Import dynamically with next/dynamic to disable SSR for this component
import dynamic from 'next/dynamic'

// Import with SSR disabled
const OtpVerificationForm = dynamic(
  () => import('@/components/otp-verification-form'),
  { ssr: false }
)

// Or alternatively use a loading fallback
export default function VerifyOtpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading verification form...</div>}>
        <OtpVerificationForm />
      </Suspense>
    </AuthLayout>
  )
}