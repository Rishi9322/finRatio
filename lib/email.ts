export async function sendOTPEmail(email: string, otp: string) {
  // Use Nodemailer or Resend
  // For local development, simply log it if no API key is present
  console.log(`\n\n=== EMAIL TO: ${email} ===\nYour OTP code is: ${otp}\n=============================\n`);
  
  if (process.env.RESEND_API_KEY) {
    // Implement Resend logic here
    console.log("Sending via Resend...");
  }
  return true;
}
