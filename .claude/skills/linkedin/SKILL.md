---
name: linkedin
description: Manage LinkedIn profile - share posts, view feed, engage professionally. Use when user wants to interact with LinkedIn.
allowed-tools: Bash, Read
---

# LinkedIn Management Skill

This skill provides LinkedIn management capabilities through the social-cli tool for professional networking and content sharing.

## Prerequisites

- LinkedIn account
- LinkedIn API credentials configured via `social-cli auth setup`
- LinkedIn Developer account with app created
- The social-cli tool must be installed and available

## Available Commands

### Share a Post

Post text content to LinkedIn:

```bash
social-cli post "Professional update or insight" --platform linkedin
```

### Share an Article

Post with a link to an article:

```bash
social-cli post "Check out this article" --platform linkedin --link https://example.com/article --link-title "Article Title"
```

### View Your Feed

View your LinkedIn feed:

```bash
social-cli feed --platform linkedin --limit 20
```

Options:
- `--limit <number>`: Number of posts to fetch (default: 20)
- `--json`: Output as JSON

### Like a Post

Like a LinkedIn post:

```bash
social-cli engage <post-id> like --platform linkedin
```

### Comment on a Post

Comment on a LinkedIn post:

```bash
social-cli engage <post-id> comment --platform linkedin --comment "Great insight!"
```

### Share a Post

Share/repost someone else's content:

```bash
social-cli engage <post-id> share --platform linkedin --comment "Adding my perspective..."
```

### View Your Profile

View your LinkedIn profile information:

```bash
social-cli profile --platform linkedin
```

## Usage Examples

### Example 1: Share a Professional Update

**User**: "Post to LinkedIn about my new project launch"

**Action**:
```bash
social-cli post "Excited to announce the launch of our new AI-powered analytics platform! 🚀 After 6 months of development, we're ready to help businesses make data-driven decisions. #AI #Analytics #ProductLaunch" --platform linkedin
```

### Example 2: Share an Article

**User**: "Share this article on LinkedIn with my thoughts"

**Action**:
```bash
social-cli post "Fascinating read on the future of AI in healthcare. The potential for improving patient outcomes is tremendous." --platform linkedin --link https://example.com/ai-healthcare --link-title "The Future of AI in Healthcare"
```

### Example 3: Engage with Network

**User**: "Like and comment on recent posts in my LinkedIn feed"

**Actions**:
1. View feed:
```bash
social-cli feed --platform linkedin --limit 10 --json
```

2. Parse JSON to get post IDs

3. Like a post:
```bash
social-cli engage <post-id> like --platform linkedin
```

4. Comment on a post:
```bash
social-cli engage <post-id> comment --platform linkedin --comment "Great point about data privacy. I completely agree."
```

## Content Best Practices

### Professional Tone
- Maintain a professional yet authentic voice
- Share industry insights and expertise
- Provide value to your network
- Use proper grammar and formatting

### Optimal Content Types
1. **Industry insights**: Share knowledge and expertise
2. **Company updates**: Announcements and milestones
3. **Thought leadership**: Original perspectives on trends
4. **Case studies**: Success stories and learnings
5. **Professional achievements**: Certifications, promotions, projects

### Formatting Tips
- Use line breaks for readability
- Keep paragraphs short (2-3 sentences)
- Use bullet points for lists
- Include relevant hashtags (3-5 recommended)
- Tag relevant people and companies with @mentions
- Add emojis sparingly for emphasis

### Hashtag Strategy
```bash
social-cli post "Post content here #IndustryTag #SkillTag #TopicTag" --platform linkedin
```

Popular professional hashtags:
- Industry-specific: #Technology, #Finance, #Marketing
- Skills: #Leadership, #Innovation, #DataScience
- Career: #CareerAdvice, #JobSearch, #Networking
- General: #Professional, #Business, #Growth

## API Setup Guide

To use LinkedIn features:

1. **Create LinkedIn App**:
   - Visit https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in app details

2. **Configure OAuth**:
   - Add redirect URL: `http://localhost:3000/callback`
   - Request permissions: `r_liteprofile`, `r_emailaddress`, `w_member_social`

3. **Get Credentials**:
   - Note your Client ID and Client Secret
   - These will be used in the OAuth flow

4. **Run Setup**:
```bash
social-cli auth setup
```
- Select LinkedIn
- Choose OAuth flow (recommended)
- Enter Client ID and Client Secret
- Complete authentication in browser

## Rate Limits

LinkedIn API rate limits:
- **Rate limit**: 100 API calls per user per day
- **Throttling**: 1,000 calls per day per app
- Tokens expire after 60 days

The tool will notify you when limits are approached.

## Post Visibility

LinkedIn posts can have different visibility:
- **Public**: Default, visible to everyone (set in the tool)
- **Connections**: Only your connections can see
- **Specific groups**: Share with LinkedIn groups

Currently, the tool posts publicly by default.

## Error Handling

Common errors and solutions:

**Error**: "LinkedIn API does not support general post search"
**Solution**: LinkedIn API v2 has limited search capabilities. Use LinkedIn app for searching.

**Error**: "Access token expired"
**Solution**: OAuth tokens expire after 60 days. Run `social-cli auth setup` to get a new token.

**Error**: "Rate limit exceeded"
**Solution**: Wait until the next day or reduce API calls.

**Error**: "No credentials found for linkedin"
**Solution**: Run `social-cli auth setup` to configure LinkedIn credentials.

## Engagement Strategy

### Best Times to Post
- **Tuesday - Thursday**: 9 AM - 12 PM (peak engagement)
- **Wednesday**: Highest overall engagement
- Avoid weekends for business content

### Frequency
- **Optimal**: 2-5 posts per week
- **Minimum**: 1 post per week to stay visible
- **Maximum**: 1 post per day (avoid spam)

### Content Mix (80-20 Rule)
- **80%**: Educational, inspiring, or entertaining content
- **20%**: Promotional or sales content

## Advanced Use Cases

### 1. Announcement Template

```bash
social-cli post "📢 ANNOUNCEMENT

We're thrilled to announce [achievement/news]!

Key highlights:
• Point 1
• Point 2
• Point 3

Thank you to everyone who made this possible.

#CompanyNews #Milestone" --platform linkedin
```

### 2. Article Sharing Template

```bash
social-cli post "📚 Insightful article on [topic]

Key takeaways:
1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

What are your thoughts on this? Comment below! 👇

#Industry #Topic" --platform linkedin --link [URL] --link-title "[Title]"
```

### 3. Thought Leadership Template

```bash
social-cli post "💡 Thoughts on [industry trend]

After working in [field] for [X] years, I've noticed [observation].

Here's what I believe:
[Your perspective]

What's your experience? Let's discuss in the comments.

#ThoughtLeadership #IndustryInsight" --platform linkedin
```

## Integration with Other Tools

**Example**: Automated weekly industry roundup

```bash
# Collect articles from the week
# Generate summary (using other tools)
# Post to LinkedIn

social-cli post "📊 This Week in [Industry] - Top 5 Stories

1. [Story 1]
2. [Story 2]
3. [Story 3]
4. [Story 4]
5. [Story 5]

Full analysis in the comments 👇

#WeeklyRoundup #IndustryNews" --platform linkedin
```

## Troubleshooting

**Problem**: "OAuth failed"
**Solution**: Ensure redirect URI matches exactly (`http://localhost:3000/callback`)

**Problem**: "Permission denied"
**Solution**: Check that your LinkedIn app has the required scopes enabled

**Problem**: "Post not appearing"
**Solution**: LinkedIn sometimes delays post visibility. Wait a few minutes and refresh.

**Problem**: "Cannot find post ID for engagement"
**Solution**: Use `--json` flag with feed command to get structured post IDs

## Best Practices Summary

✅ **DO**:
- Share valuable industry insights
- Engage authentically with your network
- Use professional language
- Include relevant hashtags
- Respond to comments promptly
- Post consistently

❌ **DON'T**:
- Spam your network with frequent posts
- Share overly promotional content
- Use controversial or political content (unless relevant to your brand)
- Copy-paste the same content across platforms
- Ignore comments on your posts
- Use excessive hashtags (stick to 3-5)

## Content Calendar Example

**Monday**: Industry news/article share
**Wednesday**: Original thought leadership
**Friday**: Company update or achievement

Use the CLI to maintain consistency:
```bash
# Schedule posts (would require additional scheduling setup)
social-cli post "[Monday content]" --platform linkedin
```

## Monitoring Engagement

To track engagement:

1. View your posts:
```bash
social-cli feed --platform linkedin --limit 10 --json
```

2. Parse the JSON output to see:
   - Like counts
   - Comment counts
   - Share counts

3. Adjust your content strategy based on what performs best

## Professional Networking Tips

1. **Personalize engagement**: Don't just like - add thoughtful comments
2. **Build relationships**: Engage with the same people regularly
3. **Add value first**: Help others before asking for help
4. **Be consistent**: Regular activity keeps you visible
5. **Showcase expertise**: Share unique insights from your experience
