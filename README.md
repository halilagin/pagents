# Social Media Management System

> **100% Vibe-Coded** - Built entirely through intuitive development and AI collaboration

A comprehensive command-line social media management system for X (Twitter), Instagram, and LinkedIn. Manage multiple social media accounts through a unified CLI interface, Claude Code skills, or a real-time terminal feed viewer.

## Features

- **Multi-Platform Support**: X (Twitter), Instagram, and LinkedIn
- **Three Interaction Methods**:
  1. Standalone CLI tool (`social-cli`)
  2. Claude Code skills (`/x`, `/instagram`, `/linkedin`)
  3. Real-time terminal feed viewer
- **Comprehensive Actions**: Post, view feeds, engage (like, comment, share), search, and more
- **Secure Authentication**: OAuth 2.0 support with local credential storage
- **Beautiful Terminal UI**: Built with Ink for a modern terminal experience
- **TypeScript**: Fully typed for reliability and better developer experience

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication Setup](#authentication-setup)
- [Usage](#usage)
  - [CLI Tool](#cli-tool)
  - [Claude Code Skills](#claude-code-skills)
  - [Feed Viewer](#feed-viewer)
- [Platform-Specific Guides](#platform-specific-guides)
- [API Limitations](#api-limitations)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js 18+ and npm
- API credentials for the platforms you want to use:
  - X/Twitter Developer Account
  - Facebook Developer Account (for Instagram)
  - LinkedIn Developer Account

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Link CLI Tool Globally (Optional)

```bash
npm link
```

This makes the `social-cli` command available globally on your system.

## Quick Start

### 1. Set Up Authentication

Run the interactive setup wizard:

```bash
npm run auth:setup
# Or if linked globally:
social-cli auth setup
```

Follow the prompts to configure credentials for each platform.

### 2. Post Your First Update

```bash
social-cli post "Hello from social-cli!" --platform twitter
```

### 3. View Your Feed

```bash
social-cli feed --platform twitter --limit 10
```

### 4. Launch the Feed Viewer

```bash
npm run viewer
```

Press `q` to quit, `r` to refresh, `1/2/3` to toggle platforms.

## Authentication Setup

The authentication setup wizard guides you through obtaining and configuring API credentials for each platform.

### X/Twitter Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select an existing one
3. Navigate to "Keys and tokens"
4. Generate/copy your API credentials:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
   - Bearer Token (optional, for read-only access)

See [docs/TWITTER_SETUP.md](docs/TWITTER_SETUP.md) for detailed instructions.

### Instagram Setup

1. Go to [Facebook Developer Portal](https://developers.facebook.com/apps/)
2. Create a new app or select an existing one
3. Add the Instagram Graph API product
4. Connect your Instagram Business account
5. Generate a User Access Token with permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

**Important**: Requires Instagram Business or Creator account.

See [docs/INSTAGRAM_SETUP.md](docs/INSTAGRAM_SETUP.md) for detailed instructions.

### LinkedIn Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add OAuth 2.0 scopes:
   - `r_liteprofile`
   - `r_emailaddress`
   - `w_member_social`
4. Add redirect URL: `http://localhost:3000/callback`
5. Use the OAuth flow in the setup wizard

See [docs/LINKEDIN_SETUP.md](docs/LINKEDIN_SETUP.md) for detailed instructions.

## Usage

### CLI Tool

The `social-cli` command-line tool provides full access to all features.

#### Post Content

```bash
# Simple text post
social-cli post "Your content here" --platform twitter

# Post with media
social-cli post "Check out this image" --platform instagram --media /path/to/image.jpg

# Post article (LinkedIn)
social-cli post "Interesting article" --platform linkedin --link https://example.com --link-title "Article Title"

# Multi-platform posting
social-cli post "Cross-post content" --platform twitter,linkedin
```

#### View Feeds

```bash
# View Twitter feed
social-cli feed --platform twitter --limit 20

# View Instagram feed
social-cli feed --platform instagram --limit 10

# Output as JSON
social-cli feed --platform linkedin --limit 5 --json
```

#### Engage with Posts

```bash
# Like a post
social-cli engage <post-id> like --platform twitter

# Comment on a post
social-cli engage <post-id> comment --platform instagram --comment "Great photo!"

# Retweet
social-cli engage <tweet-id> retweet --platform twitter

# Share on LinkedIn
social-cli engage <post-id> share --platform linkedin --comment "Adding context..."
```

#### Search

```bash
# Search tweets
social-cli search "AI technology" --platform twitter --limit 20

# Output as JSON for processing
social-cli search "machine learning" --platform twitter --limit 50 --json
```

#### View Profile

```bash
social-cli profile --platform twitter
social-cli profile --platform instagram
social-cli profile --platform linkedin
```

### Claude Code Skills

Use Claude Code to interact with social media through natural language.

#### Available Skills

- `/x` or `/twitter` - X/Twitter management
- `/instagram` - Instagram management
- `/linkedin` - LinkedIn management

#### Example Interactions

```
You: /x post a tweet about my new project launch

Claude: I'll post that tweet for you.
[Executes: social-cli post "..." --platform twitter]

You: /instagram show me my recent posts

Claude: Let me fetch your Instagram feed.
[Executes: social-cli feed --platform instagram --limit 10]

You: /linkedin share an article about AI

Claude: I'll share that article on LinkedIn.
[Executes: social-cli post "..." --platform linkedin --link ...]
```

### Feed Viewer

Launch the real-time terminal feed viewer:

```bash
npm run viewer
```

#### Keyboard Controls

- `q` - Quit the viewer
- `r` - Refresh all feeds
- `1` - Toggle X/Twitter feed
- `2` - Toggle Instagram feed
- `3` - Toggle LinkedIn feed

The viewer auto-refreshes every 60 seconds and displays:
- Latest posts from each platform
- Author information
- Engagement metrics
- Timestamps
- Media indicators

## Platform-Specific Guides

### X/Twitter

**Supported Features:**
- ✅ Post tweets (up to 280 characters)
- ✅ View home timeline
- ✅ Like tweets
- ✅ Retweet
- ✅ Reply to tweets
- ✅ Search tweets
- ✅ Media attachments

**Rate Limits:**
- Free tier: 1,500 reads/month, 50 posts/month
- Basic tier: Higher limits available

**Tips:**
- Keep tweets under 280 characters
- Use hashtags strategically
- Engage within the first hour for better visibility

### Instagram

**Supported Features:**
- ✅ Post photos/videos
- ✅ View your media feed
- ✅ Comment on posts
- ✅ Get insights (Business accounts)

**NOT Supported:**
- ❌ Post Stories (API limitation)
- ❌ Like posts programmatically
- ❌ Direct messages
- ❌ Search (limited access)

**Requirements:**
- Instagram Business or Creator account
- Publicly accessible image URLs or local files
- Images: JPG/PNG, max 8MB
- Videos: MP4/MOV, max 100MB, 3-60 seconds

**Tips:**
- Use 5-30 relevant hashtags
- Post at 9-11 AM or 7-9 PM for best engagement
- Include emojis in captions

### LinkedIn

**Supported Features:**
- ✅ Share text posts
- ✅ Share articles with links
- ✅ View feed
- ✅ Like posts
- ✅ Comment on posts
- ✅ Share/repost content

**Rate Limits:**
- 100 API calls per user per day
- Tokens expire after 60 days

**Tips:**
- Post Tuesday-Thursday, 9 AM-12 PM
- Use 3-5 professional hashtags
- Keep tone professional but authentic
- Engage with comments promptly

## API Limitations

### X/Twitter API

**Free Tier:**
- 1,500 tweets read per month
- 50 tweets posted per month
- Limited to user context only

**Basic Tier ($100/month):**
- 10,000 tweets read per month
- 3,000 tweets posted per month

### Instagram Graph API

**Limitations:**
- Requires Business or Creator account
- No Stories API
- No programmatic likes or saves
- Publishing quota: 25 posts per day
- Rate limit: 200 calls per hour

**Token Expiration:**
- Short-lived tokens: 1 hour
- Long-lived tokens: 60 days

### LinkedIn API

**Limitations:**
- No general post search
- Limited to own profile and connections
- 100 calls per day per user
- Tokens expire after 60 days

**Permissions Required:**
- `r_liteprofile` - Read profile
- `r_emailaddress` - Read email
- `w_member_social` - Post content

## Development Philosophy

This project is **100% vibe-coded** - developed entirely through AI collaboration and intuitive programming. Every line of code, every feature, and every integration was created through natural conversation with Claude Code, demonstrating the power of AI-assisted development.

### What is Vibe-Coding?

Vibe-coding is a development methodology where you:
- Describe what you want in natural language
- Let AI understand the context and architecture
- Collaborate iteratively to build features
- Focus on the "vibe" and intent rather than implementation details

This entire social media management system, including CLI tools, feed viewers, authentication flows, and Claude Code skills, was built without traditional manual coding - just pure collaboration with AI.

## Development

### Project Structure

```
halil-personal-agents/
├── src/
│   ├── platforms/      # Platform implementations
│   ├── cli/            # CLI tool
│   ├── viewer/         # Feed viewer
│   ├── auth/           # Authentication
│   └── types/          # TypeScript types
├── .claude/skills/     # Claude Code skills
├── docs/               # Documentation
└── dist/               # Compiled output
```

### Build Commands

```bash
# Build TypeScript
npm run build

# Watch mode
npm run watch

# Clean build artifacts
npm run clean
```

### Adding a New Platform

1. Create implementation in `src/platforms/`
2. Extend `SocialPlatform` base class
3. Implement required methods
4. Add authentication to `src/auth/`
5. Update CLI commands
6. Create Claude Code skill
7. Add documentation

## Troubleshooting

### Authentication Issues

**Problem:** "No credentials found"
```bash
# Solution: Run setup wizard
social-cli auth setup
```

**Problem:** "Invalid credentials"
```bash
# Solution: Verify credentials and re-run setup
# Check that tokens haven't expired
social-cli auth setup
```

### Rate Limiting

**Problem:** "Rate limit exceeded"
- **Solution:** Wait for the reset time indicated in the error
- **Alternative:** Upgrade API tier if available

### Platform-Specific Issues

**X/Twitter:**
- "Tweet too long" → Split into thread or reduce to 280 characters
- "Media upload failed" → Check file format (JPG, PNG, GIF, MP4)

**Instagram:**
- "Requires Business account" → Convert to Business/Creator account
- "Media not found" → Ensure URL is publicly accessible

**LinkedIn:**
- "OAuth failed" → Check redirect URI matches exactly
- "Token expired" → Re-run auth setup (tokens expire after 60 days)

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

## Security Considerations

- **Never commit `.env` file** - Contains sensitive credentials
- **Rotate credentials regularly** - Especially if exposed
- **Use least privilege** - Only request necessary API permissions
- **Monitor API usage** - Watch for unusual activity
- **Secure your machine** - Credentials stored locally in `.env`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/halil-personal-agents/issues)
- Documentation: See `docs/` directory
- API Documentation: Check individual platform API docs

## Acknowledgments

Built with:
- [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Commander.js](https://github.com/tj/commander.js)
- [Ink](https://github.com/vadimdemedes/ink)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

## Roadmap

Future enhancements:
- [ ] Scheduled posting with cron
- [ ] Multi-account support
- [ ] Analytics dashboard
- [ ] Content calendar
- [ ] Cross-posting with platform-specific formatting
- [ ] MCP server integration for Claude Desktop
- [ ] Support for additional platforms (Facebook, Mastodon, Threads)
- [ ] Media editing and filters
- [ ] Bulk operations
- [ ] Export/backup functionality
# pagents
