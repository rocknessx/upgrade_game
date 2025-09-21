import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { POINTS } from '@/lib/constants'

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
    const { postId, commentId, value } = body // value: 1 (upvote), -1 (downvote), 0 (remove vote)

    if (!postId && !commentId) {
      return NextResponse.json(
        { success: false, error: 'Either postId or commentId is required' },
        { status: 400 }
      )
    }

    if (![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { success: false, error: 'Vote value must be 1, -1, or 0' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Check if user is trying to vote on their own content
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })
      
      if (post?.authorId === userId) {
        return NextResponse.json(
          { success: false, error: 'Cannot vote on your own post' },
          { status: 400 }
        )
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true }
      })
      
      if (comment?.authorId === userId) {
        return NextResponse.json(
          { success: false, error: 'Cannot vote on your own comment' },
          { status: 400 }
        )
      }
    }

    // Handle vote logic
    const whereClause = postId 
      ? { userId, postId }
      : { userId, commentId }

    const existingVote = await prisma.vote.findUnique({
      where: postId 
        ? { userId_postId: { userId, postId } }
        : { userId_commentId: { userId, commentId } }
    })

    let scoreChange = 0
    let pointsAwarded = 0
    let authorId: string | null = null

    if (value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
        scoreChange = -existingVote.value
      }
    } else {
      if (existingVote) {
        // Update existing vote
        scoreChange = value - existingVote.value
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        })
      } else {
        // Create new vote
        scoreChange = value
        await prisma.vote.create({
          data: {
            userId,
            postId,
            commentId,
            value
          }
        })
      }
    }

    // Update score and award points
    if (postId) {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { score: { increment: scoreChange } },
        select: { authorId: true, score: true }
      })
      authorId = updatedPost.authorId
      
      // Award points to post author for upvotes
      if (scoreChange > 0) {
        pointsAwarded = POINTS.UPVOTE_RECEIVED * scoreChange
        await prisma.user.update({
          where: { id: authorId },
          data: {
            upgradePoints: { increment: pointsAwarded },
            totalUpvotes: { increment: scoreChange }
          }
        })
      }
    } else if (commentId) {
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { score: { increment: scoreChange } },
        select: { authorId: true, score: true }
      })
      authorId = updatedComment.authorId
      
      // Award points to comment author for upvotes
      if (scoreChange > 0) {
        pointsAwarded = POINTS.UPVOTE_RECEIVED * scoreChange
        await prisma.user.update({
          where: { id: authorId },
          data: {
            upgradePoints: { increment: pointsAwarded },
            totalUpvotes: { increment: scoreChange }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scoreChange,
        pointsAwarded
      },
      message: pointsAwarded > 0 ? `+${pointsAwarded} points awarded to author!` : 'Vote recorded'
    })

  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
