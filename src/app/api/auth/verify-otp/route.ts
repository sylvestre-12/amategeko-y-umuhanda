import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // Format phone (if needed)
    const formattedPhone = phone.startsWith('07') ? '+250' + phone.slice(1) : phone;

    // Fetch OTP from DB
   const localPhone = phone.startsWith('+250') ? '0' + phone.slice(4) : phone;
const internationalPhone = phone.startsWith('07') ? '+250' + phone.slice(1) : phone;

const otpRecord = await prisma.oTP.findFirst({
  where: {
    phone: {
      in: [localPhone, internationalPhone],
    },
    otp,
    verified: false,
  },
  orderBy: { createdAt: 'desc' },
});

    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP found for this phone number' }, { status: 404 });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check if OTP expired (20 minutes)
    const expiry = new Date(otpRecord.createdAt.getTime() + 20 * 60 * 1000);
    if (new Date() > expiry) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Optional: Invalidate OTP
  await prisma.oTP.update({
  where: { id: otpRecord.id },  // Use unique id here
  data: { verified: true },
});

    // Fetch the user


const user = await prisma.user.findFirst({
  where: {
    OR: [
      { phone: localPhone },
      { phone: internationalPhone },
    ],
  },
});


    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
