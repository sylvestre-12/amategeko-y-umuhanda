import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userIdStr = url.searchParams.get('userId');

    // Validate userId presence and format
    if (!userIdStr) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check user's attempts count
    const attemptsCount = await prisma.testHistory.count({
      where: { userId },
    });

    // Block if user is not admin and attempts >= 2
    if (!user.isAdmin && attemptsCount >= 2) {
      return NextResponse.json(
        {
          error:
            '⚠️ You are allowed only 2 attempts. Please pay 5000 RWF to 0786278953 to continue.',
        },
        { status: 403 }
      );
    }

    // Fetch questions and shuffle
    const questions = await prisma.question.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    const shuffled = questions.sort(() => 1 - Math.random()).slice(0, 20);

    return NextResponse.json({ questions: shuffled });
  } catch (err) {
    console.error('Start test error:', err);
    return NextResponse.json({ error: '⚠️ You are allowed only 2 attempts for ezam. Please pay 5000 RWF to 0786278953 to continue.' }, { status: 500 });
  }
}
