import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type AnswerPayload = {
  questionId: string;
  selected: 'A' | 'B' | 'C' | 'D';
};

export async function POST(req: Request) {
  try {
    const { userId, startedAt, finishedAt, answers } = (await req.json()) as {
      userId: number;
      startedAt: string;
      finishedAt: string;
      answers: AnswerPayload[];
    };

    if (!userId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Convert answers array to a map: { questionId: selected }
    const answersMap: Record<string, string> = answers.reduce(
      (acc, ans) => ({ ...acc, [ans.questionId]: ans.selected }),
      {} as Record<string, string>
    );

    // Fetch correct answers for these questions
    const questionIds = answers.map(a => a.questionId);
    const correctAnswers = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    // Calculate score (out of 20)
    let score = 0;
    const detailedResults = correctAnswers.map(q => {
      const userAnswer = answersMap[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return { questionId: q.id, correctAnswer: q.correctAnswer, userAnswer, isCorrect };
    });

    // Save attempt and test history in a transaction
    const attempt = await prisma.$transaction(async prisma => {
      const newAttempt = await prisma.attempt.create({
        data: {
          userId,
          score,
          startedAt: new Date(startedAt),
          finishedAt: new Date(finishedAt),
        },
      });

      await prisma.testHistory.create({
        data: { userId, score },
      });

      return newAttempt;
    });

    return NextResponse.json({
      message: 'Test submitted successfully',
      attempt,
      score, // marks out of 20
      detailedResults, // optional: shows per-question feedback
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
