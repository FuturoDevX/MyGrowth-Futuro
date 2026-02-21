import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: process.env.EMAIL_FROM!, to, subject, html });
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM ?? 'dev@local', to, subject, html });
}
