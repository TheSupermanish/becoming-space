import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { getCurrentUser } from '@/lib/session';

// GET /api/blogs - Get all published blogs (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '20');

    await dbConnect();

    // Build query
    const query: Record<string, unknown> = {};
    
    // Only admins can see unpublished blogs
    if (!user || user.role !== 'admin' || !includeUnpublished) {
      query.isPublished = true;
    }

    if (tag) {
      query.tags = tag;
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .select('-content') // Don't send full content in list
      .lean();

    return NextResponse.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog (admin only)
export async function POST(request: NextRequest) {
  try {
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

    const { title, content, excerpt, coverImage, tags, isPublished } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate slug from title
    const slug = Blog.generateSlug(title);

    // Generate excerpt if not provided
    const autoExcerpt = excerpt || content.replace(/<[^>]*>/g, '').slice(0, 200) + '...';

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      content,
      excerpt: autoExcerpt,
      coverImage: coverImage || null,
      authorTag: user.fullTag,
      authorName: user.username,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

