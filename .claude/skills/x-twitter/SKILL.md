---
name: x-twitter
description: Manage X (Twitter) account - post tweets, view feed, engage with posts. Use when user wants to interact with X/Twitter.
allowed-tools: Bash, Read
---

# X/Twitter Management Skill

This skill provides comprehensive X (Twitter) management capabilities through the social-cli tool.

## Prerequisites

- X/Twitter API credentials configured via `social-cli auth setup`
- The social-cli tool must be installed and available in the system

## Available Commands

### Post a Tweet

Post text content to X/Twitter:

```bash
social-cli post "Your tweet content" --platform twitter
```

With media attachment:

```bash
social-cli post "Your tweet with image" --platform twitter --media /path/to/image.jpg
```

**Note**: Tweets are limited to 280 characters.

### View Your Feed

View your X/Twitter home timeline:

```bash
social-cli feed --platform twitter --limit 20
```

Options:
- `--limit <number>`: Number of tweets to fetch (default: 20)
- `--json`: Output as JSON for programmatic processing

### Like a Tweet

Like a tweet by its ID:

```bash
social-cli engage <tweet-id> like --platform twitter
```

### Retweet

Retweet a tweet:

```bash
social-cli engage <tweet-id> retweet --platform twitter
```

### Reply to a Tweet

Reply to a tweet:

```bash
social-cli engage <tweet-id> reply --platform twitter --comment "Your reply text"
```

### Search Tweets

Search for tweets matching a query:

```bash
social-cli search "search query" --platform twitter --limit 20
```

### View Your Profile

View your X/Twitter profile information:

```bash
social-cli profile --platform twitter
```

## Usage Examples

### Example 1: Post a Simple Tweet

**User**: "Tweet 'Hello from Claude Code!'"

**Action**:
```bash
social-cli post "Hello from Claude Code!" --platform twitter
```

### Example 2: View Recent Feed

**User**: "Show me my latest tweets"

**Action**:
```bash
social-cli feed --platform twitter --limit 10
```

### Example 3: Search and Engage

**User**: "Search for tweets about AI and like the most recent one"

**Actions**:
1. Search for tweets:
```bash
social-cli search "AI" --platform twitter --limit 5 --json
```

2. Parse the JSON output to get the first tweet ID

3. Like the tweet:
```bash
social-cli engage <tweet-id> like --platform twitter
```

## Posting Threads

For tweet threads, post multiple tweets sequentially:

```bash
social-cli post "Thread 1/3: First tweet" --platform twitter
social-cli post "Thread 2/3: Second tweet" --platform twitter
social-cli post "Thread 3/3: Final tweet" --platform twitter
```

## Rate Limits

X/Twitter API has rate limits:
- **Free tier**: 1,500 tweets/month read, 50 posts/month
- **Basic tier**: Higher limits available
- The tool will notify you if rate limits are exceeded

## Error Handling

If authentication fails:
```
Error: No credentials found for twitter. Please run 'social-cli auth setup' first.
```

Solution: Run the setup command to configure API credentials.

## Tips

1. **Character Limit**: Keep tweets under 280 characters
2. **Media**: Supported formats include JPG, PNG, GIF, MP4
3. **Hashtags**: Include hashtags naturally in your tweet text
4. **Mentions**: Use @username format for mentions
5. **JSON Output**: Use `--json` flag for programmatic processing

## Integration with Other Skills

This skill can be combined with other skills:
- Use with file reading skills to post file content
- Combine with image generation skills to post AI-generated images
- Integrate with scheduling tools for automated posting

## Troubleshooting

**Problem**: "Rate limit exceeded"
**Solution**: Wait for the specified time before retrying, or upgrade your API tier

**Problem**: "Invalid credentials"
**Solution**: Run `social-cli auth setup` to reconfigure credentials

**Problem**: "Tweet too long"
**Solution**: Split content into multiple tweets or use a thread
