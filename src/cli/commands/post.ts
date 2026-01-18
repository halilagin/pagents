/**
 * Post command implementation
 */

import chalk from 'chalk';
import { PostOptions } from '../../types/index.js';
import { getMultiplePlatforms, formatError, formatSuccess } from '../utils.js';

interface PostCommandOptions {
  platform: string;
  media?: string;
  link?: string;
  linkTitle?: string;
  caption?: string;
}

/**
 * Handle post command
 */
export async function handlePost(text: string, options: PostCommandOptions): Promise<void> {
  try {
    // Parse platforms (comma-separated)
    const platformStrs = options.platform.split(',').map(p => p.trim());

    // Get platform instances
    const platforms = await getMultiplePlatforms(platformStrs);

    // Prepare post options
    const postOptions: PostOptions = {
      text,
      caption: options.caption,
      linkUrl: options.link,
      linkTitle: options.linkTitle
    };

    // Handle media
    if (options.media) {
      postOptions.mediaUrls = [options.media];
      postOptions.mediaPath = options.media;
    }

    // Post to each platform
    const results: Array<{ platform: string; success: boolean; error?: string; postId?: string }> = [];

    for (const platform of platforms) {
      try {
        console.log(chalk.cyan(`Posting to ${platform.getPlatform()}...`));
        const post = await platform.post(postOptions);
        results.push({
          platform: platform.getPlatform(),
          success: true,
          postId: post.id
        });
        console.log(formatSuccess(`Posted to ${platform.getPlatform()} (ID: ${post.id})`));
        if (post.url) {
          console.log(chalk.gray(`  ${post.url}`));
        }
      } catch (error: any) {
        results.push({
          platform: platform.getPlatform(),
          success: false,
          error: error.message
        });
        console.error(formatError(error));
      }
    }

    // Summary
    console.log('');
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      console.log(chalk.bold.green(`✓ Successfully posted to all ${totalCount} platform(s)`));
    } else {
      console.log(chalk.yellow(`⚠ Posted to ${successCount}/${totalCount} platform(s)`));
    }
  } catch (error: any) {
    console.error(formatError(error));
    process.exit(1);
  }
}
