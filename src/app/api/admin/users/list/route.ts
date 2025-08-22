import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[GET_USERS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Add new user
  try {
    const { fullName, phone, email, password, isAdmin } = await req.json();

    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: 'Full name, phone, and password are required' }, { status: 400 });
    }

    if (!/^07\d{8}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone must be 10 digits starting with 07' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        isAdmin: Boolean(isAdmin),
      },
    });

    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('[ADD_USER_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Update user
  try {
    const { id, fullName, phone, email, password, isAdmin } = await req.json();

    if (!id || !fullName || !phone) {
      return NextResponse.json({ error: 'ID, full name, and phone are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let hashedPassword = user.password;
    if (password && password.length >= 8) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        isAdmin: Boolean(isAdmin),
      },
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('[UPDATE_USER_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // Delete user
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE_USER_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
