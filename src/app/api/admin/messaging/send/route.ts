import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body
    const { fromId, toId, content } = await req.json();

    // Validate required fields
    if (!fromId || !toId || !content) {
      return NextResponse.json(
        { error: 'Missing fields: fromId, toId, content required' },
        { status: 400 }
      );
    }

    // Create a new message record in the database
    const message = await prisma.message.create({
      data: {
        fromId,
        toId,
        content,
      },
    });

    // Return success response with the created message
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
