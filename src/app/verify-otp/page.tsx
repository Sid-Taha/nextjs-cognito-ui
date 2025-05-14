// src\app\verify-otp\page.tsx
import { Suspense } from 'react'
import AuthLayout from "@/components/auth-layout"
import ClientOtpWrapper from '@/components/client-otp-wrapper'

export default function VerifyOtpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading verification form...</div>}>
        <ClientOtpWrapper />
      </Suspense>
    </AuthLayout>
  )
}