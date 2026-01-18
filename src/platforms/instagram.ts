/**
 * Instagram Platform Implementation
 * Uses Instagram Graph API (requires Business or Creator account)
 */

import axios, { AxiosInstance } from 'axios';
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

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  username: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramUser {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export class InstagramPlatform extends SocialPlatform {
  private client: AxiosInstance | null = null;
  private baseUrl = 'https://graph.instagram.com';

  constructor(config: PlatformConfig) {
    super(Platform.INSTAGRAM, config);
  }

  async authenticate(): Promise<void> {
    try {
      if (!this.config.accessToken || !this.config.userId) {
        throw this.createError('Missing Instagram access token or user ID');
      }

      // Initialize axios client
      this.client = axios.create({
        baseURL: this.baseUrl,
        params: {
          access_token: this.config.accessToken
        }
      });

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

      const response = await this.client.get(`/${this.config.userId}`, {
        params: {
          fields: 'id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count'
        }
      });

      const igUser: InstagramUser = response.data;
      return this.mapInstagramUserToUser(igUser);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getFeed(options: FeedOptions = {}): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const response = await this.client.get(`/${this.config.userId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count',
          limit: options.limit || 20
        }
      });

      const posts: Post[] = [];
      const me = await this.getMe();

      for (const media of response.data.data || []) {
        posts.push(this.mapInstagramMediaToPost(media, me));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async post(options: PostOptions): Promise<Post> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      if (!options.mediaPath && !options.mediaUrls?.[0]) {
        throw this.createError('Instagram requires an image or video URL to post');
      }

      const mediaUrl = options.mediaUrls?.[0] || options.mediaPath;
      if (!mediaUrl) {
        throw this.createError('Media URL is required');
      }

      // Step 1: Create media container
      const containerResponse = await this.client.post(`/${this.config.userId}/media`, null, {
        params: {
          image_url: mediaUrl,
          caption: options.caption || options.text || ''
        }
      });

      const containerId = containerResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await this.client.post(`/${this.config.userId}/media_publish`, null, {
        params: {
          creation_id: containerId
        }
      });

      const mediaId = publishResponse.data.id;

      // Step 3: Fetch the published media
      const mediaResponse = await this.client.get(`/${mediaId}`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count'
        }
      });

      const me = await this.getMe();
      return this.mapInstagramMediaToPost(mediaResponse.data, me);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async engage(options: EngagementOptions): Promise<void> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      switch (options.action) {
        case EngagementAction.COMMENT:
        case EngagementAction.REPLY:
          if (!options.commentText) {
            throw this.createError('Comment text is required');
          }
          await this.client.post(`/${options.postId}/comments`, null, {
            params: {
              message: options.commentText
            }
          });
          break;

        case EngagementAction.LIKE:
          // Instagram Graph API doesn't support liking posts programmatically
          throw this.createError('Instagram API does not support liking posts programmatically');

        case EngagementAction.SHARE:
          // Instagram Graph API doesn't support sharing posts programmatically
          throw this.createError('Instagram API does not support sharing posts programmatically');

        default:
          throw this.createError(`Unsupported action: ${options.action}`);
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async search(options: SearchOptions): Promise<Post[]> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      // Instagram Graph API doesn't support searching posts
      // We can only search hashtags, but that requires different permissions
      throw this.createError('Instagram API does not support post search. Only hashtag search is available with additional permissions.');
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Get insights for a post (Business accounts only)
   */
  async getInsights(postId: string): Promise<any> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const response = await this.client.get(`/${postId}/insights`, {
        params: {
          metric: 'engagement,impressions,reach,saved'
        }
      });

      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Map Instagram user to our User interface
   */
  private mapInstagramUserToUser(igUser: InstagramUser): User {
    return {
      id: igUser.id,
      username: igUser.username,
      displayName: igUser.name || igUser.username,
      avatarUrl: igUser.profile_picture_url,
      bio: igUser.biography,
      followersCount: igUser.followers_count,
      followingCount: igUser.follows_count
    };
  }

  /**
   * Map Instagram media to our Post interface
   */
  private mapInstagramMediaToPost(media: InstagramMedia, author: User): Post {
    return {
      id: media.id,
      platform: Platform.INSTAGRAM,
      author,
      content: media.caption || '',
      timestamp: new Date(media.timestamp),
      mediaUrls: media.media_url ? [media.media_url] : undefined,
      likesCount: media.like_count,
      commentsCount: media.comments_count,
      url: media.permalink
    };
  }
}
