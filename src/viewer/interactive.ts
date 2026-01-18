#!/usr/bin/env node

/**
 * Interactive feed viewer with command input
 * Works in any terminal environment
 */

import * as readline from 'readline';
import { Platform, Post } from '../types/index.js';
import { hasCredentials, loadEnv } from '../auth/storage.js';
import { getPlatformInstance, parsePlatform } from '../cli/utils.js';
import { SocialPlatform } from '../platforms/base.js';
import { generateInstagramImage, isGeminiConfigured } from '../services/gemini-image.js';
import { generateCanvasImage, getAvailableStyles } from '../services/canvas-image.js';

// Store posts for reference by index
let currentPosts: Post[] = [];
let platforms: SocialPlatform[] = [];
let activePlatforms: Platform[] = [];

// ANSI escape codes for terminal control
const CLEAR_SCREEN = '\x1b[2J';
const MOVE_TO_TOP = '\x1b[H';
const SAVE_CURSOR = '\x1b[s';
const RESTORE_CURSOR = '\x1b[u';
const CLEAR_LINE = '\x1b[2K';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GRAY = '\x1b[90m';

interface CommandResult {
  success: boolean;
  message: string;
}

/**
 * Display the feed
 */
async function displayFeed(limit: number = 10): Promise<void> {
  currentPosts = [];

  // Clear screen and move to top
  process.stdout.write(CLEAR_SCREEN + MOVE_TO_TOP);

  console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}${BOLD}  📱 Following Feed - ${new Date().toLocaleString()}${RESET}`);
  console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}\n`);

  let postIndex = 1;

  for (const platform of platforms) {
    try {
      console.log(`${CYAN}━━━ ${platform.getPlatform().toUpperCase()} (Following) ━━━${RESET}`);

      // Use following feed by default
      const posts = 'getFollowingFeed' in platform
        ? await (platform as any).getFollowingFeed(limit)
        : await platform.getFeed({ limit });

      if (posts.length === 0) {
        console.log(`  ${GRAY}No posts found${RESET}`);
        continue;
      }

      for (const post of posts) {
        currentPosts.push(post);

        console.log(`\n  ${YELLOW}[${postIndex}]${RESET} ${BOLD}${post.author.displayName}${RESET} ${GRAY}@${post.author.username}${RESET}`);
        console.log(`      ${GRAY}${post.timestamp.toLocaleString()}${RESET}`);

        // Truncate long content
        const content = post.content.length > 120
          ? post.content.substring(0, 120) + '...'
          : post.content;
        console.log(`      ${content}`);

        // Metrics
        const metrics = [];
        if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
        if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
        if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
        if (metrics.length > 0) {
          console.log(`      ${GRAY}${metrics.join('  ')}${RESET}`);
        }

        postIndex++;
      }
      console.log('');
    } catch (error: any) {
      console.log(`  ${RED}❌ Error: ${error.message}${RESET}\n`);
    }
  }

  // Print command help
  printCommandHelp();
}

/**
 * Print command help at the bottom
 */
function printCommandHelp(): void {
  console.log(`${CYAN}════════════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}Commands:${RESET}`);
  console.log(`  ${GREEN}ff [n]${RESET} following    ${GREEN}f [n]${RESET} home feed    ${GREEN}my [n]${RESET} my posts`);
  console.log(`  ${GREEN}l <n>${RESET} like    ${GREEN}rt <n>${RESET} retweet    ${GREEN}rr <n> <text>${RESET} reply    ${GREEN}q <n> <text>${RESET} quote`);
  console.log(`  ${GREEN}p <text>${RESET} post    ${GREEN}pi <text>${RESET} AI image    ${GREEN}pip [style] <text>${RESET} vector image`);
  console.log(`  ${GREEN}cls${RESET} clear    ${GREEN}h${RESET} help    ${GREEN}quit${RESET} exit`);
  console.log(`${CYAN}════════════════════════════════════════════════════════════════════════════════${RESET}`);
}

/**
 * Process user command
 */
async function processCommand(input: string): Promise<CommandResult> {
  const parts = input.trim().split(/\s+/);
  const command = parts[0]?.toLowerCase();

  if (!command) {
    return { success: true, message: '' };
  }

  try {
    switch (command) {
      case 'like':
      case 'l': {
        const postNum = parseInt(parts[1], 10);
        if (isNaN(postNum) || postNum < 1 || postNum > currentPosts.length) {
          return { success: false, message: `Invalid post number. Use 1-${currentPosts.length}` };
        }
        const post = currentPosts[postNum - 1];
        const platform = await getPlatformForPost(post);
        await platform.engage({ postId: post.id, action: 'like' as any });
        return { success: true, message: `✅ Liked post #${postNum} by @${post.author.username}` };
      }

      case 'retweet':
      case 'rt': {
        const postNum = parseInt(parts[1], 10);
        if (isNaN(postNum) || postNum < 1 || postNum > currentPosts.length) {
          return { success: false, message: `Invalid post number. Use 1-${currentPosts.length}` };
        }
        const post = currentPosts[postNum - 1];
        const platform = await getPlatformForPost(post);
        await platform.engage({ postId: post.id, action: 'retweet' as any });
        return { success: true, message: `✅ Retweeted post #${postNum} by @${post.author.username}` };
      }

      case 'reply':
      case 'rr': {
        const postNum = parseInt(parts[1], 10);
        if (isNaN(postNum) || postNum < 1 || postNum > currentPosts.length) {
          return { success: false, message: `Invalid post number. Use 1-${currentPosts.length}` };
        }
        const text = parts.slice(2).join(' ');
        if (!text) {
          return { success: false, message: 'Reply text required. Usage: reply <n> <text>' };
        }
        const post = currentPosts[postNum - 1];
        const platform = await getPlatformForPost(post);
        await platform.engage({ postId: post.id, action: 'reply' as any, commentText: text });
        return { success: true, message: `✅ Replied to post #${postNum}` };
      }

      case 'quote':
      case 'q': {
        const postNum = parseInt(parts[1], 10);
        if (isNaN(postNum) || postNum < 1 || postNum > currentPosts.length) {
          return { success: false, message: `Invalid post number. Use 1-${currentPosts.length}` };
        }
        const text = parts.slice(2).join(' ');
        if (!text) {
          return { success: false, message: 'Quote text required. Usage: quote <n> <text>' };
        }
        const post = currentPosts[postNum - 1];
        const platform = await getPlatformForPost(post);
        // Quote tweet by posting with URL
        const quoteText = `${text} ${post.url}`;
        await platform.post({ text: quoteText });
        return { success: true, message: `✅ Quote tweeted post #${postNum}` };
      }

      case 'post':
      case 'p': {
        const text = parts.slice(1).join(' ');
        if (!text) {
          return { success: false, message: 'Post text required. Usage: post <text>' };
        }
        // Post to first available platform (Twitter)
        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }
        const result = await platform.post({ text });
        return { success: true, message: `✅ Posted! ID: ${result.id}` };
      }

      case 'postimg':
      case 'pi': {
        const text = parts.slice(1).join(' ');
        if (!text) {
          return { success: false, message: 'Post text required. Usage: pi <text>' };
        }

        // Check if Gemini is configured
        if (!isGeminiConfigured()) {
          return { success: false, message: 'Google AI API key not configured. Set GOOGLE_AI_API_KEY in .env' };
        }

        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }

        console.log(`${YELLOW}Generating Instagram-style image with Gemini...${RESET}`);

        try {
          // Generate image using Gemini
          const imageResult = await generateInstagramImage(text);
          console.log(`${GREEN}Image generated: ${imageResult.imagePath}${RESET}`);

          // Post with image
          const postResult = await platform.post({
            text,
            mediaUrls: [imageResult.imagePath],
            mediaPath: imageResult.imagePath
          });

          return { success: true, message: `✅ Posted with image! ID: ${postResult.id}` };
        } catch (error: any) {
          return { success: false, message: `❌ Image generation failed: ${error.message}` };
        }
      }

      case 'postimgprog':
      case 'pip': {
        // Handle "pip list" command
        if (parts[1] === 'list') {
          const availableStyles = getAvailableStyles();
          console.log(`\n${BOLD}Available Color Palettes:${RESET}`);
          console.log(`  ${GREEN}sunset${RESET}  - Warm orange/red gradient`);
          console.log(`  ${GREEN}ocean${RESET}   - Blue/cyan tones`);
          console.log(`  ${GREEN}purple${RESET}  - Purple/violet gradient`);
          console.log(`  ${GREEN}forest${RESET}  - Green nature tones`);
          console.log(`  ${GREEN}fire${RESET}    - Red/orange flames`);
          console.log(`  ${GREEN}neon${RESET}    - Vibrant pink/purple/blue (default)`);
          console.log(`\n${BOLD}Abstract Background Styles (randomly chosen):${RESET}`);
          console.log(`  ${CYAN}geometric${RESET}  - Triangles, circles, squares`);
          console.log(`  ${CYAN}waves${RESET}      - Layered sine wave patterns`);
          console.log(`  ${CYAN}blobs${RESET}      - Organic fluid shapes`);
          console.log(`  ${CYAN}particles${RESET}  - Dots with connecting lines`);
          console.log(`  ${CYAN}mesh${RESET}       - Distorted grid pattern`);
          console.log(`\n${BOLD}Usage:${RESET} pip [palette] <text>`);
          console.log(`${BOLD}Example:${RESET} pip sunset Hello World!`);
          return { success: true, message: '' };
        }

        // Parse: pip [style] <text>  OR  pip <text>
        const availableStyles = getAvailableStyles();
        let style = 'neon';
        let text = '';

        if (parts.length > 1 && availableStyles.includes(parts[1])) {
          style = parts[1];
          text = parts.slice(2).join(' ');
        } else {
          text = parts.slice(1).join(' ');
        }

        if (!text) {
          return {
            success: false,
            message: `Post text required. Usage: pip [style] <text>\nStyles: ${availableStyles.join(', ')}\nUse "pip list" to see all options.`
          };
        }

        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }

        console.log(`${YELLOW}Generating programmatic image (style: ${style})...${RESET}`);

        try {
          // Generate image using canvas
          const imageResult = await generateCanvasImage(text, style as any);
          console.log(`${GREEN}Image generated: ${imageResult.imagePath}${RESET}`);

          // Post with image
          const postResult = await platform.post({
            text,
            mediaUrls: [imageResult.imagePath],
            mediaPath: imageResult.imagePath
          });

          return { success: true, message: `✅ Posted with programmatic image! ID: ${postResult.id}` };
        } catch (error: any) {
          return { success: false, message: `❌ Image generation failed: ${error.message}` };
        }
      }

      case 'myposts':
      case 'my': {
        const limit = parseInt(parts[1], 10) || 10;
        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }

        // Check if platform has getMyPosts method (Twitter)
        if (!('getMyPosts' in platform)) {
          return { success: false, message: 'This platform does not support viewing your posts' };
        }

        console.log(`\n${CYAN}━━━ YOUR LAST ${limit} POSTS ━━━${RESET}\n`);

        try {
          const myPosts = await (platform as any).getMyPosts(limit);

          if (myPosts.length === 0) {
            console.log(`  ${GRAY}No posts found${RESET}`);
          } else {
            for (let i = 0; i < myPosts.length; i++) {
              const post = myPosts[i];
              console.log(`  ${YELLOW}[${i + 1}]${RESET} ${GRAY}${post.timestamp.toLocaleString()}${RESET}`);

              // Truncate long content
              const content = post.content.length > 100
                ? post.content.substring(0, 100) + '...'
                : post.content;
              console.log(`      ${content}`);

              // Metrics
              const metrics = [];
              if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
              if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
              if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
              if (metrics.length > 0) {
                console.log(`      ${GRAY}${metrics.join('  ')}${RESET}`);
              }

              // URL
              if (post.url) {
                console.log(`      ${GRAY}${post.url}${RESET}`);
              }
              console.log('');
            }
          }
        } catch (error: any) {
          console.log(`  ${RED}❌ Error: ${error.message}${RESET}`);
        }

        return { success: true, message: '' };
      }

      case 'refresh':
      case 'ref':
      case 'r': {
        return { success: false, message: 'Use "f" for home feed or "ff" for following feed' };
      }

      case 'feed':
      case 'f': {
        const limit = parseInt(parts[1], 10) || 10;
        console.log(`\n${CYAN}━━━ HOME FEED (For You) ━━━${RESET}\n`);

        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }

        try {
          const posts = await platform.getFeed({ limit });
          currentPosts = posts;

          if (posts.length === 0) {
            console.log(`  ${GRAY}No posts found${RESET}`);
          } else {
            for (let i = 0; i < posts.length; i++) {
              const post = posts[i];
              console.log(`  ${YELLOW}[${i + 1}]${RESET} ${BOLD}${post.author.displayName}${RESET} ${GRAY}@${post.author.username}${RESET}`);
              console.log(`      ${GRAY}${post.timestamp.toLocaleString()}${RESET}`);

              const content = post.content.length > 120
                ? post.content.substring(0, 120) + '...'
                : post.content;
              console.log(`      ${content}`);

              const metrics = [];
              if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
              if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
              if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
              if (metrics.length > 0) {
                console.log(`      ${GRAY}${metrics.join('  ')}${RESET}`);
              }

              if (post.url) {
                console.log(`      ${GRAY}${post.url}${RESET}`);
              }
              console.log('');
            }
          }
        } catch (error: any) {
          console.log(`  ${RED}❌ Error: ${error.message}${RESET}`);
        }

        return { success: true, message: '' };
      }

      case 'following':
      case 'ff': {
        const limit = parseInt(parts[1], 10) || 10;
        console.log(`\n${CYAN}━━━ FOLLOWING FEED (People You Follow) ━━━${RESET}\n`);

        const platform = platforms[0];
        if (!platform) {
          return { success: false, message: 'No platform available' };
        }

        if (!('getFollowingFeed' in platform)) {
          return { success: false, message: 'This platform does not support following feed' };
        }

        try {
          const posts = await (platform as any).getFollowingFeed(limit);
          currentPosts = posts;

          if (posts.length === 0) {
            console.log(`  ${GRAY}No posts found${RESET}`);
          } else {
            for (let i = 0; i < posts.length; i++) {
              const post = posts[i];
              console.log(`  ${YELLOW}[${i + 1}]${RESET} ${BOLD}${post.author.displayName}${RESET} ${GRAY}@${post.author.username}${RESET}`);
              console.log(`      ${GRAY}${post.timestamp.toLocaleString()}${RESET}`);

              const content = post.content.length > 120
                ? post.content.substring(0, 120) + '...'
                : post.content;
              console.log(`      ${content}`);

              const metrics = [];
              if (post.likesCount !== undefined) metrics.push(`❤️  ${post.likesCount}`);
              if (post.commentsCount !== undefined) metrics.push(`💬 ${post.commentsCount}`);
              if (post.sharesCount !== undefined) metrics.push(`🔄 ${post.sharesCount}`);
              if (metrics.length > 0) {
                console.log(`      ${GRAY}${metrics.join('  ')}${RESET}`);
              }

              if (post.url) {
                console.log(`      ${GRAY}${post.url}${RESET}`);
              }
              console.log('');
            }
          }
        } catch (error: any) {
          console.log(`  ${RED}❌ Error: ${error.message}${RESET}`);
        }

        return { success: true, message: '' };
      }

      case 'help':
      case 'h':
      case '?': {
        console.log(`\n${BOLD}All Commands:${RESET}`);
        console.log(`  ${GREEN}feed [n]${RESET} or ${GREEN}f [n]${RESET}      - Show home feed / For You (default: 10)`);
        console.log(`  ${GREEN}following [n]${RESET} or ${GREEN}ff [n]${RESET} - Show posts from people you follow`);
        console.log(`  ${GREEN}myposts [n]${RESET} or ${GREEN}my [n]${RESET}  - Show your last n posts (default: 10)`);
        console.log(`  ${GREEN}like <n>${RESET} or ${GREEN}l <n>${RESET}       - Like post number n`);
        console.log(`  ${GREEN}retweet <n>${RESET} or ${GREEN}rt <n>${RESET}   - Retweet post number n`);
        console.log(`  ${GREEN}reply <n> <text>${RESET} or ${GREEN}rr <n> <text>${RESET} - Reply to post n`);
        console.log(`  ${GREEN}quote <n> <text>${RESET} or ${GREEN}q <n> <text>${RESET} - Quote tweet post n`);
        console.log(`  ${GREEN}post <text>${RESET} or ${GREEN}p <text>${RESET} - Post new tweet (text only)`);
        console.log(`  ${GREEN}postimg <text>${RESET} or ${GREEN}pi <text>${RESET} - Post with AI-generated image (Gemini)`);
        console.log(`  ${GREEN}pip [style] <text>${RESET}    - Post with programmatic vector image`);
        console.log(`      Styles: sunset, ocean, purple, forest, fire, neon (default)`);
        console.log(`  ${GREEN}clear${RESET} or ${GREEN}cls${RESET}           - Clear screen`);
        console.log(`  ${GREEN}quit${RESET} or ${GREEN}exit${RESET}           - Exit the viewer`);
        console.log(`\n${BOLD}Examples:${RESET}`);
        console.log(`  ff 15                  - Show 15 posts from following`);
        console.log(`  p Hello world!         - Post text only`);
        console.log(`  pi Check this out!     - Post with Gemini AI image`);
        console.log(`  pip Hello!             - Post with neon style image`);
        console.log(`  pip sunset Good vibes! - Post with sunset style image`);
        return { success: true, message: '' };
      }

      case 'clear':
      case 'cls': {
        // Clear screen
        process.stdout.write(CLEAR_SCREEN + MOVE_TO_TOP);
        console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
        console.log(`${CYAN}${BOLD}  📱 Social Media Interactive Console${RESET}`);
        console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}\n`);
        printCommandHelp();
        return { success: true, message: '' };
      }

      case 'quit':
      case 'exit':
      case 'x': {
        return { success: true, message: 'EXIT' };
      }

      default:
        return { success: false, message: `Unknown command: ${command}. Type 'help' for commands.` };
    }
  } catch (error: any) {
    return { success: false, message: `❌ Error: ${error.message}` };
  }
}

/**
 * Get platform instance for a post
 */
async function getPlatformForPost(post: Post): Promise<SocialPlatform> {
  const platform = platforms.find(p => p.getPlatform() === post.platform);
  if (!platform) {
    throw new Error(`Platform ${post.platform} not available`);
  }
  return platform;
}

/**
 * Main interactive loop
 */
async function main(): Promise<void> {
  // Load credentials
  loadEnv();

  // Detect configured platforms
  activePlatforms = [];
  if (hasCredentials(Platform.TWITTER)) activePlatforms.push(Platform.TWITTER);
  if (hasCredentials(Platform.INSTAGRAM)) activePlatforms.push(Platform.INSTAGRAM);
  if (hasCredentials(Platform.LINKEDIN)) activePlatforms.push(Platform.LINKEDIN);

  if (activePlatforms.length === 0) {
    console.error('❌ No credentials found. Please run "social-cli auth setup" first.');
    process.exit(1);
  }

  // Initialize platform instances
  console.log('Initializing platforms...');
  for (const p of activePlatforms) {
    try {
      const instance = await getPlatformInstance(p);
      platforms.push(instance);
      console.log(`✅ ${p} connected`);
    } catch (error: any) {
      console.error(`❌ Failed to connect ${p}: ${error.message}`);
    }
  }

  if (platforms.length === 0) {
    console.error('❌ No platforms could be initialized.');
    process.exit(1);
  }

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  // Show welcome screen (no feed fetch)
  console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}${BOLD}  📱 Social Media Interactive Console${RESET}`);
  console.log(`${CYAN}${BOLD}════════════════════════════════════════════════════════════════════════════════${RESET}\n`);
  console.log(`${GRAY}Use ${GREEN}ff${GRAY} to load following feed or ${GREEN}f${GRAY} to load home feed${RESET}\n`);
  printCommandHelp();

  // Command prompt
  const prompt = () => {
    rl.question(`\n${CYAN}>${RESET} `, async (input) => {
      const result = await processCommand(input);

      if (result.message === 'EXIT') {
        console.log(`\n${GREEN}Goodbye!${RESET}\n`);
        rl.close();
        process.exit(0);
      }

      if (result.message === 'REFRESH') {
        await displayFeed(10);
      } else if (result.message) {
        if (result.success) {
          console.log(`${GREEN}${result.message}${RESET}`);
        } else {
          console.log(`${RED}${result.message}${RESET}`);
        }
      }

      prompt();
    });
  };

  prompt();

  // Handle Ctrl+C
  rl.on('close', () => {
    console.log(`\n${GREEN}Goodbye!${RESET}\n`);
    process.exit(0);
  });

  // Auto-refresh every 2 minutes (optional - can be disabled)
  const autoRefresh = process.argv.includes('--auto-refresh');
  if (autoRefresh) {
    setInterval(async () => {
      console.log(`\n${GRAY}[Auto-refreshing...]${RESET}`);
      await displayFeed(10);
      process.stdout.write(`${CYAN}>${RESET} `);
    }, 120000);
  }
}

// Handle arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${BOLD}Interactive Social Media Feed Viewer${RESET}

Usage: npm run viewer:interactive [options]

Options:
  --auto-refresh    Auto-refresh feed every 2 minutes
  --help, -h        Show this help

Commands (in interactive mode):
  like <n>          Like post number n
  retweet <n>       Retweet post number n
  reply <n> <text>  Reply to post n with text
  quote <n> <text>  Quote tweet post n with text
  post <text>       Post a new tweet
  refresh           Refresh the feed
  help              Show all commands
  quit              Exit

Examples:
  like 3            Like the 3rd post in the feed
  rt 1              Retweet the 1st post
  reply 2 Nice!     Reply "Nice!" to post #2
  post Hello!       Post "Hello!" as a new tweet
`);
  process.exit(0);
}

// Run
main().catch((error) => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
