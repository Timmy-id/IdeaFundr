import nodemailer from 'nodemailer';
import { SERVICE, EMAIL_PASS, EMAIL_USER } from '../config';
import { AppError } from './appError';

const transporter = nodemailer.createTransport({
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  service: SERVICE
});

export async function sendMail(email: string, subject: string, message: string) {
  const mailOptions = {
    from: `IdeaFundr ${EMAIL_USER as string}`,
    to: email,
    subject,
    html: message
  };
  transporter.sendMail(mailOptions, function (error, result) {
    if (error !== null) {
      throw new AppError(400, error.message);
    }
    return result;
  });
}
