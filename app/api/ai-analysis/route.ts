import { NextResponse } from "next/server";

type AnalysisResult = {
  summary: string;
  healthScore: "Strong" | "Moderate" | "Weak";
  risks: string[];
  insights: string[];
  recommendations: string[];
  verdict: string;
};

function buildFallbackAnalysis(calculatorType: string, inputs: unknown, results: unknown): AnalysisResult {
  const typedResults = (results ?? {}) as Record<string, unknown>;
  const gapDays = typeof typedResults.gapDays === "number" ? typedResults.gapDays : null;
  const ratio = typeof typedResults.ratio === "number" ? typedResults.ratio : null;
  const netBenefit = typeof typedResults.netBenefit === "number" ? typedResults.netBenefit : null;

  if (calculatorType === "PID") {
    const score = gapDays !== null && gapDays > 60 ? "Weak" : gapDays !== null && gapDays > 30 ? "Moderate" : "Strong";
    return {
      summary: "The PID profile looks manageable based on the current working-capital gap and benefit projection.",
      healthScore: score,
      risks: gapDays !== null && gapDays > 60 ? ["Working capital gap is stretched and may increase funding pressure."] : [],
      insights: [
        gapDays !== null ? `Gap days: ${gapDays.toFixed(0)}.` : "Gap days were not available for analysis.",
        netBenefit !== null ? `Estimated net benefit: ${netBenefit.toFixed(2)}.` : "Net benefit was not available for analysis.",
      ],
      recommendations: ["Review the facility size against cash conversion timing.", "Re-check pricing if the gap days continue to widen."],
      verdict: score === "Weak" ? "Conditionally approve" : "Approve",
    };
  }

  if (calculatorType === "DSCR") {
    const score = ratio !== null && ratio < 1 ? "Weak" : ratio !== null && ratio < 1.5 ? "Moderate" : "Strong";
    return {
      summary: "Coverage looks within an expected range for the current debt service profile.",
      healthScore: score,
      risks: ratio !== null && ratio < 1 ? ["Debt service coverage is below 1.0x."] : [],
      insights: [ratio !== null ? `Coverage ratio: ${ratio.toFixed(2)}x.` : "Coverage ratio was not available."],
      recommendations: ["Improve operating cash flow before adding more debt.", "Stress test the structure against lower collections."],
      verdict: score === "Weak" ? "Reject" : "Conditionally approve",
    };
  }

  return {
    summary: "The analysis completed using a local fallback because the external AI service was unavailable.",
    healthScore: "Moderate",
    risks: [],
    insights: ["A fallback rule-based assessment was used instead of the remote model."],
    recommendations: ["Retry the AI analysis once the external service is available."],
    verdict: "Conditionally approve",
  };
}

export async function POST(request: Request) {
  try {
    const { calculatorType = "PID", inputs, results } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(buildFallbackAnalysis(calculatorType, inputs, results));
    }

    const prompt = `
      You are a senior credit analyst at a top NBFC.
      You evaluate businesses for lending decisions.
      Be analytical, data-driven, and precise.
      Do not give generic advice.

      Calculator Type: ${calculatorType}
      Inputs: ${JSON.stringify(inputs)}
      Results: ${JSON.stringify(results)}
      
      RULES:
      - Interpret the metric specific to the Calculator Type.
      - If Debt Equity > 2 -> flag high risk.
      - If DSCR < 1 -> flag risky insufficient income.
      - If PID gapDays > 60 -> flag working capital stress.
      - If PID grossMargin < 8 -> flag low profitability.
      
      OUTPUT FORMAT:
      You MUST return exactly valid JSON matching this schema:
      {
        "summary": "String (1-2 sentences)",
        "healthScore": "String (Strong, Moderate, Weak)",
        "risks": ["Array of string risks"],
        "insights": ["Array of string insights"],
        "recommendations": ["Array of string actionable advice"],
        "verdict": "String (Approve, Reject, or conditionally approve)"
      }
    `;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free", // Using a free model as requested
        messages: [
          { role: "user", content: prompt }
        ]
      }),
    });

    if (!openRouterRes.ok) {
      return NextResponse.json(buildFallbackAnalysis(calculatorType, inputs, results));
    }

    const data = await openRouterRes.json();
    let messageContent = data?.choices?.[0]?.message?.content;

    if (!messageContent) {
      return NextResponse.json(buildFallbackAnalysis(calculatorType, inputs, results));
    }
    
    // Strip markdown formatting if the model wraps the JSON
    messageContent = messageContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const aiAnalysis = JSON.parse(messageContent);

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
