---
name: instagram
description: Manage Instagram Business account - post photos, view feed, engage. Use when user wants to interact with Instagram.
allowed-tools: Bash, Read
---

# Instagram Management Skill

This skill provides Instagram management capabilities through the social-cli tool for Instagram Business and Creator accounts.

## Prerequisites

- **Instagram Business or Creator account** (required)
- Instagram Graph API credentials configured via `social-cli auth setup`
- Facebook Developer account with Instagram Graph API access
- The social-cli tool must be installed and available

## Important Limitations

Instagram Graph API has significant limitations:
- **Business/Creator accounts only**: Personal accounts are not supported
- **No Stories API**: Cannot post or view Stories programmatically
- **No Direct Messages**: DM functionality not available
- **Photo/Video required**: Cannot post text-only updates
- **No programmatic likes**: Cannot like posts via API

## Available Commands

### Post a Photo

Post a photo with caption to Instagram:

```bash
social-cli post "Your caption here" --platform instagram --media https://example.com/photo.jpg
```

Or with a local file:

```bash
social-cli post "Your caption here" --platform instagram --media /path/to/photo.jpg
```

**Note**: Instagram requires either a publicly accessible image URL or a local file path.

### View Your Feed

View your Instagram media feed:

```bash
social-cli feed --platform instagram --limit 20
```

Options:
- `--limit <number>`: Number of posts to fetch (default: 20)
- `--json`: Output as JSON

### Comment on a Post

Add a comment to an Instagram post:

```bash
social-cli engage <post-id> comment --platform instagram --comment "Great photo!"
```

### View Your Profile

View your Instagram Business profile information:

```bash
social-cli profile --platform instagram
```

## Usage Examples

### Example 1: Post a Photo

**User**: "Post this image to Instagram with caption 'Beautiful sunset'"

**Action**:
```bash
social-cli post "Beautiful sunset 🌅 #sunset #nature" --platform instagram --media /path/to/sunset.jpg
```

### Example 2: View Recent Posts

**User**: "Show my recent Instagram posts"

**Action**:
```bash
social-cli feed --platform instagram --limit 10
```

### Example 3: Engage with Posts

**User**: "Comment 'Amazing!' on my latest Instagram post"

**Actions**:
1. Get your feed to find the latest post ID:
```bash
social-cli feed --platform instagram --limit 1 --json
```

2. Parse the JSON to get the post ID

3. Comment on it:
```bash
social-cli engage <post-id> comment --platform instagram --comment "Amazing!"
```

## Posting Guidelines

### Caption Best Practices
- Include relevant hashtags (recommended: 5-30 hashtags)
- Tag locations when relevant
- Use emojis to increase engagement
- Keep captions concise but engaging
- Add line breaks for readability

### Image Requirements
- **Format**: JPG, PNG
- **Size**: Maximum 8MB
- **Aspect ratio**: Square (1:1), Portrait (4:5), or Landscape (1.91:1)
- **Resolution**: Minimum 320px width

### Video Requirements
- **Format**: MP4, MOV
- **Size**: Maximum 100MB
- **Duration**: 3-60 seconds for feed videos
- **Aspect ratio**: Square (1:1) or vertical (9:16)

## API Setup Guide

To use Instagram features, you need:

1. **Convert to Business Account**:
   - Go to Instagram Settings → Account
   - Switch to Professional Account
   - Choose Business

2. **Create Facebook App**:
   - Visit https://developers.facebook.com/apps/
   - Create new app or select existing
   - Add Instagram Graph API product

3. **Get Credentials**:
   - Generate User Access Token
   - Required permissions: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
   - Get your Instagram Business Account ID

4. **Configure in social-cli**:
```bash
social-cli auth setup
```
Select Instagram and enter your credentials.

## Rate Limits

Instagram Graph API rate limits:
- **Rate limit**: 200 calls per hour per user
- **Publishing**: No more than 25 posts per day
- The tool will notify you if limits are exceeded

## Error Handling

Common errors and solutions:

**Error**: "Instagram requires an image or video URL to post"
**Solution**: Always include `--media` parameter with image/video path or URL

**Error**: "Instagram API does not support liking posts"
**Solution**: This is an API limitation. Likes must be done manually on Instagram app

**Error**: "No credentials found for instagram"
**Solution**: Run `social-cli auth setup` to configure Instagram credentials

**Error**: "Requires Instagram Business or Creator account"
**Solution**: Convert your Instagram account to Business or Creator type

## Content Strategy Tips

1. **Optimal posting times**: 9 AM - 11 AM and 7 PM - 9 PM
2. **Hashtag strategy**: Mix popular and niche hashtags
3. **Engagement**: Respond to comments within first hour
4. **Content variety**: Mix photos, videos, and carousel posts
5. **Consistency**: Post regularly (3-7 times per week)

## Insights and Analytics

For Instagram Business accounts, you can access insights:

```bash
# This would require additional implementation
# Currently not exposed in the CLI, but available in the InstagramPlatform class
```

Insights include:
- Engagement (likes, comments, shares)
- Impressions
- Reach
- Saves

## Troubleshooting

**Problem**: "Invalid access token"
**Solution**: Tokens expire. Run `social-cli auth setup` to get a new token

**Problem**: "Media not found"
**Solution**: Ensure the image URL is publicly accessible or use local file path

**Problem**: "Publishing failed"
**Solution**: Check image requirements (format, size, dimensions)

## Limitations Summary

What you **CAN** do:
✅ Post photos and videos to feed
✅ View your own media feed
✅ Comment on posts
✅ Get profile information
✅ Access insights (Business accounts)

What you **CANNOT** do:
❌ Post Stories
❌ Like posts programmatically
❌ Share posts
❌ Send Direct Messages
❌ View other users' feeds
❌ Search for posts/hashtags (limited access)

## Integration Examples

**Example**: Post AI-generated art to Instagram

```bash
# Generate image (using another tool/skill)
# Then post to Instagram
social-cli post "AI-generated art 🎨 #aiart #digitalart #generativeart" \
  --platform instagram \
  --media /path/to/ai-generated-art.jpg
```
