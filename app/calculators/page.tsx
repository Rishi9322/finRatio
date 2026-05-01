import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { BarChart3, Calculator, Percent, ShieldAlert, Activity, DollarSign, Clock, LayoutDashboard, Wallet } from "lucide-react"

const calculators = [
  { name: "Debt Equity Ratio", href: "/calculators/debt-equity", icon: <BarChart3 className="w-6 h-6 text-primary" />, desc: "Measure financial leverage and solvency." },
  { name: "Quasi Debt Equity Ratio", href: "/calculators/quasi-debt-equity", icon: <ShieldAlert className="w-6 h-6 text-primary" />, desc: "Include unsecured loans in leverage analysis." },
  { name: "Current Ratio", href: "/calculators/current-ratio", icon: <Activity className="w-6 h-6 text-primary" />, desc: "Evaluate short-term liquidity." },
  { name: "DSCR", href: "/calculators/dscr", icon: <Percent className="w-6 h-6 text-primary" />, desc: "Debt Service Coverage Ratio analysis." },
  { name: "EBITDA", href: "/calculators/ebitda", icon: <DollarSign className="w-6 h-6 text-primary" />, desc: "Calculate operational profitability." },
  { name: "ISCR", href: "/calculators/iscr", icon: <Percent className="w-6 h-6 text-primary" />, desc: "Interest Service Coverage Ratio." },
  { name: "Ageing Analysis", href: "/calculators/ageing", icon: <Clock className="w-6 h-6 text-primary" />, desc: "Evaluate accounts receivable buckets." },
  { name: "Net Working Capital", href: "/calculators/net-working-capital", icon: <LayoutDashboard className="w-6 h-6 text-primary" />, desc: "Calculate operating liquidity." },
  { name: "Drawing Power", href: "/calculators/drawing-power", icon: <Wallet className="w-6 h-6 text-primary" />, desc: "Assess borrowing capacity against current assets." },
]

export default function CalculatorsIndex() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Financial Calculators Suite</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive set of tools to analyze business health, evaluate credit risk, and make data-driven financial decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <Link key={calc.name} href={calc.href} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col items-start h-full">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                {calc.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{calc.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{calc.desc}</p>
            </Link>
          ))}
          
          <Link href="/calculator" className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-all flex flex-col items-start h-full">
            <div className="bg-blue-100 dark:bg-blue-800/40 p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">PID Calculator</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Purchase Invoice Discounting benefit analysis.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
