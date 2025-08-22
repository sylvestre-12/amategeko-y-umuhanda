import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameter
    const userIdStr = req.nextUrl.searchParams.get('userId');
    if (!userIdStr) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Count testHistory records for this user
    const count = await prisma.testHistory.count({
      where: { userId },
    });

    // Return count as JSON
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error in attempts API:', error);
    return NextResponse.json({ error: 'Failed to get attempts' }, { status: 500 });
  }
}
