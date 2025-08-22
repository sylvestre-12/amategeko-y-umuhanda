import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get userId from query params
    const userId = parseInt(req.nextUrl.searchParams.get('userId') || '0');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user and check if admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check attempts for non-admin users
    if (!user.isAdmin) {
      const attempts = await prisma.testHistory.count({
        where: { userId },
      });

      if (attempts >= 2) {
        return NextResponse.json({
          message:
            '⚠️ You are allowed to attempt only two times. If you want to continue after that, please pay 5000 RWF to 0786278953.',
        }, { status: 403 });
      }
    }

    // If allowed, fetch and return questions
    const questions = await prisma.question.findMany();
    return NextResponse.json({ questions });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, optionA, optionB, optionC, optionD, correctAnswer } = body;

    // 1️⃣ Check for duplicate question (exact text match, trimmed)
    const existingQuestion = await prisma.question.findFirst({
      where: {
        question: question.trim(),
      },
    });

    if (existingQuestion) {
      return NextResponse.json(
        { error: 'This question already exit' },
        { status: 409 }
      );
    }

    // 2️⃣ Create new question if no duplicate
    const newQuestion = await prisma.question.create({
      data: { question, optionA, optionB, optionC, optionD, correctAnswer },
    });

    return NextResponse.json(newQuestion);
  } catch (err) {
    return NextResponse.json(
      { error: 'Error creating question' },
      { status: 500 }
    );
  }
}
