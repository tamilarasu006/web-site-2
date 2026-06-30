const nodemailer = require('nodemailer');

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true for port 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Shared HTML shell ───────────────────────────────────────────────────────
const htmlShell = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TAMILARASU ENTERPRISES</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; color: #333; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a7a4a 0%, #0d5c37 100%); padding: 28px 32px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px; }
    .header p { margin: 6px 0 0; color: #a8e6c1; font-size: 13px; }
    .body { padding: 32px; }
    .body h2 { color: #1a7a4a; margin-top: 0; }
    .otp-box { background: #f0faf5; border: 2px dashed #1a7a4a; border-radius: 8px; text-align: center; padding: 20px; margin: 24px 0; }
    .otp-box .otp { font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #0d5c37; }
    .otp-box .expiry { font-size: 13px; color: #666; margin-top: 8px; }
    .btn { display: inline-block; background: #1a7a4a; color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 6px; font-size: 15px; font-weight: 600; margin: 16px 0; }
    .info-box { background: #f9f9f9; border-left: 4px solid #1a7a4a; padding: 14px 18px; border-radius: 0 6px 6px 0; margin: 20px 0; font-size: 14px; }
    .footer { background: #f4f6f8; padding: 20px 32px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e8e8e8; }
    .footer a { color: #1a7a4a; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🌿 TAMILARASU ENTERPRISES</h1>
      <p>Premium Fresh Produce | Global Quality</p>
    </div>
    <div class="body">${bodyContent}</div>
    <div class="footer">
      <p>No:02A, Muthurama Pillai Street, Uthiramerur, Kanchipuram (603406)</p>
      <p>📞 +91 6383772487 &nbsp;|&nbsp; ✉️ <a href="mailto:info@tamilarasuenterprises.com">info@tamilarasuenterprises.com</a></p>
      <p style="margin-top:10px;color:#bbb;">© ${new Date().getFullYear()} TAMILARASU ENTERPRISES. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function send(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — skipping email send.');
    return;
  }
  await transporter.sendMail({
    from: `"TAMILARASU ENTERPRISES" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Send a 6-digit OTP verification email.
 */
async function sendVerificationEmail(email, name, otp) {
  const body = `
    <h2>Verify Your Email Address</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for registering with TAMILARASU ENTERPRISES. Use the OTP below to complete your registration.</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
      <div class="expiry">⏱️ This code expires in <strong>15 minutes</strong></div>
    </div>
    <p>If you did not create an account, please ignore this email.</p>
    <div class="info-box">🔒 Never share this OTP with anyone. Our team will never ask for it.</div>
  `;
  await send(email, 'Verify your email — TAMILARASU ENTERPRISES', htmlShell(body));
}

/**
 * Send a welcome email after successful verification.
 */
async function sendWelcomeEmail(email, name) {
  const body = `
    <h2>Welcome to TAMILARASU ENTERPRISES! 🎉</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your email has been verified and your account is now fully active. You can now browse and order from our wide range of premium fresh produce.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products" class="btn">Start Shopping →</a>
    <div class="info-box">
      <strong>What's next?</strong><br/>
      Browse 20+ product categories from 50+ countries. Enjoy B2B discounts if you registered as a business buyer.
    </div>
    <p>If you have any questions, reply to this email or WhatsApp us at <strong>+91 6383772487</strong>.</p>
  `;
  await send(email, 'Welcome to TAMILARASU ENTERPRISES!', htmlShell(body));
}

/**
 * Send a password reset link email.
 */
async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const body = `
    <h2>Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <a href="${resetUrl}" class="btn">Reset Password →</a>
    <div class="info-box">
      ⏱️ This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
    </div>
    <p style="font-size:12px;color:#888;word-break:break-all;">Or copy this link: ${resetUrl}</p>
  `;
  await send(email, 'Password reset request — TAMILARASU ENTERPRISES', htmlShell(body));
}

/**
 * Send a login-alert email when a new login is detected.
 */
async function sendLoginAlertEmail(email, name, ip, time) {
  const body = `
    <h2>New Login Detected</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We noticed a new login to your TAMILARASU ENTERPRISES account.</p>
    <div class="info-box">
      📍 <strong>IP Address:</strong> ${ip}<br/>
      🕒 <strong>Time:</strong> ${new Date(time).toUTCString()}
    </div>
    <p>If this was you, no action is needed. If you don't recognize this login, please <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/forgot-password" style="color:#1a7a4a;">reset your password immediately</a>.</p>
  `;
  await send(email, 'New login to your account — TAMILARASU ENTERPRISES', htmlShell(body));
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLoginAlertEmail,
};
