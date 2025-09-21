'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { MessageCircle, Share2, Bookmark, MoreHorizontal, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { PostWithDetails, VoteType } from '@/types'
import VoteButtons from './VoteButtons'
import { UPGRADE_COLORS } from '@/lib/constants'

interface PostCardProps {
  post: PostWithDetails
  onVote: (postId: string, type: VoteType) => Promise<void>
  compact?: boolean
}

export default function PostCard({ post, onVote, compact = false }: PostCardProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const handleVote = async (type: VoteType) => {
    await onVote(post.id, type)
  }

  const formatContent = (content: string) => {
    if (content.length > 300 && compact) {
      return content.substring(0, 300) + '...'
    }
    return content
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex">
        {/* Vote Section */}
        <div className="w-12 bg-gray-50 flex items-start justify-center pt-4">
          <VoteButtons
            score={post.score}
            userVote={post.userVote?.value === 1 ? 'up' : post.userVote?.value === -1 ? 'down' : 'none'}
            onVote={handleVote}
            size="sm"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link 
              href={`/r/${post.community.name}`}
              className="font-medium text-gray-900 hover:text-orange-500"
            >
              r/{post.community.name}
            </Link>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
            </span>
            <span>•</span>
            <Link 
              href={`/u/${post.author.username}`}
              className={`hover:text-orange-500 ${UPGRADE_COLORS[post.author.upgradeLevel]}`}
            >
              u/{post.author.username} +{post.author.upgradeLevel}
            </Link>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
            <Link href={`/post/${post.id}`} className="hover:text-orange-500">
              {post.title}
            </Link>
          </h2>

          {/* Content */}
          {post.type === 'TEXT' && post.content && (
            <div className="text-gray-700 mb-3 whitespace-pre-wrap">
              {formatContent(post.content)}
              {post.content.length > 300 && compact && (
                <Link href={`/post/${post.id}`} className="text-orange-500 hover:text-orange-600 ml-1">
                  devamını oku
                </Link>
              )}
            </div>
          )}

          {/* Image */}
          {post.type === 'IMAGE' && post.imageUrl && (
            <div className="mb-3">
              <motion.div
                className="relative cursor-pointer"
                onClick={() => setIsImageExpanded(!isImageExpanded)}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={500}
                  height={300}
                  className={`rounded-lg object-cover ${isImageExpanded ? 'w-full h-auto' : 'w-full h-64'}`}
                  priority={false}
                />
              </motion.div>
            </div>
          )}

          {/* Link */}
          {post.type === 'LINK' && post.linkUrl && (
            <div className="mb-3">
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ExternalLink size={16} className="text-gray-500" />
                <span className="text-blue-600 hover:text-blue-700 truncate">
                  {post.linkUrl}
                </span>
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 text-gray-500">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
            >
              <MessageCircle size={16} />
              <span>{post._count?.comments || 0} yorum</span>
            </Link>
            
            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <Share2 size={16} />
              <span>Paylaş</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <Bookmark size={16} />
              <span>Kaydet</span>
            </button>
            
            <button className="hover:text-gray-700 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
