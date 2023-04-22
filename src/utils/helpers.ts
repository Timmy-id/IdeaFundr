import fs from 'fs';
import otp from 'otp-generator';
import cloudinary from './cloudinary';

interface IOptions {
  digits?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  specialChars?: boolean;
}

export function otpGenerator(length?: number, options?: IOptions) {
  return otp.generate(length, options);
}

export async function uploadToCloudinary(path: string, folderName: string) {
  const files = await cloudinary.uploader.upload(path, { folder: folderName });
  fs.unlinkSync(path);

  return { url: files.secure_url, publicId: files.public_id };
}

export function verifyEmailTemplate(name: string, otp: string) {
  return `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:10px auto;width:90%;padding:5px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00806e;text-decoration:none;font-weight:600">IdeaFundr</a>
                </div>
                <p style="font-size:1.1em; font-weight: bold;">Hi, ${name}</p>
                <p>Thank you for choosing IdeaFundr. Use the OTP to complete your registration. OTP is valid for 5 minutes.</p>
                <h2 style="background: #ff6b6b;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                <p style="font-size:0.9em;">Regards,<br />IdeaFundr</p>
            </div>
        </div>
    `;
}

export function emailVerifiedTemplate(name: string) {
  return `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:10px auto;width:90%;padding:5px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00806e;text-decoration:none;font-weight:600">IdeaFundr</a>
        </div>
        <p style="font-size:1.1em; font-weight: bold;">Hi, ${name}</p>
        <p>Your email has been verified successfully. Proceed to login.</p>
        <p>Thank you for choosing IdeaFundr.</p>
        <p style="font-size:0.9em;">Regards,<br />IdeaFundr</p>
      </div>
    </div>
  `;
}
