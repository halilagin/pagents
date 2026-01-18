#!/usr/bin/env node

/**
 * Non-interactive feed watcher for non-TTY environments
 * Works in CI/CD, automation, and command execution tools like Claude Code
 */

import { Platform } from '../types/index.js';
import { hasCredentials, loadEnv } from '../auth/storage.js';
import { getPlatformInstance } from '../cli/utils.js';

interface WatchOptions {
  interval?: number;  // Refresh interval in seconds
  limit?: number;     // Posts per platform
  once?: boolean;     // Run once then exit
}

async function displayFeed(platforms: Platform[], limit: number) {
  console.log('\n' + '='.repeat(80));
  console.log(`📱 Social Media Feed - ${new Date().toLocaleString()}`);
  console.log('='.repeat(80) + '\n');

  for (const platform of platforms) {
    try {
      console.log(`\n🔵 ${platform.toUpperCase()} Feed:`);
      console.log('-'.repeat(80));

      const instance = await getPlatformInstance(platform);
      const posts = await instance.getFeed({ limit });

      if (posts.length === 0) {
        console.log('  No posts found');
        continue;
      }

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`\n  [${i + 1}/${posts.length}] ${post.author.displayName} (@${post.author.username})`);
        console.log(`  📅 ${post.timestamp.toLocaleString()}`);
        console.log(`  💬 ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}`);

        const metrics = [];
        if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
        if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
        if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
        if (metrics.length > 0) {
          console.log(`  ${metrics.join('  ')}`);
        }

        if (post.url) {
          console.log(`  🔗 ${post.url}`);
        }
      }

      console.log('');
    } catch (error: any) {
      console.error(`  ❌ Error fetching ${platform} feed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

async function watch(options: WatchOptions = {}) {
  const interval = options.interval || 60;
  const limit = options.limit || 10;
  const once = options.once || false;

  // Load credentials
  loadEnv();

  // Detect configured platforms
  const platforms: Platform[] = [];
  if (hasCredentials(Platform.TWITTER)) platforms.push(Platform.TWITTER);
  if (hasCredentials(Platform.INSTAGRAM)) platforms.push(Platform.INSTAGRAM);
  if (hasCredentials(Platform.LINKEDIN)) platforms.push(Platform.LINKEDIN);

  if (platforms.length === 0) {
    console.error('❌ No credentials found. Please run "social-cli auth setup" first.');
    process.exit(1);
  }

  console.log(`\n✅ Watching ${platforms.length} platform(s): ${platforms.join(', ')}`);
  console.log(`📊 Showing ${limit} posts per platform`);

  if (!once) {
    console.log(`🔄 Refreshing every ${interval} seconds (Press Ctrl+C to stop)`);
  }

  // Initial display
  await displayFeed(platforms, limit);

  if (once) {
    console.log('✅ Done (--once mode)');
    process.exit(0);
  }

  // Watch mode - periodic updates
  setInterval(async () => {
    await displayFeed(platforms, limit);
  }, interval * 1000);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: WatchOptions = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--interval' && args[i + 1]) {
    options.interval = parseInt(args[i + 1], 10);
    i++;
  } else if (arg === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (arg === '--once') {
    options.once = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: social-watch [options]

Non-interactive feed watcher that works in any environment.

Options:
  --interval <seconds>  Refresh interval in seconds (default: 60)
  --limit <number>      Number of posts per platform (default: 10)
  --once                Run once and exit (no watching)
  --help, -h            Show this help message

Examples:
  social-watch                      # Watch with default settings
  social-watch --interval 30        # Refresh every 30 seconds
  social-watch --limit 5            # Show 5 posts per platform
  social-watch --once               # Show feeds once and exit
  social-watch --once --limit 3     # Quick check of latest 3 posts

Note: This tool works in non-TTY environments (CI/CD, automation, etc.)
      For interactive mode in a real terminal, use: npm run viewer
`);
    process.exit(0);
  }
}

// Run the watcher
watch(options).catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
