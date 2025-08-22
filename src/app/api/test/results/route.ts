import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') || '0');

  if (!userId) {
    return NextResponse.json({ error: 'Missing or invalid userId' }, { status: 400 });
  }

  try {
    const lastAttempt = await prisma.attempt.findFirst({
      where: { userId },
      orderBy: { finishedAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!lastAttempt) {
      return NextResponse.json({ error: 'No attempts found for this user' }, { status: 404 });
    }

    return NextResponse.json({
      score: lastAttempt.score,
      name: lastAttempt.user.fullName,
      phone: lastAttempt.user.phone,
    });
  } catch (error) {
    console.error('Failed to fetch latest attempt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
