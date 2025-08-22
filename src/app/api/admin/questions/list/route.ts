import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: List questions (with optional search)
// GET: List questions (with optional search)
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') ?? '';

    const questions = await prisma.question.findMany({
      where: search.trim()
        ? { question: { contains: search.trim(), mode: 'insensitive' } }
        : {},
    });

    const shuffled = questions.sort(() => 0.5 - Math.random());

    const formatted = shuffled.map((q) => ({
      id: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correct: q.correctAnswer,
      createdAt: q.createdAt,
    }));

    return NextResponse.json({ success: true, questions: formatted }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error) || 'Failed to fetch questions',
    }, { status: 500 });
  }
}


// POST: Add a question
export async function POST(req: NextRequest) {
  try {
    const { question, optionA, optionB, optionC, optionD, correct } = await req.json();

    if (!question || !optionA || !optionB || !optionC || !optionD || !correct) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correct,
      },
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error) || 'Failed to add question',
    }, { status: 500 });
  }
}

// PUT: Update a question
export async function PUT(req: NextRequest) {
  try {
    const { id, question, optionA, optionB, optionC, optionD, correct } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correct,
      },
    });

    return NextResponse.json({ success: true, question: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error) || 'Failed to update question',
    }, { status: 500 });
  }
}

// DELETE: Remove a question
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Question deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error) || 'Failed to delete question',
    }, { status: 500 });
  }
}
