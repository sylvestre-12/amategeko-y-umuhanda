import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const formatPhoneVariants = (phone: string): string[] => {
  if (phone.startsWith('07')) {
    return [phone, '+250' + phone.slice(1)];
  } else if (phone.startsWith('+250')) {
    return ['0' + phone.slice(4), phone];
  }
  return [phone];
};

export async function POST(req: Request) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: 'Phone, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const phoneVariants = formatPhoneVariants(phone);

    // ✅ Find verified OTP with both local and international phone formats
    const latestOtp = await prisma.oTP.findFirst({
      where: {
        phone: { in: phoneVariants },
        otp,
        verified: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestOtp) {
      return NextResponse.json({ error: 'Invalid or unverified OTP' }, { status: 401 });
    }

    // ✅ Optional: Check if OTP is expired (e.g., 20 minutes)
    const expiry = new Date(latestOtp.createdAt.getTime() + 5 * 60 * 1000);
    if (new Date() > expiry) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update user password with any matching format
    const updated = await prisma.user.updateMany({
      where: {
        phone: { in: phoneVariants },
      },
      data: {
        password: hashedPassword,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Password reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
