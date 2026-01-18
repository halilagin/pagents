/**
 * Feed command implementation
 */

import chalk from 'chalk';
import { FeedOptions } from '../../types/index.js';
import { parsePlatform, getPlatformInstance, formatError, formatPost, outputJson } from '../utils.js';

interface FeedCommandOptions {
  platform: string;
  limit?: number;
  json?: boolean;
}

/**
 * Handle feed command
 */
export async function handleFeed(options: FeedCommandOptions): Promise<void> {
  try {
    const platform = parsePlatform(options.platform);
    const platformInstance = await getPlatformInstance(platform);

    console.log(chalk.cyan(`\nFetching feed from ${platform}...\n`));

    const feedOptions: FeedOptions = {
      limit: options.limit || 20
    };

    const posts = await platformInstance.getFeed(feedOptions);

    if (options.json) {
      outputJson(posts, true);
      return;
    }

    if (posts.length === 0) {
      console.log(chalk.yellow('No posts found in your feed.'));
      return;
    }

    console.log(chalk.bold(`📱 ${platform.toUpperCase()} Feed (${posts.length} posts)\n`));

    for (const post of posts) {
      console.log(formatPost(post, false));
    }

    console.log(chalk.gray(`\nShowing ${posts.length} post(s)`));
  } catch (error: any) {
    console.error(formatError(error));
    process.exit(1);
  }
}
