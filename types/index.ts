import { User, Post, Comment, Community, Vote, UpgradeLog, PostType } from '@prisma/client'

export type { User, Post, Comment, Community, Vote, UpgradeLog, PostType }

// Extended types for UI
export interface UserWithCounts extends User {
  _count?: {
    posts: number
    comments: number
    votes: number
  }
}

export interface PostWithDetails extends Post {
  author: User
  community: Community
  votes: Vote[]
  comments: Comment[]
  _count?: {
    comments: number
    votes: number
  }
  userVote?: Vote
}

export interface CommentWithDetails extends Comment {
  author: User
  votes: Vote[]
  replies: CommentWithDetails[]
  _count?: {
    replies: number
    votes: number
  }
  userVote?: Vote
}

export interface CommunityWithCounts extends Community {
  _count?: {
    posts: number
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Upgrade system types
export interface UpgradeAttempt {
  userId: string
  useSafeguard: boolean
}

export interface UpgradeResult {
  success: boolean
  fromLevel: number
  toLevel: number | null
  pointsUsed: number
  newBalance: number
}

// Sort types
export type PostSortType = 'hot' | 'new' | 'top'

// Vote types
export type VoteType = 'up' | 'down' | 'none'

// Form types
export interface CreatePostForm {
  title: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  type: PostType
  communityId: string
}

export interface CreateCommentForm {
  content: string
  postId: string
  parentId?: string
}

export interface UserProfile {
  username: string
  email: string
  avatar?: string
}
