// File: /app/api/history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // get userId from query params
    const userIdStr = req.nextUrl.searchParams.get('userId');

    if (!userIdStr) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid User ID' },
        { status: 400 }
      );
    }

    // fetch history
    const history = await prisma.testHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error('[HISTORY_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  } finally {
    // cleanup prisma connection
    await prisma.$disconnect();
  }
}
