# Quick Start Guide

Get started with the Social Media Management System in just a few minutes!

## Prerequisites Checklist

Before you begin, make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Built the project (`npm run build`)
- ⬜ API credentials for at least one platform (see below)

## Step 1: Get API Credentials

You'll need to obtain API credentials from the platforms you want to use:

### Option A: X/Twitter (Easiest to Start With)
1. Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app (takes ~5 minutes)
3. Get your API Keys and Access Tokens
4. See [docs/TWITTER_SETUP.md](docs/TWITTER_SETUP.md) for detailed instructions

### Option B: Instagram (Business Account Required)
1. Convert to Instagram Business account
2. Create Facebook App at [Facebook Developers](https://developers.facebook.com/)
3. Get access token and user ID
4. See [docs/INSTAGRAM_SETUP.md](docs/INSTAGRAM_SETUP.md) for detailed instructions

### Option C: LinkedIn (Professional Networking)
1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Set up OAuth 2.0
3. Use the tool's OAuth flow
4. See [docs/LINKEDIN_SETUP.md](docs/LINKEDIN_SETUP.md) for detailed instructions

## Step 2: Configure Authentication

Run the interactive setup wizard:

```bash
npm run auth:setup
```

Or if you linked the CLI globally:

```bash
social-cli auth setup
```

The wizard will:
1. Ask which platforms you want to set up
2. Guide you through entering credentials for each platform
3. Save credentials securely to `.env` file
4. Validate your credentials

## Step 3: Test Your Setup

### View Your Profile

```bash
# Twitter
node dist/cli/index.js profile --platform twitter

# Instagram
node dist/cli/index.js profile --platform instagram

# LinkedIn
node dist/cli/index.js profile --platform linkedin
```

### View Your Feed

```bash
node dist/cli/index.js feed --platform twitter --limit 10
```

### Post Your First Update

```bash
node dist/cli/index.js post "Hello from social-cli! 🚀" --platform twitter
```

## Step 4: Explore Features

### Post to Multiple Platforms

```bash
node dist/cli/index.js post "Cross-posting is easy!" --platform twitter,linkedin
```

### Post with Media (Instagram)

```bash
node dist/cli/index.js post "Check out this image!" \
  --platform instagram \
  --media https://example.com/image.jpg
```

### Share an Article (LinkedIn)

```bash
node dist/cli/index.js post "Great article on AI" \
  --platform linkedin \
  --link https://example.com/article \
  --link-title "The Future of AI"
```

### Engage with Posts

```bash
# Like a post
node dist/cli/index.js engage <post-id> like --platform twitter

# Comment on a post
node dist/cli/index.js engage <post-id> comment \
  --platform instagram \
  --comment "Great content!"

# Retweet
node dist/cli/index.js engage <tweet-id> retweet --platform twitter
```

### Search Posts

```bash
node dist/cli/index.js search "artificial intelligence" \
  --platform twitter \
  --limit 20
```

### Get JSON Output (for scripting)

```bash
node dist/cli/index.js feed --platform twitter --limit 5 --json
```

## Step 5: Link CLI Globally (Optional)

For easier access, link the CLI globally:

```bash
npm link
```

Then you can use `social-cli` instead of `node dist/cli/index.js`:

```bash
social-cli post "Much easier!" --platform twitter
social-cli feed --platform instagram
social-cli auth setup
```

## Step 6: Try the Feed Viewer

Launch the real-time feed viewer:

```bash
npm run viewer
```

Keyboard controls:
- `q` - Quit
- `r` - Refresh all feeds
- `1` - Toggle Twitter feed
- `2` - Toggle Instagram feed
- `3` - Toggle LinkedIn feed

The viewer will show all configured platforms and auto-refresh every 60 seconds.

## Step 7: Use Claude Code Skills

If you're using Claude Code, you can interact with social media through natural language:

```
/x post a tweet about my new project launch
/instagram show me my recent posts
/linkedin share an article about machine learning
```

Available skills:
- `/x` or `/twitter` - X/Twitter management
- `/instagram` - Instagram management
- `/linkedin` - LinkedIn management

## Common Commands Reference

### Authentication
```bash
social-cli auth setup          # Run setup wizard
```

### Posting
```bash
social-cli post "text" --platform twitter
social-cli post "text" --platform twitter,linkedin    # Multi-platform
social-cli post "text" --platform instagram --media /path/to/image.jpg
```

### Viewing Content
```bash
social-cli feed --platform twitter
social-cli profile --platform instagram
social-cli search "query" --platform twitter
```

### Engagement
```bash
social-cli engage <id> like --platform twitter
social-cli engage <id> comment --platform instagram --comment "text"
social-cli engage <id> retweet --platform twitter
social-cli engage <id> share --platform linkedin
```

## Troubleshooting

### "No credentials found"
- Run `social-cli auth setup` to configure credentials
- Check that `.env` file exists and has your credentials
- Verify credentials are correct in the API portal

### "Rate limit exceeded"
- Wait for the rate limit to reset (time shown in error)
- Consider upgrading your API tier
- Reduce frequency of API calls

### "Authentication failed"
- Verify credentials in API portal
- Check if tokens have expired
- Re-run `social-cli auth setup`

### CLI command not found
- Run `npm run build` to compile TypeScript
- Use full path: `node dist/cli/index.js`
- Or run `npm link` to install globally

### Viewer not starting
- Make sure you have credentials configured
- Check that at least one platform is set up
- Try running in a different terminal

## Next Steps

1. **Read the full documentation**: See [README.md](README.md)
2. **Platform-specific guides**: Check the `docs/` directory
3. **Customize your workflow**: Create shell scripts or aliases
4. **Automate posting**: Combine with cron or other scheduling tools
5. **Integrate with Claude Code**: Use skills for AI-powered social media management

## Example Workflows

### Daily Social Media Check

```bash
#!/bin/bash
# daily-check.sh

echo "=== Twitter Feed ==="
social-cli feed --platform twitter --limit 5

echo "\n=== Instagram Feed ==="
social-cli feed --platform instagram --limit 5

echo "\n=== LinkedIn Feed ==="
social-cli feed --platform linkedin --limit 5
```

### Cross-Platform Announcement

```bash
#!/bin/bash
# announce.sh

MESSAGE="$1"

social-cli post "$MESSAGE #announcement" --platform twitter
social-cli post "$MESSAGE" --platform linkedin
echo "Posted to Twitter and LinkedIn!"
```

### Content Monitoring

```bash
#!/bin/bash
# monitor.sh

TOPIC="$1"

social-cli search "$TOPIC" --platform twitter --limit 20 --json > results.json
echo "Search results saved to results.json"
```

## Getting Help

- **CLI Help**: `social-cli --help` or `social-cli <command> --help`
- **Documentation**: See [README.md](README.md) and `docs/` directory
- **Issues**: Report bugs or request features on GitHub
- **Platform APIs**: Check individual platform API documentation

## Success Checklist

- ✅ Built the project
- ✅ Configured at least one platform
- ✅ Successfully posted an update
- ✅ Viewed your feed
- ✅ Engaged with a post
- ✅ (Optional) Linked CLI globally
- ✅ (Optional) Tried the feed viewer
- ✅ (Optional) Used Claude Code skills

Congratulations! You're now ready to manage your social media from the command line! 🎉
