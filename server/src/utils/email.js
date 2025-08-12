/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission. */

// Placeholder email function - you'd implement with nodemailer or similar
export async function sendEmail({ to, subject, text, html }) {
  console.log('Email would be sent:', { to, subject });
  // In production, implement with nodemailer:
  // const transporter = nodemailer.createTransporter({...});
  // await transporter.sendMail({...});
  return true;
}