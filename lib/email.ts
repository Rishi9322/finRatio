import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOTPEmail(email: string, otp: string) {
  const subject = "Your FinRatio verification code";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">FinRatio verification code</h2>
      <p style="margin: 0 0 12px;">Your OTP code is:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 0 0 16px;">${otp}</div>
      <p style="margin: 0; color: #475569;">This code expires in 5 minutes.</p>
    </div>
  `;

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n\n=== EMAIL TO: ${email} ===\nSubject: ${subject}\nYour OTP code is: ${otp}\n=============================\n`);
  }

  if (resend) {
    const from = process.env.RESEND_FROM_EMAIL || "FinRatio <onboarding@resend.dev>";
    const result = await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    });

    if (result.error) {
      throw result.error;
    }

    return true;
  }

  return true;
}
