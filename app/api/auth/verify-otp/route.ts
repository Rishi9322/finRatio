import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, otp } = result.data;

    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otpCode !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Mark user as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });

    // Create session
    const token = await createSession(user.id);
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ message: "Verification successful" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
