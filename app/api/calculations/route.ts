import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const token = cookies().get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await verifySession(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const calculations = await prisma.calculation.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(calculations);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await verifySession(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { calculatorType = "PID", businessType = null, inputs, results } = body;

    const calculation = await prisma.calculation.create({
      data: {
        userId: payload.userId as string,
        calculatorType,
        businessType,
        inputs: JSON.stringify(inputs),
        results: JSON.stringify(results),
      },
    });

    return NextResponse.json({ success: true, calculation });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
