# LinkedIn API Setup Guide

This guide walks you through setting up LinkedIn API credentials for use with the social-cli tool.

## Prerequisites

- LinkedIn account
- Email address verified on your LinkedIn account
- LinkedIn profile (recommend having a complete profile)

## Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)

2. Sign in with your LinkedIn account

3. Click "Create app"

4. Fill in the app details:
   - **App name**: Choose a unique name (e.g., "Social Media Manager")
   - **LinkedIn Page**: Associate with your LinkedIn Page (or create one)
     - If you don't have a page, click "Create a new LinkedIn Page"
     - Fill in minimal details and create
   - **Privacy policy URL**: Your privacy policy URL (required)
     - Can use placeholder for testing: `https://example.com/privacy`
   - **App logo**: Upload a logo (recommended 300x300 px PNG)
   - **Legal agreement**: Check the box to agree

5. Click "Create app"

## Step 2: Verify Your App

LinkedIn requires app verification:

1. After creating the app, you'll see a verification status

2. Click "Verify" next to your LinkedIn Page

3. You'll receive verification instructions via email

4. Follow the email instructions to verify your app (usually involves:
   - Confirming your email
   - Verifying your LinkedIn Page

5. Wait for verification (usually takes a few minutes to a few hours)

## Step 3: Configure OAuth 2.0 Settings

1. In your app dashboard, go to the "Auth" tab

2. Under "OAuth 2.0 settings", find "Redirect URLs"

3. Click "+ Add redirect URL"

4. Add: `http://localhost:3000/callback`

5. Click the "Update" button

6. Note your credentials under "Application credentials":
   - **Client ID**
   - **Client Secret**

## Step 4: Request API Access Products

LinkedIn uses a product-based access model:

1. In your app dashboard, go to the "Products" tab

2. Request access to the following products:

### Sign In with LinkedIn using OpenID Connect
- Click "Request access"
- This gives you access to:
  - `openid`
  - `profile`
  - `email`

### Share on LinkedIn
- Click "Request access"
- This gives you access to:
  - `w_member_social` (post content)

### Advertising API (Optional, for analytics)
- If you need insights and analytics
- Note: Requires additional verification

3. Wait for approval (usually instant for basic products)

## Step 5: Configure Permissions

Ensure your app has these OAuth 2.0 scopes:

- `r_liteprofile` or `profile` - Read profile information
- `r_emailaddress` or `email` - Read email address
- `w_member_social` - Share, post, and comment on content

These are automatically included with the products you requested.

## Step 6: Get Access Token via OAuth

The social-cli tool supports OAuth 2.0 flow:

### Option A: Using social-cli OAuth Flow (Recommended)

1. Run the setup wizard:
```bash
social-cli auth setup
```

2. Select "LinkedIn"

3. Choose "OAuth Flow (Recommended)"

4. Enter your credentials:
   - **Client ID**: From Auth tab
   - **Client Secret**: From Auth tab

5. The tool will:
   - Start a local server on port 3000
   - Open your browser for authorization
   - Exchange code for access token
   - Save credentials automatically

### Option B: Manual Token Generation

If the OAuth flow doesn't work:

1. Construct authorization URL:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=r_liteprofile%20r_emailaddress%20w_member_social
```

2. Open this URL in your browser

3. Authorize the app

4. You'll be redirected to `http://localhost:3000/callback?code=AUTHORIZATION_CODE`

5. Copy the authorization code from the URL

6. Exchange code for access token:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=AUTHORIZATION_CODE' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'redirect_uri=http://localhost:3000/callback'
```

7. The response contains your access token

8. Run `social-cli auth setup`, choose "Manual", and enter the token

## Step 7: Configure in social-cli

If you used manual token generation:

1. Run the setup wizard:
```bash
social-cli auth setup
```

2. Select "LinkedIn"

3. Choose "Manual (Enter access token directly)"

4. Enter your credentials:
   - **Client ID**: Your app's Client ID
   - **Client Secret**: Your app's Client Secret
   - **Access Token**: The token from Step 6

## Step 8: Verify Setup

Test your configuration:

```bash
# View your profile
social-cli profile --platform linkedin

# View your feed
social-cli feed --platform linkedin --limit 5

# Post a test update
social-cli post "Test post from social-cli!" --platform linkedin
```

## Understanding LinkedIn API Versions

LinkedIn has migrated to new API versions. The social-cli tool uses:

### v2 API (Current)
- Most stable and widely supported
- Used for profile, posts, and engagement
- Rate limits: 100 calls per day per user

### Migration from v1
- If you have old v1 tokens, they won't work
- Must use OAuth 2.0 with new scopes
- Update your app to use Sign In with LinkedIn using OpenID Connect

## Rate Limits

### Standard Rate Limits

**Per User:**
- 100 API calls per day
- Throttle limit: 60 calls per minute

**Per App:**
- 1,000 API calls per day (shared across all users)

**Social Actions:**
- Posts: No specific limit, but reasonable use expected
- Comments: No specific limit
- Likes: No specific limit

The tool will notify you when approaching limits.

### Token Expiration

- **Access tokens**: Expire after 60 days
- **Refresh tokens**: Not provided by default
- Must re-authenticate after 60 days

## Best Practices for LinkedIn Content

### Post Types and Performance

1. **Text posts**:
   - Keep between 150-300 characters for best engagement
   - Can go up to 3,000 characters
   - First 140 characters shown in feed

2. **Article shares**:
   - Use the `--link` parameter
   - Provide context with your commentary
   - LinkedIn auto-generates preview

3. **Media posts**:
   - Images: 1200 x 627 px recommended
   - Videos: Up to 10 minutes, 5GB max

### Optimal Posting Times

- **Best days**: Tuesday, Wednesday, Thursday
- **Best times**: 9 AM - 12 PM (your audience's timezone)
- **Avoid**: Early morning, late evening, weekends

### Content Strategy

1. **Professional tone**:
   - Industry insights and expertise
   - Thought leadership
   - Company updates and achievements

2. **Engagement tactics**:
   - Ask questions
   - Share data and statistics
   - Use relevant hashtags (3-5)
   - Tag relevant people/companies

3. **Hashtag strategy**:
   - Mix popular and niche hashtags
   - Include industry-specific tags
   - Use branded hashtags
   - Examples: #Leadership #Innovation #TechTrends

## API Limitations

### What You CAN Do:
✅ Post text updates
✅ Share articles with links
✅ Read your feed
✅ Like posts
✅ Comment on posts
✅ Share/repost content
✅ Read your profile

### What You CANNOT Do:
❌ Search posts generally (very limited search)
❌ Access other users' private data
❌ Send InMail messages
❌ Post to company pages (requires different permissions)
❌ Access job postings API (requires separate product)
❌ Comprehensive analytics (requires Ads API access)

## Troubleshooting

### "OAuth failed: redirect_uri_mismatch"

**Cause:** Redirect URI doesn't match configured value

**Solution:**
1. Go to your app's Auth tab
2. Verify redirect URI is exactly: `http://localhost:3000/callback`
3. No trailing slash, exact match required
4. Save and try again

### "Permission denied: invalid scope"

**Cause:** Missing required permissions/products

**Solution:**
1. Go to your app's Products tab
2. Ensure you have:
   - "Sign In with LinkedIn using OpenID Connect" (approved)
   - "Share on LinkedIn" (approved)
3. Wait for approval if pending
4. Generate new access token with correct scopes

### "Access token expired"

**Cause:** LinkedIn access tokens expire after 60 days

**Solution:**
1. Run `social-cli auth setup` again
2. Complete OAuth flow to get new token
3. Consider setting a reminder to refresh every 60 days

### "Application is not verified"

**Cause:** App verification incomplete

**Solution:**
1. Check app dashboard for verification status
2. Complete email verification
3. Verify LinkedIn Page association
4. Wait for verification to complete

### "Rate limit exceeded"

**Cause:** Exceeded 100 calls per day limit

**Solution:**
1. Wait until next day (resets at midnight UTC)
2. Reduce frequency of API calls
3. Cache results when possible
4. Consider if you need enterprise access

### "Cannot post: token has no write permissions"

**Cause:** Access token missing `w_member_social` scope

**Solution:**
1. Ensure "Share on LinkedIn" product is approved
2. Regenerate access token with correct scopes
3. Verify scopes in Graph API Explorer or similar tool

## Security Best Practices

1. **Protect credentials**:
   - Never commit Client Secret to version control
   - Store access tokens securely
   - Don't share tokens

2. **Token management**:
   - Refresh before 60-day expiration
   - Monitor token usage in app dashboard
   - Revoke compromised tokens immediately

3. **App security**:
   - Use HTTPS in production
   - Implement CSRF protection
   - Validate all input data

4. **Compliance**:
   - Follow LinkedIn API Terms of Use
   - Respect user privacy
   - Don't scrape or store user data unnecessarily

## LinkedIn API Policies

### Developer Agreement

Must comply with:
- Don't replicate LinkedIn functionality
- Don't use data for purposes other than stated
- Respect member privacy
- Don't spam or send unsolicited messages
- Follow rate limits

### Prohibited Actions

❌ Scraping data
❌ Storing member data without permission
❌ Selling or sharing member data
❌ Using data for advertising without proper permissions
❌ Automated liking/commenting at scale
❌ Creating fake accounts or profiles

## Monitoring and Analytics

### Check API Usage

1. Go to your app dashboard
2. View "Analytics" tab
3. Monitor:
   - API calls per day
   - Most used endpoints
   - Error rates

### Best Practices

- Stay well under rate limits
- Log API calls in your application
- Monitor error rates
- Set up alerts for quota usage

## Advanced Features

### Company Pages

To post to company pages (not currently in tool):
- Requires additional permissions
- Must be company page admin
- Uses different API endpoints

### Rich Media

LinkedIn supports rich media in posts:
- Images
- Videos
- Documents
- Polls (limited API support)

Currently, the tool supports text and article links. Rich media support can be added in future versions.

## Additional Resources

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Authorization](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Share on LinkedIn API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [Marketing Developer Platform](https://docs.microsoft.com/en-us/linkedin/marketing/)
- [API Terms of Use](https://legal.linkedin.com/api-terms-of-use)

## Getting Help

- [LinkedIn Developer Forums](https://www.linkedin.com/help/linkedin/ask/api)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linkedin-api) (tag: linkedin-api)
- Developer Support (via LinkedIn Help Center)

## Common Use Cases

### 1. Professional Updates

```bash
social-cli post "Excited to announce I've joined [Company] as [Position]! Looking forward to [goal]. #NewJob #CareerGrowth" --platform linkedin
```

### 2. Thought Leadership

```bash
social-cli post "After 10 years in [industry], here are 3 key lessons I've learned:

1. [Lesson 1]
2. [Lesson 2]
3. [Lesson 3]

What lessons have you learned in your career? #Leadership #CareerAdvice" --platform linkedin
```

### 3. Article Sharing

```bash
social-cli post "Fascinating article on the future of [topic]. Key takeaway: [insight]. What do you think? #Industry #Innovation" --platform linkedin --link https://example.com/article --link-title "The Future of [Topic]"
```

## Next Steps

Once your LinkedIn integration is set up:

1. Explore other platforms: [Twitter Setup](TWITTER_SETUP.md) | [Instagram Setup](INSTAGRAM_SETUP.md)
2. Learn to use the [CLI tool](../README.md#cli-tool)
3. Try the [Claude Code skills](../README.md#claude-code-skills)
4. Launch the [Feed Viewer](../README.md#feed-viewer)
