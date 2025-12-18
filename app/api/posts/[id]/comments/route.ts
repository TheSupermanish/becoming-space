import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import { getCurrentUser } from '@/lib/session';
import { geminiService } from '@/lib/gemini';

// POST /api/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Run AI moderation on comment
    const moderation = await geminiService.moderateContent(content);

    // Create comment
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      authorTag: user.fullTag,
      content: content.trim(),
      likes: 0,
      likedBy: [],
      moderation,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id]/comments - Like/unlike a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { commentId, action } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      );
    }

    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const commentIndex = post.comments.findIndex(
      (c: { _id: { toString: () => string } }) => c._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = post.comments[commentIndex];
    const hasLiked = comment.likedBy.includes(user.fullTag);

    if (action === 'like' && !hasLiked) {
      comment.likedBy.push(user.fullTag);
      comment.likes = comment.likedBy.length;
    } else if (action === 'unlike' && hasLiked) {
      comment.likedBy = comment.likedBy.filter((tag: string) => tag !== user.fullTag);
      comment.likes = comment.likedBy.length;
    }

    await post.save();

    return NextResponse.json({
      success: true,
      data: {
        likes: comment.likes,
        hasLiked: comment.likedBy.includes(user.fullTag),
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

