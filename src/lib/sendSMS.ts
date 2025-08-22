import twilio from 'twilio';
import nodemailer from 'nodemailer';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.OTP_PHONE!;
const useTwilio = process.env.USE_TWILIO === 'true';

const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendSMS(to: string, message: string, email?: string): Promise<boolean> {
  if (!useTwilio) {
    if (!email) {
      console.error('❌ Email address is required to send OTP via email');
      return false;
    }
    try {
      const info = await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        text: message,
      });
      console.log('✅ OTP email sent:', info.messageId);
      return true;
    } catch (err) {
      console.error('❌ Failed to send OTP email:', err);
      return false;
    }
  }

  // send SMS via Twilio
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    console.log('✅ SMS sent with SID:', result.sid);
    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return false;
  }
}
