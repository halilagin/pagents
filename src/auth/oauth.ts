/**
 * OAuth helpers for social media platforms
 */

import http from 'http';
import open from 'open';
import { Platform } from '../types/index.js';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(config: OAuthConfig): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: generateRandomState()
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange LinkedIn authorization code for access token
 */
export async function exchangeLinkedInCode(
  code: string,
  config: OAuthConfig
): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange authorization code: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Start a local OAuth callback server
 */
export function startOAuthServer(port: number = 3000): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:${port}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization Failed</h1><p>You can close this window.</p>');
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization Successful!</h1><p>You can close this window and return to the terminal.</p>');
        server.close();
        resolve(code);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Not Found</h1>');
    });

    server.listen(port, () => {
      console.log(`OAuth callback server listening on http://localhost:${port}`);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('OAuth timeout: No response received within 5 minutes'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Open browser for OAuth authorization
 */
export async function openBrowserForAuth(url: string): Promise<void> {
  try {
    await open(url);
    console.log('Browser opened for authorization. Please complete the process in your browser.');
  } catch (error) {
    console.log('Could not open browser automatically. Please open this URL manually:');
    console.log(url);
  }
}

/**
 * Perform OAuth flow for LinkedIn
 */
export async function performLinkedInOAuth(config: OAuthConfig): Promise<string> {
  console.log('Starting LinkedIn OAuth flow...');

  // Start local server
  const serverPromise = startOAuthServer(3000);

  // Generate and open auth URL
  const authUrl = getLinkedInAuthUrl(config);
  await openBrowserForAuth(authUrl);

  // Wait for authorization code
  const code = await serverPromise;

  // Exchange code for access token
  console.log('Exchanging authorization code for access token...');
  const accessToken = await exchangeLinkedInCode(code, config);

  return accessToken;
}

/**
 * Generate a random state parameter for OAuth
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Validate Twitter OAuth credentials
 */
export async function validateTwitterCredentials(
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessSecret: string
): Promise<boolean> {
  try {
    // This is a placeholder - actual validation would happen in the TwitterPlatform class
    return !!(apiKey && apiSecret && accessToken && accessSecret);
  } catch (error) {
    return false;
  }
}

/**
 * Validate Instagram credentials
 */
export async function validateInstagramCredentials(
  accessToken: string,
  userId: string
): Promise<boolean> {
  try {
    // This is a placeholder - actual validation would happen in the InstagramPlatform class
    return !!(accessToken && userId);
  } catch (error) {
    return false;
  }
}
