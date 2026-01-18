#!/usr/bin/env node

/**
 * Main CLI entry point for Social Media Management System
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { runSetup } from '../auth/setup.js';
import { handlePost } from './commands/post.js';
import { handleFeed } from './commands/feed.js';
import { handleEngage } from './commands/engage.js';

const program = new Command();

program
  .name('social-cli')
  .description('Command-line social media management tool for X, Instagram, and LinkedIn')
  .version('1.0.0');

// Auth command with subcommand
const authCommand = program
  .command('auth')
  .description('Manage authentication credentials');

authCommand
  .command('setup')
  .description('Interactive setup wizard for API credentials')
  .action(async () => {
    try {
      await runSetup();
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Post command
program
  .command('post <text>')
  .description('Post to one or more social media platforms')
  .option('-p, --platform <platforms>', 'Platform(s) to post to (comma-separated)', 'twitter')
  .option('-m, --media <path>', 'Path or URL to media file')
  .option('-l, --link <url>', 'Link URL (for LinkedIn articles)')
  .option('--link-title <title>', 'Link title (for LinkedIn)')
  .option('-c, --caption <text>', 'Caption (for Instagram)')
  .action(handlePost);

// Feed command
program
  .command('feed')
  .description('View your social media feed')
  .option('-p, --platform <platform>', 'Platform to fetch feed from', 'twitter')
  .option('-l, --limit <number>', 'Number of posts to fetch', '20')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (options) => {
    await handleFeed({
      platform: options.platform,
      limit: parseInt(options.limit, 10),
      json: options.json
    });
  });

// Engage command
program
  .command('engage <postId> <action>')
  .description('Engage with a post (like, comment, share, retweet)')
  .option('-p, --platform <platform>', 'Platform', 'twitter')
  .option('-c, --comment <text>', 'Comment text (required for comment/reply action)')
  .action(handleEngage);

// Search command
program
  .command('search <query>')
  .description('Search for posts')
  .option('-p, --platform <platform>', 'Platform to search on', 'twitter')
  .option('-l, --limit <number>', 'Number of results', '20')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (query, options) => {
    try {
      const { parsePlatform, getPlatformInstance, formatError, formatPost, outputJson } = await import('./utils.js');

      const platform = parsePlatform(options.platform);
      const platformInstance = await getPlatformInstance(platform);

      console.log(chalk.cyan(`\nSearching ${platform} for: "${query}"...\n`));

      const posts = await platformInstance.search({
        query,
        limit: parseInt(options.limit, 10)
      });

      if (options.json) {
        outputJson(posts, true);
        return;
      }

      if (posts.length === 0) {
        console.log(chalk.yellow('No posts found.'));
        return;
      }

      console.log(chalk.bold(`🔍 Search Results (${posts.length} posts)\n`));

      for (const post of posts) {
        console.log(formatPost(post, false));
      }

      console.log(chalk.gray(`\nFound ${posts.length} post(s)`));
    } catch (error: any) {
      const { formatError } = await import('./utils.js');
      console.error(formatError(error));
      process.exit(1);
    }
  });

// Profile command
program
  .command('profile')
  .description('View your profile information')
  .option('-p, --platform <platform>', 'Platform', 'twitter')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      const { parsePlatform, getPlatformInstance, formatError, outputJson } = await import('./utils.js');

      const platform = parsePlatform(options.platform);
      const platformInstance = await getPlatformInstance(platform);

      console.log(chalk.cyan(`\nFetching profile from ${platform}...\n`));

      const profile = await platformInstance.getMe();

      if (options.json) {
        outputJson(profile, true);
        return;
      }

      console.log(chalk.bold(`👤 ${profile.displayName}`));
      console.log(chalk.gray(`@${profile.username} | ID: ${profile.id}`));

      if (profile.bio) {
        console.log(`\n${profile.bio}`);
      }

      if (profile.followersCount !== undefined || profile.followingCount !== undefined) {
        console.log('');
        const stats: string[] = [];
        if (profile.followersCount !== undefined) stats.push(`${profile.followersCount} followers`);
        if (profile.followingCount !== undefined) stats.push(`${profile.followingCount} following`);
        console.log(chalk.gray(stats.join(' | ')));
      }

      if (profile.verified) {
        console.log(chalk.blue('\n✓ Verified'));
      }
    } catch (error: any) {
      const { formatError } = await import('./utils.js');
      console.error(formatError(error));
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
