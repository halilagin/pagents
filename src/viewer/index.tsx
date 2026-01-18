#!/usr/bin/env node

/**
 * Real-time feed viewer with Ink
 */

// Check if stdin is a TTY before importing Ink
if (!process.stdin.isTTY) {
  console.error('❌ Error: Feed viewer requires an interactive terminal (TTY).');
  console.error('');
  console.error('This tool cannot run in:');
  console.error('  • Non-interactive environments');
  console.error('  • Piped or redirected stdin');
  console.error('  • Command execution tools');
  console.error('');
  console.error('Please run this in a proper terminal:');
  console.error('  • Terminal.app');
  console.error('  • iTerm2');
  console.error('  • VS Code integrated terminal');
  console.error('  • Any terminal emulator');
  console.error('');
  console.error('Alternative: Use the CLI tool instead:');
  console.error('  social-cli feed --platform twitter');
  process.exit(1);
}

import React, { useState, useEffect } from 'react';
import { render, Box, useInput, useApp } from 'ink';
import { Header } from './components/Header.js';
import { Feed } from './components/Feed.js';
import { Platform, Post } from '../types/index.js';
import { hasCredentials, loadEnv } from '../auth/storage.js';
import { getPlatformInstance } from '../cli/utils.js';

interface FeedState {
  posts: Post[];
  loading: boolean;
  error?: string;
}

interface AppState {
  twitter: FeedState;
  instagram: FeedState;
  linkedin: FeedState;
  lastUpdated: Date;
  activePlatforms: Platform[];
}

const FeedViewer: React.FC = () => {
  const { exit } = useApp();

  const [state, setState] = useState<AppState>({
    twitter: { posts: [], loading: false },
    instagram: { posts: [], loading: false },
    linkedin: { posts: [], loading: false },
    lastUpdated: new Date(),
    activePlatforms: []
  });

  // Initialize and load credentials
  useEffect(() => {
    loadEnv();
    const active: Platform[] = [];

    if (hasCredentials(Platform.TWITTER)) active.push(Platform.TWITTER);
    if (hasCredentials(Platform.INSTAGRAM)) active.push(Platform.INSTAGRAM);
    if (hasCredentials(Platform.LINKEDIN)) active.push(Platform.LINKEDIN);

    setState(prev => ({ ...prev, activePlatforms: active }));

    if (active.length === 0) {
      console.error('No credentials found. Please run "social-cli auth setup" first.');
      exit();
    } else {
      // Initial load
      loadAllFeeds(active, setState);
    }
  }, [exit]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (state.activePlatforms.length === 0) return;

    const interval = setInterval(() => {
      loadAllFeeds(state.activePlatforms, setState);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [state.activePlatforms]);

  // Handle keyboard input
  useInput((input: string, key: any) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    } else if (input === 'r') {
      loadAllFeeds(state.activePlatforms, setState);
    } else if (input === '1') {
      togglePlatform(Platform.TWITTER, state, setState);
    } else if (input === '2') {
      togglePlatform(Platform.INSTAGRAM, state, setState);
    } else if (input === '3') {
      togglePlatform(Platform.LINKEDIN, state, setState);
    }
  });

  return (
    <Box flexDirection="column">
      <Header
        title="🚀 Social Media Feed Viewer"
        lastUpdated={state.lastUpdated}
        activePlatforms={state.activePlatforms.map(p => p.toUpperCase())}
      />

      <Box>
        {state.activePlatforms.includes(Platform.TWITTER) && (
          <Feed
            platform={Platform.TWITTER}
            posts={state.twitter.posts}
            loading={state.twitter.loading}
            error={state.twitter.error}
          />
        )}

        {state.activePlatforms.includes(Platform.INSTAGRAM) && (
          <Feed
            platform={Platform.INSTAGRAM}
            posts={state.instagram.posts}
            loading={state.instagram.loading}
            error={state.instagram.error}
          />
        )}

        {state.activePlatforms.includes(Platform.LINKEDIN) && (
          <Feed
            platform={Platform.LINKEDIN}
            posts={state.linkedin.posts}
            loading={state.linkedin.loading}
            error={state.linkedin.error}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Load feeds from all active platforms
 */
async function loadAllFeeds(
  platforms: Platform[],
  setState: React.Dispatch<React.SetStateAction<AppState>>
): Promise<void> {
  for (const platform of platforms) {
    await loadFeed(platform, setState);
  }

  setState(prev => ({ ...prev, lastUpdated: new Date() }));
}

/**
 * Load feed from a single platform
 */
async function loadFeed(
  platform: Platform,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): Promise<void> {
  const platformKey = platform as 'twitter' | 'instagram' | 'linkedin';

  // Set loading state
  setState(prev => ({
    ...prev,
    [platformKey]: { ...prev[platformKey], loading: true, error: undefined }
  }));

  try {
    const instance = await getPlatformInstance(platform);
    const posts = await instance.getFeed({ limit: 20 });

    setState(prev => ({
      ...prev,
      [platformKey]: { posts, loading: false, error: undefined }
    }));
  } catch (error: any) {
    setState(prev => ({
      ...prev,
      [platformKey]: { posts: [], loading: false, error: error.message }
    }));
  }
}

/**
 * Toggle platform visibility
 */
function togglePlatform(
  platform: Platform,
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): void {
  if (!hasCredentials(platform)) return;

  const isActive = state.activePlatforms.includes(platform);

  if (isActive) {
    setState(prev => ({
      ...prev,
      activePlatforms: prev.activePlatforms.filter(p => p !== platform)
    }));
  } else {
    setState(prev => ({
      ...prev,
      activePlatforms: [...prev.activePlatforms, platform]
    }));
    loadFeed(platform, setState);
  }
}

// Run the app
render(<FeedViewer />);
