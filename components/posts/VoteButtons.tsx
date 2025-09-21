'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { VoteType } from '@/types'

interface VoteButtonsProps {
  score: number
  userVote?: VoteType
  onVote: (type: VoteType) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
}

export default function VoteButtons({ 
  score, 
  userVote = 'none', 
  onVote, 
  size = 'md' 
}: VoteButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteType>(userVote)
  const [currentScore, setCurrentScore] = useState(score)

  const handleVote = async (type: VoteType) => {
    if (isLoading) return

    setIsLoading(true)
    
    try {
      // Optimistic update
      let newScore = currentScore
      let newVote: VoteType = type
      
      if (currentVote === type) {
        // Aynı vote'a tıklandı, iptal et
        newVote = 'none'
        newScore = currentVote === 'up' ? currentScore - 1 : currentScore + 1
      } else {
        // Farklı vote
        if (currentVote === 'up' && type === 'down') {
          newScore = currentScore - 2
        } else if (currentVote === 'down' && type === 'up') {
          newScore = currentScore + 2
        } else if (currentVote === 'none') {
          newScore = type === 'up' ? currentScore + 1 : currentScore - 1
        }
      }

      setCurrentVote(newVote)
      setCurrentScore(newScore)
      
      await onVote(type)
    } catch (error) {
      // Rollback on error
      setCurrentVote(userVote)
      setCurrentScore(score)
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          transition-colors duration-200 disabled:opacity-50
          ${currentVote === 'up' 
            ? 'bg-orange-500 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500'
          }
        `}
      >
        <ArrowUp size={iconSizes[size]} />
      </motion.button>

      {/* Score */}
      <motion.span
        key={currentScore}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`
          font-bold text-sm
          ${currentVote === 'up' ? 'text-orange-500' : 
            currentVote === 'down' ? 'text-blue-500' : 'text-gray-600'}
        `}
      >
        {currentScore}
      </motion.span>

      {/* Downvote Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          transition-colors duration-200 disabled:opacity-50
          ${currentVote === 'down' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-500'
          }
        `}
      >
        <ArrowDown size={iconSizes[size]} />
      </motion.button>
    </div>
  )
}
