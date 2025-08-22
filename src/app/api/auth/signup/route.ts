// /app/api/auth/signup/route.ts or /pages/api/auth/signup.ts depending on your Next.js version

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const formatPhone = (phone: string): string => {
  if (phone.startsWith('07')) {
    return '+250' + phone.slice(1);
  }
  return phone;
};

export async function POST(req: Request) {
  try {
    const { fullName, phone, password, email } = await req.json();

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'Full name, phone, and password are required' },
        { status: 400 }
      );
    }

    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be 10 digits starting with 07' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhone(phone);

    const existingUser = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = formattedPhone === '+250786278953';

    const finalEmail = email || '124tegeri@gmail.com';

    const user = await prisma.user.create({
      data: {
        fullName,
        phone: formattedPhone,
        password: hashedPassword,
        email: finalEmail,
        isAdmin,
      },
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
