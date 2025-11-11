import nodemailer from "nodemailer";
import path from "path";

export async function sendResetEmail(to: string, resetLink: string) {

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Mail credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoPath = path.join(process.cwd(), "public", "NoPass.png");

  const htmlContent = `
  <div style="background:#f7f7f7; padding-bottom:40px; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:32px; border-radius:12px; border:1px solid #e5e5e5;">

    <!-- Logo -->
      <div style="text-align:center; margin-bottom:24px;">
        <img src="cid:nopasslogo" alt="NoPass Logo" style="width:80px; height:auto;" />
      </div>
      
      <h2 style="margin:0; font-size:28px; font-weight:700; color:#111111;">NoPass Password Reset</h2>
      <p style="margin-top:12px; font-size:16px; color:#444;">
        You've requested to reset your NoPass account password.  
        Click the button below to securely proceed.
      </p>

      <a href="${resetLink}" 
         style="display:inline-block; margin-top:24px; padding:14px 26px; background:#ff7a45; color:#ffffff; font-size:16px; font-weight:600; border-radius:8px; text-decoration:none;">
         Reset Password
      </a>

      <p style="margin-top:30px; font-size:15px; color:#555;">
        If you did not request this, you can safely ignore this email.  
        Your account is secure.
      </p>

      <hr style="border:none; border-top:1px solid #e5e5e5; margin:40px 0;"/>

      <p style="font-size:13px; color:#888;">
        This link will expire in <strong>1 hour</strong> for security reasons.
      </p>

      <p style="font-size:13px; margin-top:4px; color:#888;">
        Need help? Contact support: 
        <a href="mailto:support@nopass.app" style="color:#ff7a45;">support@nopass.app</a>
      </p>

    </div>

    <p style="text-align:center; margin-top:18px; font-size:12px; color:#999;">
      &nbsp;Copyright © ${new Date().getFullYear()} NoPass. All Rights Reserved.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"NoPass Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your NoPass account password",
    html: htmlContent,
    attachments: [
      {
        filename: "NoPass.png",
        path: logoPath,
        cid: "nopasslogo",
      },
    ],
  });
}