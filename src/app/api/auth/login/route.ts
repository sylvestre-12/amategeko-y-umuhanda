import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/authMiddleware';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/sendEmail';
import { normalizePhone } from '@/lib/phoneUtils';
export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const phones = normalizePhone(phone);

    // Fetch user by either phone format
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: phones },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        password: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // // *** ADD THIS CHECK HERE ***
    // if (user.phone !== '0786278953') {
    //   return NextResponse.json(
    //     {
    //       error: 'Please contact support for help at 0786278953 via WhatsApp or 124tegeri@gmail.com',
    //     },
    //     { status: 403 }
    //   );
    // }

    // ADMIN login flow using OTP for specific number
    if (phones.includes('0786278953') || phones.includes('+250786278953')) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.oTP.create({
        data: {
          phone: user.phone,
          otp,
          verified: false,
        },
      });

      try {
        await sendOtpEmail('124tegeri@gmail.com', otp); // Always send to hardcoded email
        console.log('✅ OTP email sent to admin');
      } catch (error) {
        console.error('❌ Failed to send OTP:', error);
        return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
      }

      return NextResponse.json({ message: 'OTP sent to admin email' });
    }

    // CLIENT login flow
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ id: user.id, isAdmin: user.isAdmin });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
