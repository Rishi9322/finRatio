"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Navbar } from "@/components/Navbar"
import { calculateAgeing } from "@/lib/financialCalculations"
import { Loader2, Calculator, Save } from "lucide-react"

const schema = z.object({
  bucket1: z.number().min(0, "Must be >= 0"),
  bucket2: z.number().min(0, "Must be >= 0"),
  bucket3: z.number().min(0, "Must be >= 0"),
  bucket4: z.number().min(0, "Must be >= 0"),
})

type Inputs = z.infer<typeof schema>

export default function AgeingAnalysisCalculator() {
  const { register, control, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { bucket1: 500000, bucket2: 200000, bucket3: 100000, bucket4: 50000 },
  })

  const formValues = useWatch({ control }) as Inputs
  const [results, setResults] = useState<{ total: number, percentageOver90: number, error: string | null } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleCalculate = () => {
    if (Object.keys(errors).length > 0) return
    const res = calculateAgeing(formValues.bucket1, formValues.bucket2, formValues.bucket3, formValues.bucket4)
    setResults(res)
  }

  const handleSave = async () => {
    if (!results || results.error) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorType: "Ageing Analysis",
          inputs: formValues,
          results: { netBenefit: results.total },
        }),
      })

      if (response.ok) {
        setSaveMessage("Saved to dashboard!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveMessage("Failed to save.")
      }
    } catch (_) {
      setSaveMessage("Error saving.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" />
            Ageing Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Evaluate accounts receivable buckets to identify collection risks and cash flow bottlenecks.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Receivables Buckets (₹)</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">0 - 30 Days</label>
                <input type="number" {...register("bucket1", { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                {errors.bucket1 && <p className="mt-1 text-sm text-red-500">{errors.bucket1.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">31 - 60 Days</label>
                <input type="number" {...register("bucket2", { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                {errors.bucket2 && <p className="mt-1 text-sm text-red-500">{errors.bucket2.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">61 - 90 Days</label>
                <input type="number" {...register("bucket3", { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                {errors.bucket3 && <p className="mt-1 text-sm text-red-500">{errors.bucket3.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">90+ Days (High Risk)</label>
                <input type="number" {...register("bucket4", { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                {errors.bucket4 && <p className="mt-1 text-sm text-red-500">{errors.bucket4.message}</p>}
              </div>

              <button type="button" onClick={handleCalculate} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-colors">
                Analyze Receivables
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Analysis Results</h2>
            {!results ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4 py-12">
                <Calculator className="w-16 h-16 opacity-50" />
                <p>Enter your bucket figures and calculate to see the analysis.</p>
              </div>
            ) : results.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                {results.error}
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Receivables</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white mb-4">₹{results.total.toLocaleString()}</p>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">High Risk Receivables (90+ Days)</p>
                  <p className={`text-2xl font-bold ${results.percentageOver90 > 15 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {results.percentageOver90.toFixed(2)}%
                  </p>
                </div>
                
                <div className="pt-6 mt-auto">
                  <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? "Saving..." : "Save to Dashboard"}
                  </button>
                  {saveMessage && <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">{saveMessage}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
