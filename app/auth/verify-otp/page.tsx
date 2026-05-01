"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"

const verifySchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
})

type VerifyForm = z.infer<typeof verifySchema>

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Verification failed")
      }

      setSuccess("Account verified! Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">We&apos;ve sent a 6-digit code to <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span></p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enter 6-digit OTP</label>
          <input
            {...register("otp")}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-widest"
            placeholder="123456"
            maxLength={6}
          />
          {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors mt-6 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify & Sign In"}
        </button>
      </form>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyOTPContent />
        </Suspense>
      </div>
    </div>
  )
}
