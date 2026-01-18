/**
 * Credential storage and management
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Platform, PlatformConfig } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root (two levels up from src/auth/)
const projectRoot = path.resolve(__dirname, '../../');
const envPath = path.join(projectRoot, '.env');

/**
 * Load environment variables from .env file
 */
export function loadEnv(): void {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

/**
 * Save credentials to .env file
 */
export function saveCredentials(platform: Platform, config: PlatformConfig): void {
  let envContent = '';

  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Remove old credentials for this platform
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => {
    const upperPlatform = platform.toUpperCase();
    return !line.trim().startsWith(`${upperPlatform}_`);
  });

  // Add new credentials
  const newLines: string[] = [];

  if (platform === Platform.TWITTER) {
    newLines.push(`# X/Twitter API Credentials`);
    if (config.apiKey) newLines.push(`TWITTER_API_KEY=${config.apiKey}`);
    if (config.apiSecret) newLines.push(`TWITTER_API_SECRET=${config.apiSecret}`);
    if (config.accessToken) newLines.push(`TWITTER_ACCESS_TOKEN=${config.accessToken}`);
    if (config.accessSecret) newLines.push(`TWITTER_ACCESS_SECRET=${config.accessSecret}`);
    if (config.bearerToken) newLines.push(`TWITTER_BEARER_TOKEN=${config.bearerToken}`);
  } else if (platform === Platform.INSTAGRAM) {
    newLines.push(`# Instagram Graph API Credentials`);
    if (config.accessToken) newLines.push(`INSTAGRAM_ACCESS_TOKEN=${config.accessToken}`);
    if (config.userId) newLines.push(`INSTAGRAM_USER_ID=${config.userId}`);
    if (config.appId) newLines.push(`INSTAGRAM_APP_ID=${config.appId}`);
    if (config.apiSecret) newLines.push(`INSTAGRAM_APP_SECRET=${config.apiSecret}`);
  } else if (platform === Platform.LINKEDIN) {
    newLines.push(`# LinkedIn API Credentials`);
    if (config.clientId) newLines.push(`LINKEDIN_CLIENT_ID=${config.clientId}`);
    if (config.clientSecret) newLines.push(`LINKEDIN_CLIENT_SECRET=${config.clientSecret}`);
    if (config.accessToken) newLines.push(`LINKEDIN_ACCESS_TOKEN=${config.accessToken}`);
    if (config.redirectUri) newLines.push(`LINKEDIN_REDIRECT_URI=${config.redirectUri}`);
  }

  // Combine filtered lines with new lines
  const finalContent = [...filteredLines, '', ...newLines].join('\n');

  // Write to .env file
  fs.writeFileSync(envPath, finalContent, 'utf-8');
}

/**
 * Get credentials for a platform
 */
export function getCredentials(platform: Platform): PlatformConfig | null {
  loadEnv();

  if (platform === Platform.TWITTER) {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!accessToken && !bearerToken) {
      return null;
    }

    return {
      apiKey,
      apiSecret,
      accessToken: accessToken || '',
      accessSecret,
      bearerToken
    };
  } else if (platform === Platform.INSTAGRAM) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;
    const appId = process.env.INSTAGRAM_APP_ID;
    const apiSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!accessToken || !userId) {
      return null;
    }

    return {
      accessToken,
      userId,
      appId,
      apiSecret
    };
  } else if (platform === Platform.LINKEDIN) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!accessToken) {
      return null;
    }

    return {
      clientId,
      clientSecret,
      accessToken,
      redirectUri
    };
  }

  return null;
}

/**
 * Check if credentials exist for a platform
 */
export function hasCredentials(platform: Platform): boolean {
  return getCredentials(platform) !== null;
}

/**
 * Delete credentials for a platform
 */
export function deleteCredentials(platform: Platform): void {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  const upperPlatform = platform.toUpperCase();

  // Filter out lines for this platform
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith(`${upperPlatform}_`) &&
           !trimmed.startsWith(`# ${platform}`) &&
           !trimmed.startsWith(`# ${upperPlatform}`);
  });

  fs.writeFileSync(envPath, filteredLines.join('\n'), 'utf-8');
}
