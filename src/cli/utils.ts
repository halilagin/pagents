/**
 * CLI utility functions
 */

import chalk from 'chalk';
import { Platform } from '../types/index.js';
import { SocialPlatform } from '../platforms/base.js';
import { TwitterPlatform } from '../platforms/twitter.js';
import { InstagramPlatform } from '../platforms/instagram.js';
import { LinkedInPlatform } from '../platforms/linkedin.js';
import { getCredentials } from '../auth/storage.js';

/**
 * Parse platform string to Platform enum
 */
export function parsePlatform(platformStr: string): Platform {
  const lower = platformStr.toLowerCase();
  if (lower === 'twitter' || lower === 'x') {
    return Platform.TWITTER;
  } else if (lower === 'instagram' || lower === 'ig') {
    return Platform.INSTAGRAM;
  } else if (lower === 'linkedin' || lower === 'li') {
    return Platform.LINKEDIN;
  }
  throw new Error(`Unknown platform: ${platformStr}`);
}

/**
 * Get platform instance with authentication
 */
export async function getPlatformInstance(platform: Platform): Promise<SocialPlatform> {
  const config = getCredentials(platform);
  if (!config) {
    throw new Error(
      `No credentials found for ${platform}. Please run 'social-cli auth setup' first.`
    );
  }

  let platformInstance: SocialPlatform;

  switch (platform) {
    case Platform.TWITTER:
      platformInstance = new TwitterPlatform(config);
      break;
    case Platform.INSTAGRAM:
      platformInstance = new InstagramPlatform(config);
      break;
    case Platform.LINKEDIN:
      platformInstance = new LinkedInPlatform(config);
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  await platformInstance.authenticate();
  return platformInstance;
}

/**
 * Format error message
 */
export function formatError(error: any): string {
  if (error.platform) {
    return chalk.red(`[${error.platform.toUpperCase()}] ${error.message}`);
  }
  return chalk.red(`Error: ${error.message}`);
}

/**
 * Format success message
 */
export function formatSuccess(message: string): string {
  return chalk.green(`✓ ${message}`);
}

/**
 * Format info message
 */
export function formatInfo(message: string): string {
  return chalk.blue(`ℹ ${message}`);
}

/**
 * Format post for display
 */
export function formatPost(post: any, detailed: boolean = false): string {
  const lines: string[] = [];

  // Header
  lines.push(chalk.bold(`${post.author.displayName} (@${post.author.username})`));
  lines.push(chalk.gray(`Platform: ${post.platform} | ID: ${post.id}`));
  lines.push(chalk.gray(`Posted: ${post.timestamp.toLocaleString()}`));

  // Content
  lines.push('');
  lines.push(post.content);

  // Engagement metrics
  if (post.likesCount !== undefined || post.commentsCount !== undefined || post.sharesCount !== undefined) {
    lines.push('');
    const metrics: string[] = [];
    if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
    if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
    if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
    lines.push(chalk.gray(metrics.join('  ')));
  }

  // URL
  if (post.url && detailed) {
    lines.push('');
    lines.push(chalk.cyan(`🔗 ${post.url}`));
  }

  // Media
  if (post.mediaUrls && post.mediaUrls.length > 0 && detailed) {
    lines.push('');
    lines.push(chalk.gray(`📷 ${post.mediaUrls.length} media attachment(s)`));
  }

  lines.push(chalk.gray('─'.repeat(80)));

  return lines.join('\n');
}

/**
 * Output as JSON if requested
 */
export function outputJson(data: any, jsonOutput: boolean): void {
  if (jsonOutput) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Get multiple platform instances
 */
export async function getMultiplePlatforms(platformStrs: string[]): Promise<SocialPlatform[]> {
  const platforms: SocialPlatform[] = [];

  for (const platformStr of platformStrs) {
    try {
      const platform = parsePlatform(platformStr);
      const instance = await getPlatformInstance(platform);
      platforms.push(instance);
    } catch (error: any) {
      console.error(formatError(error));
    }
  }

  if (platforms.length === 0) {
    throw new Error('No valid platforms could be initialized');
  }

  return platforms;
}
