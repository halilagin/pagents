#!/usr/bin/env node
/**
 * Quote Mentions CLI Tool
 * Gets the newest 10 replies to @hailo_berto and quote-tweets them with mentions from handles file
 */

import { TwitterApi } from 'twitter-api-v2';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
dotenv.config({ path: join(projectRoot, '.env') });

const HANDLE = 'hailo_berto';
const REPLIES_LIMIT = 3;
const MENTIONS_PER_BATCH = 40;
const HANDLES_FILE = join(projectRoot, 'us.x.handles.txt');

// Delay function to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    console.log('🚀 Starting quote-mentions tool...\n');

    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    console.log('✅ Authenticated with Twitter API\n');

    // Get user ID for @hailo_berto
    console.log(`🔍 Looking up user @${HANDLE}...`);
    const user = await client.v2.userByUsername(HANDLE);
    const userId = user.data.id;
    console.log(`✅ Found user: @${HANDLE} (ID: ${userId})\n`);

    // Get mentions (replies) to the user
    console.log(`📥 Fetching ${REPLIES_LIMIT} most recent mentions...`);
    const mentions = await client.v2.userMentionTimeline(userId, {
      max_results: REPLIES_LIMIT,
      'tweet.fields': ['created_at', 'author_id', 'conversation_id'],
      'user.fields': ['username'],
      expansions: ['author_id']
    });

    const tweets = mentions.data.data || [];
    console.log(`✅ Found ${tweets.length} mentions\n`);

    if (tweets.length === 0) {
      console.log('⚠️  No mentions found. Exiting.');
      return;
    }

    // Read handles from file
    console.log(`📄 Reading handles from ${HANDLES_FILE}...`);
    const handlesContent = readFileSync(HANDLES_FILE, 'utf-8');
    const allHandles = handlesContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.startsWith('@'));

    console.log(`✅ Loaded ${allHandles.length} handles\n`);

    // Split handles into batches of 50
    const batches: string[][] = [];
    for (let i = 0; i < allHandles.length; i += MENTIONS_PER_BATCH) {
      batches.push(allHandles.slice(i, i + MENTIONS_PER_BATCH));
    }

    console.log(`📦 Created ${batches.length} batches of handles\n`);

    // Process each reply
    let quoteCount = 0;
    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      const author = mentions.includes?.users?.find(u => u.id === tweet.author_id);
      const authorUsername = author?.username || 'unknown';

      console.log(`\n📝 Processing reply ${i + 1}/${tweets.length}`);
      console.log(`   Author: @${authorUsername}`);
      console.log(`   Tweet ID: ${tweet.id}`);
      console.log(`   Content: ${tweet.text.substring(0, 80)}${tweet.text.length > 80 ? '...' : ''}`);

      // Quote this tweet with each batch of mentions
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const mentionsText = batch.join(' ');

        // Twitter has a 280 character limit, so we need to be careful
        // Format: [mentions] (quote tweet)
        const quoteText = mentionsText;

        console.log(`\n   📤 Quote-tweeting with batch ${batchIndex + 1}/${batches.length} (${batch.length} handles)...`);

        try {
          const quoteTweet = await client.v2.tweet({
            text: quoteText,
            quote_tweet_id: tweet.id
          });

          quoteCount++;
          console.log(`   ✅ Quote tweet posted: https://twitter.com/i/web/status/${quoteTweet.data.id}`);

          // Wait 2 seconds between posts to avoid rate limits
          if (batchIndex < batches.length - 1 || i < tweets.length - 1) {
            console.log(`   ⏳ Waiting 2 seconds...`);
            await delay(2000);
          }
        } catch (error: any) {
          console.error(`   ❌ Error posting quote tweet: ${error.message}`);
          if (error.code === 429) {
            console.log(`   ⚠️  Rate limit hit. Waiting 60 seconds...`);
            await delay(60000);
            // Retry this batch
            batchIndex--;
            continue;
          }
        }
      }
    }

    console.log(`\n\n🎉 Done! Posted ${quoteCount} quote tweets.`);
    console.log(`   - Processed ${tweets.length} replies`);
    console.log(`   - Used ${batches.length} batches of handles`);
    console.log(`   - Total mentions per reply: ${allHandles.length}`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

main();
