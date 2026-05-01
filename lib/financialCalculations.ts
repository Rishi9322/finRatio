/**
 * Financial Calculations Shared Module
 */

export function calculateDebtEquity(totalDebt: number, totalEquity: number) {
  if (totalEquity === 0) return { ratio: 0, error: "Equity cannot be zero" }
  const ratio = totalDebt / totalEquity
  return { ratio, error: null }
}

export function interpretDebtEquity(ratio: number) {
  if (ratio < 1) return { score: "Strong", text: "Low leverage, highly solvent." }
  if (ratio <= 2) return { score: "Moderate", text: "Standard industry leverage." }
  return { score: "Weak", text: "High risk, over-leveraged." }
}

export function calculateQuasiDebtEquity(totalDebt: number, quasiDebt: number, totalEquity: number) {
  if (totalEquity === 0) return { ratio: 0, error: "Equity cannot be zero" }
  const ratio = (totalDebt + quasiDebt) / totalEquity
  return { ratio, error: null }
}

export function calculateCurrentRatio(currentAssets: number, currentLiabilities: number) {
  if (currentLiabilities === 0) return { ratio: 0, error: "Current Liabilities cannot be zero" }
  const ratio = currentAssets / currentLiabilities
  return { ratio, error: null }
}

export function calculateDSCR(noi: number, debtService: number) {
  if (debtService === 0) return { ratio: 0, error: "Debt Service cannot be zero" }
  const ratio = noi / debtService
  return { ratio, error: null }
}

export function interpretDSCR(ratio: number) {
  if (ratio < 1) return { score: "Weak", text: "Risky: Insufficient income to cover debt obligations." }
  if (ratio <= 1.5) return { score: "Moderate", text: "Adequate coverage." }
  return { score: "Strong", text: "Healthy: Strong income relative to debt." }
}

export function calculateEBITDA(revenue: number, operatingExpenses: number) {
  const ebitda = revenue - operatingExpenses
  return { ebitda, error: null }
}

export function calculateISCR(ebit: number, interestExpense: number) {
  if (interestExpense === 0) return { ratio: 0, error: "Interest Expense cannot be zero" }
  const ratio = ebit / interestExpense
  return { ratio, error: null }
}

export function calculateNetWorkingCapital(currentAssets: number, currentLiabilities: number) {
  const nwc = currentAssets - currentLiabilities
  return { nwc, error: null }
}

export function calculateDrawingPower(eligibleStock: number, eligibleReceivables: number, marginPercent: number) {
  const dp = (eligibleStock + eligibleReceivables) * (1 - (marginPercent / 100))
  return { dp, error: null }
}

export function calculateAgeing(b1: number, b2: number, b3: number, b4: number) {
  const totalReceivables = b1 + b2 + b3 + b4
  // Basic interpretation logic based on proportion of old debt
  const percentageOver90 = totalReceivables > 0 ? (b4 / totalReceivables) * 100 : 0
  return { 
    total: totalReceivables, 
    percentageOver90,
    error: null 
  }
}
