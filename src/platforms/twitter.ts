/**
 * Twitter/X Platform Implementation
 * Uses twitter-api-v2 for API interactions
 */

import { TwitterApi, TweetV2, UserV2 } from 'twitter-api-v2';
import { SocialPlatform } from './base.js';
import {
  Platform,
  PlatformConfig,
  User,
  Post,
  PostOptions,
  FeedOptions,
  EngagementOptions,
  SearchOptions,
  EngagementAction
} from '../types/index.js';

export class TwitterPlatform extends SocialPlatform {
  private client: TwitterApi | null = null;
  private readWriteClient: TwitterApi | null = null;

  constructor(config: PlatformConfig) {
    super(Platform.TWITTER, config);
  }

  async authenticate(): Promise<void> {
    try {
      // Initialize Twitter client with OAuth 1.0a User Context
      if (this.config.apiKey && this.config.apiSecret &&
          this.config.accessToken && this.config.accessSecret) {
        this.client = new TwitterApi({
          appKey: this.config.apiKey,
          appSecret: this.config.apiSecret,
          accessToken: this.config.accessToken,
          accessSecret: this.config.accessSecret,
        });
        this.readWriteClient = this.client;
      } else if (this.config.bearerToken) {
        // App-only authentication (read-only)
        this.client = new TwitterApi(this.config.bearerToken);
      } else {
        throw this.createError('Missing Twitter API credentials');
      }

      // Verify credentials by getting current user
      await this.getMe();
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getMe(): Promise<User> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const me = await this.client.v2.me({
        'user.fields': ['profile_image_url', 'description', 'public_metrics', 'verified']
      });

      return this.mapTwitterUserToUser(me.data);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getFeed(options: FeedOptions = {}): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const me = await this.getMe();
      const timeline = await this.client.v2.homeTimeline({
        max_results: options.limit || 20,
        'tweet.fields': ['created_at', 'public_metrics', 'attachments', 'referenced_tweets'],
        'user.fields': ['profile_image_url', 'verified'],
        expansions: ['author_id', 'attachments.media_keys', 'referenced_tweets.id'],
        'media.fields': ['url', 'preview_image_url']
      });

      const posts: Post[] = [];
      for (const tweet of timeline.data.data || []) {
        posts.push(await this.mapTwitterTweetToPost(tweet, timeline.includes));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async post(options: PostOptions): Promise<Post> {
    try {
      if (!this.readWriteClient) {
        throw this.createError('Write access not available. Need OAuth 1.0a credentials.');
      }

      if (!options.text) {
        throw this.createError('Tweet text is required');
      }

      // Create tweet
      const tweetData: any = {
        text: options.text
      };

      // Handle media if provided
      if (options.mediaUrls && options.mediaUrls.length > 0) {
        const mediaIds: string[] = [];
        for (const mediaUrl of options.mediaUrls) {
          const mediaId = await this.readWriteClient.v1.uploadMedia(mediaUrl);
          mediaIds.push(mediaId);
        }
        tweetData.media = { media_ids: mediaIds };
      }

      const tweet = await this.readWriteClient.v2.tweet(tweetData);

      // Fetch the created tweet with full details
      const fullTweet = await this.readWriteClient.v2.singleTweet(tweet.data.id, {
        'tweet.fields': ['created_at', 'public_metrics'],
        'user.fields': ['profile_image_url', 'verified'],
        expansions: ['author_id']
      });

      return await this.mapTwitterTweetToPost(fullTweet.data, fullTweet.includes);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async engage(options: EngagementOptions): Promise<void> {
    try {
      if (!this.readWriteClient) {
        throw this.createError('Write access not available. Need OAuth 1.0a credentials.');
      }

      const me = await this.getMe();

      switch (options.action) {
        case EngagementAction.LIKE:
          await this.readWriteClient.v2.like(me.id, options.postId);
          break;

        case EngagementAction.RETWEET:
          await this.readWriteClient.v2.retweet(me.id, options.postId);
          break;

        case EngagementAction.REPLY:
        case EngagementAction.COMMENT:
          if (!options.commentText) {
            throw this.createError('Comment text is required for replies');
          }
          await this.readWriteClient.v2.reply(options.commentText, options.postId);
          break;

        default:
          throw this.createError(`Unsupported action: ${options.action}`);
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getFollowingFeed(limit: number = 10): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      // Get reverse chronological timeline (only from accounts you follow)
      const timeline = await this.client.v2.homeTimeline({
        max_results: Math.min(Math.max(limit, 1), 100),
        'tweet.fields': ['created_at', 'public_metrics', 'attachments', 'referenced_tweets'],
        'user.fields': ['profile_image_url', 'verified'],
        expansions: ['author_id', 'attachments.media_keys', 'referenced_tweets.id'],
        'media.fields': ['url', 'preview_image_url'],
        exclude: ['replies'] // Exclude replies, show only original tweets and retweets
      });

      const posts: Post[] = [];
      for (const tweet of timeline.data.data || []) {
        posts.push(await this.mapTwitterTweetToPost(tweet, timeline.includes));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getMyPosts(limit: number = 10): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const me = await this.getMe();
      const timeline = await this.client.v2.userTimeline(me.id, {
        max_results: Math.min(Math.max(limit, 5), 100), // Twitter requires 5-100
        'tweet.fields': ['created_at', 'public_metrics', 'attachments'],
        'user.fields': ['profile_image_url', 'verified'],
        expansions: ['author_id', 'attachments.media_keys'],
        'media.fields': ['url', 'preview_image_url']
      });

      const posts: Post[] = [];
      for (const tweet of timeline.data.data || []) {
        posts.push(await this.mapTwitterTweetToPost(tweet, timeline.includes));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async search(options: SearchOptions): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const searchResults = await this.client.v2.search(options.query, {
        max_results: options.limit || 20,
        'tweet.fields': ['created_at', 'public_metrics', 'attachments'],
        'user.fields': ['profile_image_url', 'verified'],
        expansions: ['author_id', 'attachments.media_keys'],
        'media.fields': ['url', 'preview_image_url'],
        start_time: options.startTime?.toISOString(),
        end_time: options.endTime?.toISOString()
      });

      const posts: Post[] = [];
      for (const tweet of searchResults.data.data || []) {
        posts.push(await this.mapTwitterTweetToPost(tweet, searchResults.includes));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Map Twitter user to our User interface
   */
  private mapTwitterUserToUser(twitterUser: UserV2): User {
    return {
      id: twitterUser.id,
      username: twitterUser.username,
      displayName: twitterUser.name,
      avatarUrl: twitterUser.profile_image_url,
      bio: twitterUser.description,
      followersCount: twitterUser.public_metrics?.followers_count,
      followingCount: twitterUser.public_metrics?.following_count,
      verified: twitterUser.verified
    };
  }

  /**
   * Map Twitter tweet to our Post interface
   */
  private async mapTwitterTweetToPost(tweet: TweetV2, includes?: any): Promise<Post> {
    // Find author from includes
    let author: User;
    if (includes?.users) {
      const twitterUser = includes.users.find((u: UserV2) => u.id === tweet.author_id);
      if (twitterUser) {
        author = this.mapTwitterUserToUser(twitterUser);
      } else {
        // Fallback if author not in includes
        author = {
          id: tweet.author_id || 'unknown',
          username: 'unknown',
          displayName: 'Unknown User'
        };
      }
    } else {
      author = {
        id: tweet.author_id || 'unknown',
        username: 'unknown',
        displayName: 'Unknown User'
      };
    }

    // Extract media URLs if available
    const mediaUrls: string[] = [];
    if (tweet.attachments?.media_keys && includes?.media) {
      for (const mediaKey of tweet.attachments.media_keys) {
        const media = includes.media.find((m: any) => m.media_key === mediaKey);
        if (media?.url) {
          mediaUrls.push(media.url);
        } else if (media?.preview_image_url) {
          mediaUrls.push(media.preview_image_url);
        }
      }
    }

    return {
      id: tweet.id,
      platform: Platform.TWITTER,
      author,
      content: tweet.text,
      timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date(),
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      likesCount: tweet.public_metrics?.like_count,
      commentsCount: tweet.public_metrics?.reply_count,
      sharesCount: tweet.public_metrics?.retweet_count,
      url: `https://twitter.com/${author.username}/status/${tweet.id}`
    };
  }
}
