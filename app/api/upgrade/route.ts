import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UPGRADE_CHANCES, UPGRADE_COSTS } from '@/lib/constants'

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
    const { useSafeguard = false } = body

    const userId = session.user.id

    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        upgradeLevel: true,
        upgradePoints: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const currentLevel = user.upgradeLevel
    const targetLevel = currentLevel + 1

    // Check if already at max level
    if (currentLevel >= 10) {
      return NextResponse.json(
        { success: false, error: 'Already at maximum level (+10)' },
        { status: 400 }
      )
    }

    // Check if user has enough points
    const cost = UPGRADE_COSTS[targetLevel]
    if (user.upgradePoints < cost) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient points. Need ${cost}, have ${user.upgradePoints}` 
        },
        { status: 400 }
      )
    }

    // Calculate success chance
    const successChance = UPGRADE_CHANCES[targetLevel]
    const random = Math.random()
    const isSuccess = random <= successChance

    let newLevel = currentLevel
    let resultMessage = ''

    if (isSuccess) {
      // Success!
      newLevel = targetLevel
      resultMessage = `🎉 Upgrade successful! You are now level +${newLevel}!`
    } else {
      // Failure
      if (useSafeguard) {
        // With safeguard: only drop 1 level
        newLevel = Math.max(0, currentLevel - 1)
        resultMessage = `💔 Upgrade failed, but safeguard protected you! Level: +${newLevel}`
      } else {
        // Without safeguard: drop to half level
        newLevel = Math.floor(currentLevel / 2)
        resultMessage = `💥 Upgrade failed! Level dropped to +${newLevel}`
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        upgradeLevel: newLevel,
        upgradePoints: {
          decrement: cost // Points are always consumed
        }
      },
      select: {
        upgradeLevel: true,
        upgradePoints: true,
      }
    })

    // Log the upgrade attempt
    await prisma.upgradeLog.create({
      data: {
        userId,
        fromLevel: currentLevel,
        toLevel: isSuccess ? newLevel : null,
        success: isSuccess,
        pointsUsed: cost,
        safeguard: useSafeguard,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        upgradeSuccess: isSuccess,
        fromLevel: currentLevel,
        toLevel: newLevel,
        pointsUsed: cost,
        newBalance: updatedUser.upgradePoints,
        successChance: Math.round(successChance * 100),
        usedSafeguard: useSafeguard,
      },
      message: resultMessage
    })

  } catch (error) {
    console.error('Error processing upgrade:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process upgrade' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'history' or 'stats'

    if (type === 'history') {
      // Get upgrade history
      const history = await prisma.upgradeLog.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return NextResponse.json({
        success: true,
        data: history
      })
    } else {
      // Get user stats and upgrade info
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          upgradeLevel: true,
          upgradePoints: true,
          totalUpvotes: true,
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      const nextLevel = user.upgradeLevel + 1
      const canUpgrade = nextLevel <= 10
      const cost = canUpgrade ? UPGRADE_COSTS[nextLevel] : null
      const successChance = canUpgrade ? UPGRADE_CHANCES[nextLevel] : null

      return NextResponse.json({
        success: true,
        data: {
          currentLevel: user.upgradeLevel,
          points: user.upgradePoints,
          totalUpvotes: user.totalUpvotes,
          nextLevel: canUpgrade ? nextLevel : null,
          upgradeCost: cost,
          successChance: successChance ? Math.round(successChance * 100) : null,
          canUpgrade: canUpgrade && user.upgradePoints >= (cost || 0),
        }
      })
    }

  } catch (error) {
    console.error('Error fetching upgrade data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upgrade data' },
      { status: 500 }
    )
  }
}
