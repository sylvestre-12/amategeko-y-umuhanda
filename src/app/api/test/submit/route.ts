import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type AnswerPayload = {
  questionId: string; // ✅ must be string because Question.id is a UUID
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

    // ✅ Convert answers into lookup map { questionId: "A" }
    const answersMap: Record<string, string> = answers.reduce(
      (acc, ans) => {
        acc[ans.questionId] = ans.selected.toUpperCase();
        return acc;
      },
      {} as Record<string, string>
    );
// ✅ Only allow first 20 unique answers
const questionIds = [...new Set(Object.keys(answersMap))].slice(0, 20);

const correctAnswers = await prisma.question.findMany({
  where: { id: { in: questionIds } },
  select: { id: true, correctAnswer: true },
});

let score = 0;
const detailedResults = correctAnswers.map((q) => {
  const userAnswer = answersMap[q.id];
  const correct = q.correctAnswer.toUpperCase();
  const isCorrect = userAnswer === correct;
  if (isCorrect) score++;
  return { questionId: q.id, correctAnswer: correct, userAnswer, isCorrect };
});

const totalQuestions = 20; // fixed maximum
score = Math.min(score, totalQuestions);
const percentage = (score / totalQuestions) * 100;



    // ✅ Save attempt + history in transaction
    const [attempt, history] = await prisma.$transaction([
      prisma.attempt.create({
        data: {
          userId,
          score,
          startedAt: new Date(startedAt),
          finishedAt: new Date(finishedAt),
        },
      }),
      prisma.testHistory.create({
        data: { userId, score },
      }),
    ]);

    return NextResponse.json({
      message: 'Test submitted successfully',
      attempt,
      score,
      percentage,
      detailedResults,
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
