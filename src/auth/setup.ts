/**
 * Interactive authentication setup wizard
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { Platform, PlatformConfig } from '../types/index.js';
import { saveCredentials, hasCredentials, getCredentials } from './storage.js';
import { performLinkedInOAuth } from './oauth.js';

interface SetupChoice {
  name: string;
  value: Platform;
}

/**
 * Main setup function
 */
export async function runSetup(): Promise<void> {
  console.log(chalk.bold.blue('\n🚀 Social Media Management System - Authentication Setup\n'));

  const { platforms } = await inquirer.prompt<{ platforms: Platform[] }>([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Which platforms do you want to set up?',
      choices: [
        { name: 'X (Twitter)', value: Platform.TWITTER },
        { name: 'Instagram', value: Platform.INSTAGRAM },
        { name: 'LinkedIn', value: Platform.LINKEDIN }
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return 'You must choose at least one platform.';
        }
        return true;
      }
    }
  ]);

  for (const platform of platforms) {
    await setupPlatform(platform);
  }

  console.log(chalk.bold.green('\n✅ Setup complete! You can now use the social-cli tool.\n'));
}

/**
 * Setup a specific platform
 */
async function setupPlatform(platform: Platform): Promise<void> {
  console.log(chalk.bold.yellow(`\n📱 Setting up ${platform.toUpperCase()}...\n`));

  // Check if credentials already exist
  if (hasCredentials(platform)) {
    const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Credentials for ${platform} already exist. Do you want to overwrite them?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.gray('Skipping...'));
      return;
    }
  }

  switch (platform) {
    case Platform.TWITTER:
      await setupTwitter();
      break;
    case Platform.INSTAGRAM:
      await setupInstagram();
      break;
    case Platform.LINKEDIN:
      await setupLinkedIn();
      break;
  }
}

/**
 * Setup Twitter/X
 */
async function setupTwitter(): Promise<void> {
  console.log(chalk.cyan('\nTwitter/X API Setup Instructions:'));
  console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
  console.log('2. Create a new app or select an existing one');
  console.log('3. Go to "Keys and tokens" section');
  console.log('4. Generate/copy your API keys and access tokens\n');

  const answers = await inquirer.prompt<{
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
    bearerToken?: string;
  }>([
    {
      type: 'input',
      name: 'apiKey',
      message: 'API Key (Consumer Key):',
      validate: (input) => input.trim() !== '' || 'API Key is required'
    },
    {
      type: 'password',
      name: 'apiSecret',
      message: 'API Secret (Consumer Secret):',
      validate: (input) => input.trim() !== '' || 'API Secret is required'
    },
    {
      type: 'input',
      name: 'accessToken',
      message: 'Access Token:',
      validate: (input) => input.trim() !== '' || 'Access Token is required'
    },
    {
      type: 'password',
      name: 'accessSecret',
      message: 'Access Token Secret:',
      validate: (input) => input.trim() !== '' || 'Access Token Secret is required'
    },
    {
      type: 'input',
      name: 'bearerToken',
      message: 'Bearer Token (optional, for read-only access):'
    }
  ]);

  const config: PlatformConfig = {
    apiKey: answers.apiKey.trim(),
    apiSecret: answers.apiSecret.trim(),
    accessToken: answers.accessToken.trim(),
    accessSecret: answers.accessSecret.trim(),
    bearerToken: answers.bearerToken?.trim()
  };

  saveCredentials(Platform.TWITTER, config);
  console.log(chalk.green('✓ Twitter credentials saved!'));
}

/**
 * Setup Instagram
 */
async function setupInstagram(): Promise<void> {
  console.log(chalk.cyan('\nInstagram Graph API Setup Instructions:'));
  console.log('1. Go to https://developers.facebook.com/apps/');
  console.log('2. Create a new app or select an existing one');
  console.log('3. Add Instagram Graph API product');
  console.log('4. Connect your Instagram Business account');
  console.log('5. Generate a User Access Token with required permissions');
  console.log('   Required: instagram_basic, instagram_content_publish, pages_read_engagement\n');
  console.log(chalk.yellow('Note: Requires Instagram Business or Creator account!\n'));

  const answers = await inquirer.prompt<{
    accessToken: string;
    userId: string;
    appId?: string;
    appSecret?: string;
  }>([
    {
      type: 'input',
      name: 'accessToken',
      message: 'User Access Token:',
      validate: (input) => input.trim() !== '' || 'Access Token is required'
    },
    {
      type: 'input',
      name: 'userId',
      message: 'Instagram Business Account ID:',
      validate: (input) => input.trim() !== '' || 'User ID is required'
    },
    {
      type: 'input',
      name: 'appId',
      message: 'App ID (optional):'
    },
    {
      type: 'password',
      name: 'appSecret',
      message: 'App Secret (optional):'
    }
  ]);

  const config: PlatformConfig = {
    accessToken: answers.accessToken.trim(),
    userId: answers.userId.trim(),
    appId: answers.appId?.trim(),
    apiSecret: answers.appSecret?.trim()
  };

  saveCredentials(Platform.INSTAGRAM, config);
  console.log(chalk.green('✓ Instagram credentials saved!'));
}

/**
 * Setup LinkedIn
 */
async function setupLinkedIn(): Promise<void> {
  console.log(chalk.cyan('\nLinkedIn API Setup Instructions:'));
  console.log('1. Go to https://www.linkedin.com/developers/apps');
  console.log('2. Create a new app');
  console.log('3. Add required OAuth 2.0 scopes: r_liteprofile, r_emailaddress, w_member_social');
  console.log('4. Add redirect URL: http://localhost:3000/callback\n');

  const { setupMethod } = await inquirer.prompt<{ setupMethod: 'oauth' | 'manual' }>([
    {
      type: 'list',
      name: 'setupMethod',
      message: 'How would you like to authenticate?',
      choices: [
        { name: 'OAuth Flow (Recommended)', value: 'oauth' },
        { name: 'Manual (Enter access token directly)', value: 'manual' }
      ]
    }
  ]);

  if (setupMethod === 'oauth') {
    await setupLinkedInOAuth();
  } else {
    await setupLinkedInManual();
  }
}

/**
 * Setup LinkedIn with OAuth flow
 */
async function setupLinkedInOAuth(): Promise<void> {
  const answers = await inquirer.prompt<{
    clientId: string;
    clientSecret: string;
  }>([
    {
      type: 'input',
      name: 'clientId',
      message: 'Client ID:',
      validate: (input) => input.trim() !== '' || 'Client ID is required'
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Client Secret:',
      validate: (input) => input.trim() !== '' || 'Client Secret is required'
    }
  ]);

  try {
    console.log(chalk.cyan('\nStarting OAuth flow...'));
    const accessToken = await performLinkedInOAuth({
      clientId: answers.clientId.trim(),
      clientSecret: answers.clientSecret.trim(),
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
    });

    const config: PlatformConfig = {
      clientId: answers.clientId.trim(),
      clientSecret: answers.clientSecret.trim(),
      accessToken,
      redirectUri: 'http://localhost:3000/callback'
    };

    saveCredentials(Platform.LINKEDIN, config);
    console.log(chalk.green('✓ LinkedIn credentials saved!'));
  } catch (error: any) {
    console.error(chalk.red(`\n✗ OAuth failed: ${error.message}`));
    console.log(chalk.yellow('Please try again or use manual setup.'));
  }
}

/**
 * Setup LinkedIn manually
 */
async function setupLinkedInManual(): Promise<void> {
  const answers = await inquirer.prompt<{
    clientId: string;
    clientSecret: string;
    accessToken: string;
  }>([
    {
      type: 'input',
      name: 'clientId',
      message: 'Client ID:',
      validate: (input) => input.trim() !== '' || 'Client ID is required'
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Client Secret:',
      validate: (input) => input.trim() !== '' || 'Client Secret is required'
    },
    {
      type: 'input',
      name: 'accessToken',
      message: 'Access Token:',
      validate: (input) => input.trim() !== '' || 'Access Token is required'
    }
  ]);

  const config: PlatformConfig = {
    clientId: answers.clientId.trim(),
    clientSecret: answers.clientSecret.trim(),
    accessToken: answers.accessToken.trim(),
    redirectUri: 'http://localhost:3000/callback'
  };

  saveCredentials(Platform.LINKEDIN, config);
  console.log(chalk.green('✓ LinkedIn credentials saved!'));
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSetup().catch(error => {
    console.error(chalk.red('\n✗ Setup failed:'), error.message);
    process.exit(1);
  });
}
