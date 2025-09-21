import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'new' // hot, new, top
    const communityName = searchParams.get('community')
    
    const skip = (page - 1) * limit

    // Base query conditions
    const where: any = {}
    if (communityName) {
      where.community = {
        name: communityName
      }
    }

    // Sorting logic
    let orderBy: any = { createdAt: 'desc' } // default: new
    if (sort === 'hot') {
      orderBy = { score: 'desc' }
    } else if (sort === 'top') {
      orderBy = [{ score: 'desc' }, { createdAt: 'desc' }]
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            upgradeLevel: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            title: true,
          }
        },
        votes: session?.user?.id ? {
          where: {
            userId: session.user.id
          }
        } : false,
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    })

    // Add userVote information
    const postsWithUserVote = posts.map((post: any) => ({
      ...post,
      userVote: session?.user?.id && post.votes?.length > 0 ? post.votes[0] : null,
      votes: undefined, // Remove the votes array, we only need userVote
    }))

    return NextResponse.json({
      success: true,
      data: postsWithUserVote,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, imageUrl, linkUrl, type, communityId } = body

    if (!title || !communityId) {
      return NextResponse.json(
        { success: false, error: 'Title and community are required' },
        { status: 400 }
      )
    }

    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId }
    })

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        linkUrl,
        type: type || 'TEXT',
        authorId: session.user.id,
        communityId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            upgradeLevel: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            title: true,
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    })

    // Award points for creating post
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        upgradePoints: {
          increment: 2 // POINTS.POST_CREATED
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully! +2 points earned.'
    })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
