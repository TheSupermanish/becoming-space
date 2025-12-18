import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import { getCurrentUser } from '@/lib/session';
import { geminiService } from '@/lib/gemini';

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id] - React to post OR edit post
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
    const body = await request.json();
    const { action, content, tags } = body;

    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle reactions
    if (action === 'hug' || action === 'unhug' || action === 'highFive' || action === 'unhighFive') {
      if (action === 'hug') {
        if (!post.reactions.huggedBy.includes(user.fullTag)) {
          post.reactions.huggedBy.push(user.fullTag);
          post.reactions.hugs = post.reactions.huggedBy.length;
        }
      } else if (action === 'unhug') {
        post.reactions.huggedBy = post.reactions.huggedBy.filter((t: string) => t !== user.fullTag);
        post.reactions.hugs = post.reactions.huggedBy.length;
      } else if (action === 'highFive') {
        if (!post.reactions.highFivedBy.includes(user.fullTag)) {
          post.reactions.highFivedBy.push(user.fullTag);
          post.reactions.highFives = post.reactions.highFivedBy.length;
        }
      } else if (action === 'unhighFive') {
        post.reactions.highFivedBy = post.reactions.highFivedBy.filter((t: string) => t !== user.fullTag);
        post.reactions.highFives = post.reactions.highFivedBy.length;
      }

      await post.save();

      return NextResponse.json({
        success: true,
        data: {
          reactions: post.reactions,
          hasHugged: post.reactions.huggedBy.includes(user.fullTag),
          hasHighFived: post.reactions.highFivedBy.includes(user.fullTag),
        },
      });
    }

    // Handle edit (author only)
    if (action === 'edit') {
      if (post.authorTag !== user.fullTag) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to edit this post' },
          { status: 403 }
        );
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Content is required' },
          { status: 400 }
        );
      }

      // Update content and tags
      post.content = content.trim();
      if (tags && Array.isArray(tags)) {
        post.tags = tags;
      }

      // Re-moderate the content
      const moderation = await geminiService.moderateContent(content);
      post.moderation = moderation;

      await post.save();

      return NextResponse.json({
        success: true,
        data: post,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post (only by author)
export async function DELETE(
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
    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorTag !== user.fullTag) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
