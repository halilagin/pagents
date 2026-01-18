# X/Twitter API Setup Guide

This guide walks you through setting up X (formerly Twitter) API credentials for use with the social-cli tool.

## Prerequisites

- X/Twitter account
- Email address and phone number verified on your X account
- Credit card (required for X API access, even for free tier)

## Step 1: Apply for API Access

1. Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)

2. Sign in with your X/Twitter account

3. Click "Sign up for Free Account" if you haven't already

4. Complete the application form:
   - **Primary use case**: Select the most appropriate option (e.g., "Exploring the API")
   - **App description**: Briefly describe your use case (e.g., "Personal social media management tool")
   - **Will you make X content available to government entities?**: Usually "No"

5. Review and accept the Developer Agreement and Policy

6. Verify your email address if prompted

## Step 2: Create an App

1. Once approved, go to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)

2. Click "Projects & Apps" in the left sidebar

3. Click "+ Create App" or "+ Add App"

4. Fill in the app details:
   - **App name**: Choose a unique name (e.g., "Social Media Manager")
   - **Description**: Brief description of your app
   - **Website URL**: Your website or GitHub repo URL
   - **Callback URLs**: Not required for this tool
   - **App permissions**: Select "Read and Write" or "Read, Write, and Direct Messages"

5. Click "Create"

## Step 3: Generate API Keys

### API Key and Secret

1. After creating the app, you'll see your **API Key** and **API Key Secret**
2. **IMPORTANT**: Copy these immediately and store them securely
3. You won't be able to see the API Key Secret again

### Access Token and Secret

1. Navigate to your app's "Keys and tokens" tab

2. Under "Authentication Tokens", click "Generate" next to "Access Token and Secret"

3. Copy both the **Access Token** and **Access Token Secret**

4. Store them securely

### Bearer Token (Optional)

1. In the same "Keys and tokens" tab, you'll see a **Bearer Token**

2. Copy this if you want read-only access capabilities

3. This is optional but useful for some operations

## Step 4: Configure Permissions

1. Go to your app's "Settings" tab

2. Scroll to "App permissions"

3. Ensure you have the appropriate permissions:
   - **Read**: View tweets and user profiles
   - **Write**: Post tweets and engage with content
   - **Direct Messages** (optional): Send and receive DMs

4. If you need to change permissions:
   - Click "Edit"
   - Select the desired permissions
   - Click "Save"
   - **Note**: You'll need to regenerate your Access Token and Secret after changing permissions

## Step 5: Configure in social-cli

Now that you have your credentials, configure them in the tool:

1. Run the setup wizard:
```bash
social-cli auth setup
```

2. Select "X (Twitter)" from the platform list

3. Enter your credentials when prompted:
   - **API Key**: Your Consumer Key
   - **API Secret**: Your Consumer Secret
   - **Access Token**: Your Access Token
   - **Access Token Secret**: Your Access Token Secret
   - **Bearer Token** (optional): Your Bearer Token

4. The wizard will save these to your `.env` file

## Step 6: Verify Setup

Test your configuration:

```bash
# View your profile
social-cli profile --platform twitter

# View your feed
social-cli feed --platform twitter --limit 5

# Post a test tweet
social-cli post "Testing my new social-cli setup!" --platform twitter
```

If these commands work, you're all set!

## Understanding X API Tiers

### Free Tier (Basic Access)

**Included:**
- 1,500 tweets retrieved per month
- 50 tweets posted per month
- 500,000 tweets retrieved per month (app level)

**Limitations:**
- No streaming API
- No tweet annotations
- Limited to v2 endpoints

**Cost:** Free

### Basic Tier

**Included:**
- 10,000 tweets retrieved per month
- 3,000 tweets posted per month
- 1,000,000 tweets retrieved per month (app level)

**Additional features:**
- 3 app environments
- Higher rate limits

**Cost:** $100/month

### Pro Tier

**Included:**
- 1,000,000 tweets retrieved per month
- 300,000 tweets posted per month
- Higher rate limits
- Full archive search
- Tweet annotations

**Cost:** $5,000/month

For most personal use cases, the **Free tier** is sufficient.

## Rate Limits

### Free Tier Limits

**Reading:**
- 1,500 tweets per month per user
- 15 requests per 15 minutes for most endpoints

**Posting:**
- 50 tweets per month per user
- 300 tweets per 3 hours (overall limit)
- 50 requests per 15 minutes

**Other Operations:**
- Like: 1,000 per day
- Retweet: 300 per 3 hours
- Follow: 400 per day

The tool will notify you when you approach or hit these limits.

## Troubleshooting

### "Could not authenticate you"

**Cause:** Invalid or expired credentials

**Solution:**
1. Verify your credentials are correct
2. Check if your Access Token matches your API Key
3. Regenerate Access Token if needed (remember to update permissions first if required)
4. Run `social-cli auth setup` again with new credentials

### "Read-only application cannot POST"

**Cause:** App permissions set to "Read Only"

**Solution:**
1. Go to your app's Settings in Developer Portal
2. Edit App permissions to "Read and Write"
3. Regenerate Access Token and Secret
4. Update credentials in social-cli

### "Rate limit exceeded"

**Cause:** You've exceeded the monthly or per-window rate limits

**Solution:**
1. Wait for the rate limit to reset (shown in error message)
2. Consider upgrading to Basic tier for higher limits
3. Optimize your usage to stay within limits

### "App suspended"

**Cause:** Violation of X Developer Policy

**Solution:**
1. Review X Developer Policy and Platform Use Rules
2. Contact X Developer Support
3. Appeal the suspension if you believe it was in error

## Best Practices

### Security

1. **Never share your API credentials**
2. **Never commit credentials to version control**
3. **Rotate credentials regularly** (every 90 days recommended)
4. **Use read-only Bearer Token** for operations that don't need write access
5. **Monitor your app usage** in the Developer Portal

### Rate Limit Management

1. **Cache responses** when possible
2. **Batch operations** instead of individual calls
3. **Use webhooks** instead of polling (if on paid tier)
4. **Monitor your usage** in the Developer Portal dashboard
5. **Implement backoff strategies** when hitting limits

### API Usage

1. **Use user context** (OAuth 1.0a) for user-specific operations
2. **Use app context** (Bearer Token) for read-only operations
3. **Follow X's automation rules**:
   - Don't spam or post duplicate content
   - Don't circumvent rate limits
   - Don't misuse the platform

## Additional Resources

- [X API Documentation](https://developer.twitter.com/en/docs)
- [X Developer Policy](https://developer.twitter.com/en/developer-terms/policy)
- [X Platform Use Rules](https://help.twitter.com/en/rules-and-policies/twitter-rules)
- [Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [API Status](https://api.twitterstat.us/)

## Getting Help

- [X Developer Community](https://twittercommunity.com/)
- [X Developer Support](https://developer.twitter.com/en/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/twitter-api) (tag: twitter-api)

## Next Steps

Once your X/Twitter integration is set up:

1. Explore other platforms: [Instagram Setup](INSTAGRAM_SETUP.md) | [LinkedIn Setup](LINKEDIN_SETUP.md)
2. Learn to use the [CLI tool](../README.md#cli-tool)
3. Try the [Claude Code skills](../README.md#claude-code-skills)
4. Launch the [Feed Viewer](../README.md#feed-viewer)
