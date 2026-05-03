import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col gap-3 max-w-7xl">
        <div className="h-10 flex items-center justify-between md:h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">
              Fin<span className="text-primary">Ratio</span>
            </Link>
            <div className="hidden md:flex gap-4 items-center">
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Dashboard</Link>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1">
                  Calculators
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
                  <Link href="/calculator" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/50">PID Calculator</Link>
                  <Link href="/calculators" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">All Financial Calculators</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/signin" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/calculator" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </div>
      <details className="md:hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between">
          <span>Menu</span>
          <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <div className="flex flex-col px-2 pb-2">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">Dashboard</Link>
          <Link href="/calculator" className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">PID Calculator</Link>
          <Link href="/calculators" className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">All Financial Calculators</Link>
          <Link href="/auth/signin" className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">Sign In</Link>
        </div>
      </details>
    </nav>
  );
}
