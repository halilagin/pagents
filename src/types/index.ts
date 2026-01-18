/**
 * Shared TypeScript types for the Social Media Management System
 */

export enum Platform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin'
}

export enum EngagementAction {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  RETWEET = 'retweet',
  REPLY = 'reply'
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  verified?: boolean;
}

export interface Post {
  id: string;
  platform: Platform;
  author: User;
  content: string;
  timestamp: Date;
  mediaUrls?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  url?: string;
  isRetweet?: boolean;
  originalPost?: Post;
}

export interface PlatformConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken: string;
  accessSecret?: string;
  bearerToken?: string;
  clientId?: string;
  clientSecret?: string;
  userId?: string;
  appId?: string;
  redirectUri?: string;
}

export interface PostOptions {
  text?: string;
  caption?: string;
  mediaPath?: string;
  mediaUrls?: string[];
  linkUrl?: string;
  linkTitle?: string;
}

export interface FeedOptions {
  limit?: number;
  maxResults?: number;
  sinceId?: string;
  beforeId?: string;
}

export interface EngagementOptions {
  postId: string;
  action: EngagementAction;
  commentText?: string;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface AuthCredentials {
  platform: Platform;
  config: PlatformConfig;
}

export interface PlatformError extends Error {
  platform: Platform;
  statusCode?: number;
  rateLimitReset?: Date;
}
