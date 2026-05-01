import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, generateOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { z } from "zod";
import { cookies } from "next/headers";

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signinSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      // Send new OTP
      const otp = generateOTP();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: otp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      await sendOTPEmail(email, otp);
      return NextResponse.json({ error: "Email not verified", requiresVerification: true }, { status: 403 });
    }

    // Create session
    const token = await createSession(user.id);
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ message: "Sign in successful" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
