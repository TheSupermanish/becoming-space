import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import { getCurrentUser } from '@/lib/session';
import { geminiService } from '@/lib/gemini';
import type { PostType } from '@/lib/types';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const type = searchParams.get('type') as PostType | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    // Build query
    const query: Record<string, unknown> = {};
    if (tag && tag !== 'All') {
      query.tags = tag;
    }
    if (type && (type === 'vent' || type === 'flex')) {
      query.postType = type;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content, tags, postType } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Post content is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    const validPostType: PostType = postType === 'flex' ? 'flex' : 'vent';

    await dbConnect();

    // Run AI moderation
    const moderation = await geminiService.moderateContent(content);

    // Create post with moderation results
    const post = await Post.create({
      authorTag: user.fullTag,
      content: content.trim(),
      postType: validPostType,
      tags: tags && Array.isArray(tags) && tags.length > 0 ? tags : ['General'],
      moderation,
      isSpaceThinking: true,
      reactions: { hugs: 0, huggedBy: [], highFives: 0, highFivedBy: [] },
    });

    // Generate Athena's response asynchronously (don't wait)
    generateAthenaResponse(post._id.toString(), content, tags || ['General'], validPostType);

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper to generate Athena response in background
async function generateAthenaResponse(postId: string, content: string, tags: string[], postType: PostType) {
  try {
    const athenaResponse = await geminiService.generateAthenaResponse(content, tags, postType);
    
    await dbConnect();
    await Post.findByIdAndUpdate(postId, {
      spaceResponse: athenaResponse,
      isSpaceThinking: false,
    });
  } catch (error) {
    console.error('Athena response error:', error);
    const fallback = postType === 'flex' 
      ? "That's amazing! Keep celebrating your wins, no matter how small they seem. 🎉"
      : "I'm here with you. While I'm having trouble connecting right now, please know that your feelings are valid.";
    
    await Post.findByIdAndUpdate(postId, {
      spaceResponse: fallback,
      isSpaceThinking: false,
    });
  }
}
