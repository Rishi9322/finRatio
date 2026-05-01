"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Navbar } from "@/components/Navbar"
import { calculateDSCR, interpretDSCR } from "@/lib/financialCalculations"
import { Loader2, Calculator, Save, Bot } from "lucide-react"

const schema = z.object({
  noi: z.number().min(0, "Must be >= 0"),
  debtService: z.number().min(1, "Debt Service must be > 0"),
})

type Inputs = z.infer<typeof schema>

export default function DSCRCalculator() {
  const { register, control, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { noi: 1500000, debtService: 1000000 },
  })

  const formValues = useWatch({ control }) as Inputs
  const [results, setResults] = useState<{ ratio: number, error: string | null } | null>(null)
  const [interpretation, setInterpretation] = useState<{ score: string, text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleCalculate = () => {
    if (Object.keys(errors).length > 0) return
    const res = calculateDSCR(formValues.noi, formValues.debtService)
    setResults(res)
    if (res.error === null) {
      setInterpretation(interpretDSCR(res.ratio))
    }
  }

  const handleSave = async () => {
    if (!results || results.error) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorType: "DSCR",
          inputs: formValues,
          results: { ratio: results.ratio },
        }),
      })

      if (response.ok) {
        setSaveMessage("Saved to dashboard!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveMessage("Failed to save.")
      }
    } catch {
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
            Debt Service Coverage Ratio (DSCR)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Evaluate whether a company has enough operating income to pay its debt obligations. 
            A DSCR &gt; 1 means the company has sufficient income to pay its current debt obligations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Financial Inputs</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Net Operating Income (NOI) (₹)</label>
                <input
                  type="number"
                  {...register("noi", { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors dark:text-white"
                />
                {errors.noi && <p className="mt-1 text-sm text-red-500">{errors.noi.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Debt Service (₹)</label>
                <input
                  type="number"
                  {...register("debtService", { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors dark:text-white"
                />
                {errors.debtService && <p className="mt-1 text-sm text-red-500">{errors.debtService.message}</p>}
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Calculate DSCR
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Analysis Results</h2>
            
            {!results ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4 py-12">
                <Calculator className="w-16 h-16 opacity-50" />
                <p>Enter your figures and calculate to see the analysis.</p>
              </div>
            ) : results.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                {results.error}
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Debt Service Coverage Ratio</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{results.ratio.toFixed(2)}x</p>
                </div>

                {interpretation && (
                  <div className={`p-4 rounded-xl border ${interpretation.score === 'Strong' ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300' : interpretation.score === 'Moderate' ? 'bg-yellow-50 border-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/50 dark:text-yellow-300' : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300'}`}>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Interpretation: {interpretation.score}
                    </h3>
                    <p className="text-sm opacity-90">{interpretation.text}</p>
                  </div>
                )}

                <div className="pt-6 mt-auto">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
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
