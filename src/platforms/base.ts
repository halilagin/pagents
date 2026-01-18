/**
 * Base abstract class for social media platforms
 * All platform implementations should extend this class
 */

import {
  Platform,
  PlatformConfig,
  User,
  Post,
  PostOptions,
  FeedOptions,
  EngagementOptions,
  SearchOptions,
  PlatformError
} from '../types/index.js';

export abstract class SocialPlatform {
  protected config: PlatformConfig;
  protected platform: Platform;

  constructor(platform: Platform, config: PlatformConfig) {
    this.platform = platform;
    this.config = config;
  }

  /**
   * Authenticate with the platform
   * @returns Promise that resolves when authentication is successful
   */
  abstract authenticate(): Promise<void>;

  /**
   * Get the authenticated user's profile
   * @returns Promise that resolves with the user's profile
   */
  abstract getMe(): Promise<User>;

  /**
   * Get the user's feed
   * @param options Feed options (limit, pagination, etc.)
   * @returns Promise that resolves with an array of posts
   */
  abstract getFeed(options?: FeedOptions): Promise<Post[]>;

  /**
   * Create a new post
   * @param options Post options (text, media, etc.)
   * @returns Promise that resolves with the created post
   */
  abstract post(options: PostOptions): Promise<Post>;

  /**
   * Engage with a post (like, comment, share, etc.)
   * @param options Engagement options
   * @returns Promise that resolves when engagement is successful
   */
  abstract engage(options: EngagementOptions): Promise<void>;

  /**
   * Search for posts
   * @param options Search options
   * @returns Promise that resolves with an array of posts
   */
  abstract search(options: SearchOptions): Promise<Post[]>;

  /**
   * Get the platform name
   */
  getPlatform(): Platform {
    return this.platform;
  }

  /**
   * Create a platform-specific error
   */
  protected createError(message: string, statusCode?: number, rateLimitReset?: Date): PlatformError {
    const error = new Error(message) as PlatformError;
    error.platform = this.platform;
    error.statusCode = statusCode;
    error.rateLimitReset = rateLimitReset;
    return error;
  }

  /**
   * Handle API errors
   */
  protected handleError(error: any): never {
    if (error.code === 429 || error.statusCode === 429) {
      const rateLimitReset = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000)
        : new Date(Date.now() + 15 * 60 * 1000); // Default to 15 minutes

      throw this.createError(
        `Rate limit exceeded for ${this.platform}. Try again after ${rateLimitReset.toLocaleTimeString()}`,
        429,
        rateLimitReset
      );
    }

    if (error.code === 401 || error.statusCode === 401) {
      throw this.createError(
        `Authentication failed for ${this.platform}. Please check your credentials.`,
        401
      );
    }

    // Handle Twitter API 403 Forbidden (permissions issue)
    if (error.code === 403 || error.statusCode === 403) {
      const errorDetail = error.data?.detail || error.data?.errors?.[0]?.message || '';
      throw this.createError(
        `Permission denied for ${this.platform}. ${errorDetail}\n` +
        `Your Twitter app may not have write permissions. To fix:\n` +
        `1. Go to https://developer.twitter.com/en/portal/projects\n` +
        `2. Select your app → "User authentication settings"\n` +
        `3. Set App permissions to "Read and write"\n` +
        `4. Regenerate your Access Token and Secret after changing permissions`,
        403
      );
    }

    // Handle Twitter API credits depleted (402 Payment Required)
    if (error.code === 402 || error.statusCode === 402) {
      const isCreditsError = error.data?.title === 'CreditsDepleted';
      if (isCreditsError) {
        throw this.createError(
          `Twitter API credits depleted. Your account has no remaining credits for this month. ` +
          `Visit developer.twitter.com to purchase more credits or upgrade your API tier, ` +
          `or wait for your monthly credits to reset.`,
          402
        );
      }
      throw this.createError(
        `Payment required for ${this.platform}. Please check your API subscription status.`,
        402
      );
    }

    throw this.createError(
      error.message || `An error occurred with ${this.platform}`,
      error.statusCode || error.code
    );
  }
}
