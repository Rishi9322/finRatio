"use client"

import { useState, useRef, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Navbar } from "@/components/Navbar"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { PlayCircle, Download, Save, Sparkles, AlertCircle } from "lucide-react"

type Inputs = {
  businessType: string
  annualSales: number
  annualPurchases: number
  grossMargin: number
  supplierCreditDays: number
  pidLimit: number
  pidCostPercent: number
  cashDiscount: number
  workingCapitalDays: number
}

type AIResult = {
  summary: string
  healthScore: "Strong" | "Moderate" | "Weak"
  risks: string[]
  insights: string[]
  recommendations: string[]
  verdict: string
}

export default function CalculatorPage() {
  const { register, control, getValues } = useForm<Inputs>({
    defaultValues: {
      businessType: "retail",
      annualSales: 10000000,
      annualPurchases: 8000000,
      grossMargin: 20,
      supplierCreditDays: 30,
      pidLimit: 1000000,
      pidCostPercent: 12,
      cashDiscount: 2,
      workingCapitalDays: 60,
    }
  })

  const formValues = useWatch({ control }) as Inputs
  const [results, setResults] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    calculateResults(formValues)
  }, [formValues])

  const calculateResults = (vals: Inputs) => {
    try {
      const {
        grossMargin,
        supplierCreditDays,
        pidLimit,
        pidCostPercent,
        cashDiscount,
        workingCapitalDays
      } = vals

      const gapDays = workingCapitalDays - supplierCreditDays
      if (gapDays <= 0) {
        setError("Working capital days must be greater than supplier credit days (Gap Days > 0).")
        setResults(null)
        return
      }
      
      setError(null)
      const pidRotation = 365 / gapDays
      const purchaseSupported = pidLimit * pidRotation
      const salesGenerated = purchaseSupported / (1 - (grossMargin || 0) / 100)
      const additionalProfit = salesGenerated * ((grossMargin || 0) / 100)
      const pidCost = pidLimit * ((pidCostPercent || 0) / 100)
      const cashBenefit = purchaseSupported * ((cashDiscount || 0) / 100)
      const netBenefit = additionalProfit - pidCost + cashBenefit

      setResults({
        gapDays,
        pidRotation,
        purchaseSupported,
        salesGenerated,
        additionalProfit,
        pidCost,
        cashBenefit,
        netBenefit
      })
      
      // Clear AI analysis when inputs change
      setAiAnalysis(null)
    } catch (_) {
      // ignore
    }
  }

  const formatCurr = (val: number) => {
    if (isNaN(val) || !isFinite(val)) return "₹0.00"
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: getValues("businessType"),
          inputs: getValues(),
          results
        })
      })
      if (res.ok) {
        alert("Calculation saved successfully!")
      } else {
        alert("Failed to save. Make sure you are signed in.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!resultsRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(resultsRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('FinRatio_Calculation.pdf')
    } finally {
      setIsExporting(false)
    }
  }

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: getValues(),
          results
        })
      })
      const data = await res.json()
      setAiAnalysis(data)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">PID Calculator</h1>
          <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold mb-2">What is this calculator?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                The Purchase Invoice Discounting (PID) Calculator helps you evaluate the net financial benefit of utilizing a PID facility. By entering your business metrics, it computes your working capital gap, potential purchase support, generated sales, and the ultimate net profit after factoring in PID costs and cash discounts.
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl aspect-video flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden group cursor-pointer">
              <PlayCircle className="w-16 h-16 text-primary mb-2 opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Watch Explainer Video</span>
              <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Input Panel */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Inputs</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Business Type</label>
                <select {...register("businessType")} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Annual Sales (₹)</label>
                  <input type="number" {...register("annualSales", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Purchases (₹)</label>
                  <input type="number" {...register("annualPurchases", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gross Margin (%)</label>
                  <input type="number" step="0.1" {...register("grossMargin", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cash Discount (%)</label>
                  <input type="number" step="0.1" {...register("cashDiscount", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supplier Credit (Days)</label>
                  <input type="number" {...register("supplierCreditDays", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Working Cap (Days)</label>
                  <input type="number" {...register("workingCapitalDays", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">PID Limit (₹)</label>
                  <input type="number" {...register("pidLimit", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">PID Cost (% pa)</label>
                  <input type="number" step="0.1" {...register("pidCostPercent", { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>
            </form>
          </div>

          {/* Right: Results Panel */}
          <div className="w-full lg:w-2/3 space-y-6">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl flex items-start gap-4">
                <AlertCircle className="text-red-500 w-6 h-6 mt-0.5" />
                <div>
                  <h3 className="text-red-800 dark:text-red-400 font-semibold mb-1">Invalid Configuration</h3>
                  <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            ) : results ? (
              <>
                <div ref={resultsRef} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calculation Results</h2>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={isSaving} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300" title="Save Calculation">
                        <Save className="w-5 h-5" />
                      </button>
                      <button onClick={handleExportPDF} disabled={isExporting} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300" title="Export PDF">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gap Days</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{results.gapDays} days</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">PID Rotation</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{results.pidRotation.toFixed(2)}x</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Purchase Supported</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{formatCurr(results.purchaseSupported)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Sales Generated</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurr(results.salesGenerated)}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Additional Profit</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{formatCurr(results.additionalProfit)}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Cash Benefit (Discount)</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">+{formatCurr(results.cashBenefit)}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">PID Cost</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-500">-{formatCurr(results.pidCost)}</p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">Net Benefit</p>
                      <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{formatCurr(results.netBenefit)}</p>
                    </div>
                    <button 
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </button>
                  </div>
                </div>

                {/* AI Insights Panel */}
                {aiAnalysis && (
                  <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-primary w-6 h-6" />
                        <h3 className="text-xl font-bold">AI Financial Analyst</h3>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        aiAnalysis.healthScore === "Strong" ? "bg-green-500/20 text-green-400" :
                        aiAnalysis.healthScore === "Moderate" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {aiAnalysis.healthScore} Health
                      </span>
                    </div>
                    <div className="p-6 grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Summary</h4>
                        <p className="text-slate-300 leading-relaxed mb-6">{aiAnalysis.summary}</p>
                        
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Verdict</h4>
                        <p className="text-lg font-medium text-white">{aiAnalysis.verdict}</p>
                      </div>
                      <div className="space-y-6">
                        {aiAnalysis.risks.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Risks Identified
                            </h4>
                            <ul className="space-y-2">
                              {aiAnalysis.risks.map((risk, i) => (
                                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">•</span> {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {aiAnalysis.recommendations.map((rec, i) => (
                              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span> {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
