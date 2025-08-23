import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userIdStr = url.searchParams.get('userId');

    // 🔹 Validate userId
    if (!userIdStr) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // 🔹 Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔹 Count past attempts
    const attemptsCount = await prisma.testHistory.count({
      where: { userId },
    });

    if (!user.isAdmin && attemptsCount >= 2) {
      return NextResponse.json(
        {
          error:
            '⚠️ You are allowed only 2 attempts. Please pay 5000 RWF to 0786278953 to continue.',
        },
        { status: 403 }
      );
    }

    // 🔹 Fetch random 20 questions
    const questions = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Question" ORDER BY RANDOM() LIMIT 20`
    );

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Start test error:', err);
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
