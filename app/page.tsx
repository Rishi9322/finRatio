import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { ArrowRight, Calculator, FileText, History, Sparkles } from "lucide-react"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"

export default async function LandingPage() {
  const token = cookies().get("session")?.value
  let isLoggedIn = false
  if (token) {
    const payload = await verifySession(token)
    if (payload) isLoggedIn = true
  }

  const ctaLink = "/calculator"
  const ctaText = isLoggedIn ? "Go to Calculator" : "Open Calculator"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-20 pb-32 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Calculate your business <span className="text-primary">potential</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Advanced PID calculators and AI-driven financial insights for your growing enterprise. Make data-driven credit decisions instantly.
            </p>
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Powerful Features</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4">Everything you need to analyze business credit</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Calculator className="h-6 w-6 text-primary" />}
                title="Real-time Engine"
                description="Instant PID calculations with dynamic visual feedback and strict logical validation."
              />
              <FeatureCard 
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="PDF Export"
                description="Generate professional, branded reports of your calculations in one click."
              />
              <FeatureCard 
                icon={<History className="h-6 w-6 text-primary" />}
                title="Calculation History"
                description="Automatically save and revisit past evaluations securely in your dashboard."
              />
              <FeatureCard 
                icon={<Sparkles className="h-6 w-6 text-primary" />}
                title="AI Financial Analyst"
                description="Get intelligent risk scoring and credit recommendations powered by LLMs."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-[#0F172A] py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} FinRatio. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
      <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}
