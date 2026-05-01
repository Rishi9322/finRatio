import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { calculatorType = "PID", inputs, results } = await request.json();

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
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
      throw new Error(`OpenRouter API error: ${openRouterRes.statusText}`);
    }

    const data = await openRouterRes.json();
    let messageContent = data.choices[0].message.content;
    
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
