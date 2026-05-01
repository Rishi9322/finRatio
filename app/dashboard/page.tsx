"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { useRouter } from "next/navigation"

type Calculation = {
  id: string
  calculatorType: string
  businessType: string | null
  results: string
  createdAt: string
}

export default function DashboardPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/calculations")
        if (res.ok) {
          const data = await res.json()
          setCalculations(data)
        }
      } catch (err) {
        console.error("Failed to fetch history", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const totalCalculations = calculations.length
  const avgNetBenefit = calculations.length > 0 
    ? calculations.reduce((acc, curr) => {
        const resultsObj = JSON.parse(curr.results)
        return acc + (resultsObj.netBenefit || 0)
      }, 0) / calculations.length
    : 0

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <button 
            onClick={() => router.push("/calculator")}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            New Calculation
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Calculations</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{isLoading ? "-" : totalCalculations}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Avg Net Benefit</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">{isLoading ? "-" : formatCurrency(avgNetBenefit)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Calculation History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-4 px-6 font-medium text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">Date</th>
                  <th className="py-4 px-6 font-medium text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">Calculator Type</th>
                  <th className="py-4 px-6 font-medium text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 text-right">Net Benefit / Ratio</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-500">Loading...</td></tr>
                ) : calculations.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-500">No calculations yet.</td></tr>
                ) : (
                  calculations.map((calc) => {
                    const results = JSON.parse(calc.results)
                    return (
                      <tr 
                        key={calc.id} 
                        onClick={() => router.push(`/calculator?id=${calc.id}`)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
                          {new Date(calc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                          {calc.calculatorType}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-medium border-b border-slate-100 dark:border-slate-800 text-right">
                          {results.netBenefit !== undefined ? formatCurrency(results.netBenefit) : (results.ratio !== undefined ? results.ratio.toFixed(2) : '-')}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
