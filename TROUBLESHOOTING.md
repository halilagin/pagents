# Troubleshooting Guide

Common issues and solutions for the Social Media Management System.

## Installation Issues

### "npm install" fails

**Problem**: Dependencies fail to install

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules package-lock.json`
3. Reinstall: `npm install`
4. Check Node.js version: `node --version` (need 18+)

### "npm run build" fails

**Problem**: TypeScript compilation errors

**Solutions**:
1. Check TypeScript version: `npx tsc --version`
2. Clean and rebuild:
   ```bash
   npm run clean
   npm run build
   ```
3. Verify tsconfig.json is present and valid

## Authentication Issues

### "No credentials found for [platform]"

**Problem**: Credentials not configured

**Solutions**:
1. Run setup wizard: `social-cli auth setup`
2. Check `.env` file exists in project root
3. Verify credentials format in `.env`
4. Make sure you selected the platform during setup

### "Invalid OAuth access token"

**Problem**: Token expired or invalid

**Solutions**:
1. **Twitter**: Regenerate tokens in Developer Portal
2. **Instagram**: Get new long-lived token (expires after 60 days)
3. **LinkedIn**: Re-run OAuth flow (tokens expire after 60 days)
4. Run `social-cli auth setup` again with new credentials

### "Authentication failed"

**Problem**: Wrong credentials or permissions

**Solutions**:
1. Verify credentials in platform developer portal
2. Check API permissions are correct:
   - Twitter: Read and Write
   - Instagram: instagram_basic, instagram_content_publish, pages_read_engagement
   - LinkedIn: r_liteprofile, r_emailaddress, w_member_social
3. For Twitter: Make sure Access Token matches API Key
4. For Instagram: Verify Business account is linked to Facebook Page

## Rate Limiting

### "Rate limit exceeded"

**Problem**: Too many API calls

**Solutions**:
1. Wait for rate limit to reset (time shown in error)
2. Reduce frequency of API calls
3. Consider upgrading API tier:
   - Twitter: Basic tier ($100/month) for higher limits
   - Instagram: 200 calls/hour limit
   - LinkedIn: 100 calls/day limit

## CLI Issues

### "command not found: social-cli"

**Problem**: CLI not linked globally

**Solutions**:
1. Use full path: `node dist/cli/index.js`
2. Or link globally: `npm link`
3. Or use npm script: `npm start -- [command]`

### "Cannot find module"

**Problem**: Project not built

**Solutions**:
1. Build the project: `npm run build`
2. Check dist/ directory exists: `ls dist/`
3. Verify dist/ contains .js files: `ls dist/cli/`

### Commands don't work

**Problem**: Various CLI issues

**Solutions**:
1. Check command syntax: `social-cli --help`
2. Verify platform name: use `twitter` not `x`
3. Check required options: `social-cli [command] --help`
4. Make sure credentials are configured

## Feed Viewer Issues

### "Raw mode is not supported"

**Problem**: Terminal doesn't support raw mode or no credentials

**Solutions**:
1. Make sure credentials are configured: `social-cli auth setup`
2. Try different terminal (Terminal.app, iTerm2, etc.)
3. Check stdin is connected to terminal
4. Don't pipe output or run in non-interactive environment

### Viewer exits immediately

**Problem**: No configured platforms

**Solutions**:
1. Configure at least one platform: `social-cli auth setup`
2. Verify `.env` has credentials
3. Test credentials: `social-cli profile --platform twitter`

### Viewer not refreshing

**Problem**: Feed not auto-updating

**Solutions**:
1. Press 'r' to manually refresh
2. Check internet connection
3. Verify credentials haven't expired
4. Check if rate limits were hit

## Platform-Specific Issues

### Twitter/X

#### "Tweet too long"

**Problem**: Over 280 characters

**Solutions**:
1. Reduce text to 280 characters
2. Use thread (multiple posts)
3. Check character count including URLs

#### "Read-only application cannot POST"

**Problem**: App permissions are Read Only

**Solutions**:
1. Go to Twitter Developer Portal
2. Edit app permissions to "Read and Write"
3. Regenerate Access Token and Secret (important!)
4. Update credentials: `social-cli auth setup`

#### "Could not authenticate you"

**Problem**: Invalid credentials

**Solutions**:
1. Check API Key matches Access Token
2. Verify tokens weren't regenerated in portal
3. Make sure not using App-Only auth for write operations
4. Get new tokens from Developer Portal

### Instagram

#### "Instagram requires an image or video URL"

**Problem**: No media provided

**Solutions**:
1. Instagram requires media for posts
2. Use `--media` parameter with image URL or path
3. Ensure image meets requirements (JPG/PNG, max 8MB)
4. For URLs, make sure they're publicly accessible

#### "Requires Instagram Business account"

**Problem**: Personal account being used

**Solutions**:
1. Convert to Business or Creator account in Instagram app
2. Link to Facebook Page
3. Reconnect in Facebook Developer settings
4. Get new Instagram Business Account ID

#### "Permission denied"

**Problem**: Missing required permissions

**Solutions**:
1. Go to Graph API Explorer
2. Add permissions: instagram_basic, instagram_content_publish, pages_read_engagement
3. Generate new token with all permissions
4. Update in social-cli: `social-cli auth setup`

### LinkedIn

#### "OAuth failed: redirect_uri_mismatch"

**Problem**: Redirect URI doesn't match

**Solutions**:
1. Go to LinkedIn app settings
2. Set redirect URI to exactly: `http://localhost:3000/callback`
3. No trailing slash
4. Save and try again

#### "Access token expired"

**Problem**: 60-day token expiration

**Solutions**:
1. LinkedIn tokens expire after 60 days
2. Run setup again: `social-cli auth setup`
3. Complete OAuth flow to get new token
4. Consider setting calendar reminder for renewal

#### "Permission denied: invalid scope"

**Problem**: Missing OAuth scopes

**Solutions**:
1. Check app has required products:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn"
2. Verify scopes in app settings
3. Generate new token with correct scopes

## Posting Issues

### Post succeeds but doesn't appear

**Problem**: Post created but not visible

**Solutions**:
1. Wait a few minutes for propagation
2. Check in platform's app/website
3. Verify post ID in API response
4. Check if account was flagged/restricted

### Media upload fails

**Problem**: Can't upload images/videos

**Solutions**:
1. Check file format:
   - Twitter: JPG, PNG, GIF, MP4
   - Instagram: JPG, PNG (images), MP4 (videos)
2. Check file size:
   - Instagram: max 8MB (images), 100MB (videos)
   - Twitter: varies by tier
3. For URLs, ensure publicly accessible
4. Try local file path instead of URL

### Cross-platform post partially fails

**Problem**: Posted to some platforms but not others

**Solutions**:
1. Check individual platform credentials
2. Review error messages for each platform
3. Some platforms may have hit rate limits
4. Verify content meets each platform's requirements

## Development Issues

### TypeScript errors during build

**Problem**: Compilation errors

**Solutions**:
1. Update dependencies: `npm update`
2. Check TypeScript version: `npx tsc --version`
3. Clear build cache: `npm run clean && npm run build`
4. Check for syntax errors in source files

### Import/module errors

**Problem**: Can't find modules

**Solutions**:
1. Check import paths use .js extension
2. Verify tsconfig.json has correct module settings
3. Make sure package.json has `"type": "module"`
4. Rebuild project: `npm run build`

## Getting More Help

If none of these solutions work:

1. **Check logs**: Look for error details in terminal output
2. **Test credentials**: Use platform's API explorer/playground
3. **Review documentation**: 
   - Platform API docs
   - README.md
   - QUICKSTART.md
4. **Check API status**:
   - Twitter: https://api.twitterstat.us/
   - Facebook/Instagram: https://developers.facebook.com/status/
   - LinkedIn: https://www.linkedin-status.com/
5. **GitHub Issues**: Report bugs or request help

## Useful Debugging Commands

```bash
# Check environment
node --version
npm --version

# Verify build
npm run build
ls dist/cli/
ls dist/viewer/

# Test credentials
social-cli profile --platform twitter

# View with details
social-cli feed --platform twitter --json | jq

# Check .env file
cat .env

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Quick Fixes

**Most issues can be fixed by**:

1. Rebuilding: `npm run build`
2. Reconfiguring: `social-cli auth setup`
3. Checking credentials in platform portals
4. Verifying API permissions/scopes
5. Waiting for rate limits to reset

---

Still having issues? Check the main [README.md](README.md) or platform-specific setup guides in the `docs/` directory.
