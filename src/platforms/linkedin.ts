/**
 * LinkedIn Platform Implementation
 * Uses LinkedIn API v2
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

interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    displayImage: string;
  };
  headline?: string;
}

interface LinkedInPost {
  id: string;
  author: string;
  created: {
    time: number;
  };
  text?: {
    text: string;
  };
  content?: {
    contentEntities?: Array<{
      entityLocation?: string;
      thumbnails?: Array<{
        resolvedUrl: string;
      }>;
    }>;
  };
  commentary?: string;
}

export class LinkedInPlatform extends SocialPlatform {
  private client: AxiosInstance | null = null;
  private baseUrl = 'https://api.linkedin.com/v2';
  private profileId: string | null = null;

  constructor(config: PlatformConfig) {
    super(Platform.LINKEDIN, config);
  }

  async authenticate(): Promise<void> {
    try {
      if (!this.config.accessToken) {
        throw this.createError('Missing LinkedIn access token');
      }

      // Initialize axios client
      this.client = axios.create({
        baseURL: this.baseUrl,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      // Verify credentials and get profile ID
      const me = await this.getMe();
      this.profileId = me.id;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getMe(): Promise<User> {
    try {
      if (!this.client) {
        throw this.createError('Not authenticated');
      }

      const response = await this.client.get('/me', {
        params: {
          projection: '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams),headline)'
        }
      });

      const profile: LinkedInProfile = response.data;
      return this.mapLinkedInProfileToUser(profile);
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getFeed(options: FeedOptions = {}): Promise<Post[]> {
    try {
      if (!this.client || !this.profileId) {
        throw this.createError('Not authenticated');
      }

      // Get user's posts
      const response = await this.client.get('/ugcPosts', {
        params: {
          q: 'authors',
          authors: `List(urn:li:person:${this.profileId})`,
          count: options.limit || 20,
          sortBy: 'LAST_MODIFIED'
        }
      });

      const posts: Post[] = [];
      const me = await this.getMe();

      for (const post of response.data.elements || []) {
        posts.push(this.mapLinkedInPostToPost(post, me));
      }

      return posts;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async post(options: PostOptions): Promise<Post> {
    try {
      if (!this.client || !this.profileId) {
        throw this.createError('Not authenticated');
      }

      if (!options.text && !options.linkUrl) {
        throw this.createError('Post text or link URL is required');
      }

      const postData: any = {
        author: `urn:li:person:${this.profileId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: options.text || ''
            },
            shareMediaCategory: options.linkUrl ? 'ARTICLE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add article link if provided
      if (options.linkUrl) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            originalUrl: options.linkUrl,
            title: {
              text: options.linkTitle || options.linkUrl
            }
          }
        ];
      }

      const response = await this.client.post('/ugcPosts', postData);

      // LinkedIn doesn't return the full post in the response
      // We'll construct a basic post object
      const me = await this.getMe();
      return {
        id: response.data.id,
        platform: Platform.LINKEDIN,
        author: me,
        content: options.text || '',
        timestamp: new Date(),
        url: `https://www.linkedin.com/feed/update/${response.data.id}/`
      };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async engage(options: EngagementOptions): Promise<void> {
    try {
      if (!this.client || !this.profileId) {
        throw this.createError('Not authenticated');
      }

      switch (options.action) {
        case EngagementAction.LIKE:
          await this.client.post('/socialActions', {
            actor: `urn:li:person:${this.profileId}`,
            object: options.postId,
            verb: 'LIKE'
          });
          break;

        case EngagementAction.COMMENT:
        case EngagementAction.REPLY:
          if (!options.commentText) {
            throw this.createError('Comment text is required');
          }
          await this.client.post('/socialActions', {
            actor: `urn:li:person:${this.profileId}`,
            object: options.postId,
            message: {
              text: options.commentText
            }
          });
          break;

        case EngagementAction.SHARE:
          await this.client.post('/ugcPosts', {
            author: `urn:li:person:${this.profileId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: options.commentText || ''
                },
                shareMediaCategory: 'NONE',
                originalShare: options.postId
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          });
          break;

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

      // LinkedIn API v2 doesn't support general post search
      // Only company/organization search is available
      throw this.createError('LinkedIn API does not support general post search');
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Map LinkedIn profile to our User interface
   */
  private mapLinkedInProfileToUser(profile: LinkedInProfile): User {
    return {
      id: profile.id,
      username: profile.id, // LinkedIn doesn't have usernames, using ID
      displayName: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      avatarUrl: profile.profilePicture?.displayImage,
      bio: profile.headline
    };
  }

  /**
   * Map LinkedIn post to our Post interface
   */
  private mapLinkedInPostToPost(post: LinkedInPost, author: User): Post {
    const text = post.text?.text || post.commentary || '';
    const mediaUrls: string[] = [];

    // Extract media URLs if available
    if (post.content?.contentEntities) {
      for (const entity of post.content.contentEntities) {
        if (entity.entityLocation) {
          mediaUrls.push(entity.entityLocation);
        } else if (entity.thumbnails?.[0]?.resolvedUrl) {
          mediaUrls.push(entity.thumbnails[0].resolvedUrl);
        }
      }
    }

    return {
      id: post.id,
      platform: Platform.LINKEDIN,
      author,
      content: text,
      timestamp: new Date(post.created.time),
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      url: `https://www.linkedin.com/feed/update/${post.id}/`
    };
  }
}
