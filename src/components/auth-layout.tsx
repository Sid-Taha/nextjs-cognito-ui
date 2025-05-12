import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-primary/20 to-primary-foreground/20 blur-3xl opacity-50 dark:opacity-20" />

      <div className="w-full max-w-md relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl blur-xl" />
          <div className="relative bg-white dark:bg-slate-950 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 overflow-hidden">
            {children}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
