import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { getCurrentUser } from '@/lib/session';

// GET /api/blogs/[slug] - Get a single blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    await dbConnect();

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Only admins can view unpublished blogs
    if (!blog.isPublished && (!user || user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment views (only for published blogs)
    if (blog.isPublished) {
      blog.views += 1;
      await blog.save();
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Fetch blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/[slug] - Update a blog (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    await dbConnect();

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (updates.title !== undefined) blog.title = updates.title.trim();
    if (updates.content !== undefined) blog.content = updates.content;
    if (updates.excerpt !== undefined) blog.excerpt = updates.excerpt;
    if (updates.coverImage !== undefined) blog.coverImage = updates.coverImage;
    if (updates.tags !== undefined) blog.tags = updates.tags;
    
    // Handle publish status
    if (updates.isPublished !== undefined) {
      const wasPublished = blog.isPublished;
      blog.isPublished = updates.isPublished;
      
      // Set publishedAt when first published
      if (!wasPublished && updates.isPublished) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug] - Delete a blog (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const blog = await Blog.findOneAndDelete({ slug });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}

