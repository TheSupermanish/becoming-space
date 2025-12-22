import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { geminiService } from '@/lib/gemini';

// Store chat sessions in memory (in production, use Redis or similar)
const chatSessions = new Map<string, ReturnType<typeof geminiService.createChatSession>>();

// POST /api/chat - Send a message to Athena
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { message, summary: previousSummary } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create chat session for this user
    let chatSession = chatSessions.get(user.fullTag);
    
    if (!chatSession) {
      chatSession = geminiService.createChatSession();
      chatSessions.set(user.fullTag, chatSession);
    }

    // Build message with context from summary if available
    const contextualMessage = previousSummary 
      ? `[Previous conversation summary: ${previousSummary}]\n\nUser's new message: ${message.trim()}`
      : message.trim();

    // Send message and get response
    const response = await geminiService.sendChatMessage(chatSession, contextualMessage);

    // Generate updated summary including this exchange
    const newSummary = await geminiService.generateConversationSummary(
      previousSummary || '',
      message.trim(),
      response
    );

    return NextResponse.json({
      success: true,
      data: {
        response,
        summary: newSummary,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat - Clear chat session
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    chatSessions.delete(user.fullTag);

    return NextResponse.json({
      success: true,
      message: 'Chat session cleared',
    });
  } catch (error) {
    console.error('Clear chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear chat' },
      { status: 500 }
    );
  }
}


