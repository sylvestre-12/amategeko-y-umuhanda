import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/sendEmail'; // or sendSMS

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize both local and international phone formats
    const internationalPhone = phone.startsWith('07') ? '+250' + phone.slice(1) : phone;

    // Find the user using either format
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },                // e.g., 0786278953
          { phone: internationalPhone }, // e.g., +250786278953
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the database
    await prisma.oTP.create({
      data: {
        phone: user.phone, // Store as it is in DB
        otp,
      },
    });

    // Send OTP to email (or SMS)
    if (user.email) {
      await sendOtpEmail(user.email, otp);
      console.log('✅ OTP sent via email to:', user.email);
    } else {
      console.warn('⚠️ User has no email. Cannot send OTP.');
      return NextResponse.json(
        { error: 'User has no email. Cannot send OTP.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'OTP sent for password reset' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
