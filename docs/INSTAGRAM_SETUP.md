# Instagram API Setup Guide

This guide walks you through setting up Instagram Graph API credentials for use with the social-cli tool.

## Prerequisites

- Instagram account (must be Business or Creator account)
- Facebook account
- Facebook Page connected to your Instagram account
- Instagram Business or Creator account linked to the Facebook Page

## Important Limitations

Before you begin, understand that the Instagram Graph API:

- ✅ **CAN**: Post photos/videos, read your feed, comment
- ❌ **CANNOT**: Post Stories, like posts, send DMs, search hashtags (limited)

**This tool requires an Instagram Business or Creator account**. Personal accounts are not supported by the API.

## Step 1: Convert to Business/Creator Account

If you haven't already, convert your Instagram account:

1. Open Instagram app on your mobile device

2. Go to your profile → Menu (☰) → Settings

3. Tap "Account"

4. Tap "Switch to Professional Account"

5. Choose either:
   - **Creator**: For public figures, content creators, artists
   - **Business**: For brands, organizations, retailers

6. Select your category and complete the setup

## Step 2: Create Facebook Page

If you don't have a Facebook Page:

1. Go to [Facebook Pages](https://www.facebook.com/pages/create)

2. Click "Create New Page"

3. Fill in page details:
   - **Page name**: Your business/creator name
   - **Category**: Choose appropriate category
   - **Description**: Brief description

4. Click "Create Page"

## Step 3: Link Instagram to Facebook Page

1. Go to your Facebook Page

2. Click "Settings" in the left sidebar

3. Click "Instagram" in the left menu

4. Click "Connect Account"

5. Log in to your Instagram Business account

6. Authorize the connection

7. Verify that your Instagram account appears as connected

## Step 4: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)

2. Click "My Apps" → "Create App"

3. Select app type:
   - Choose "Business" for most use cases
   - Click "Next"

4. Fill in app details:
   - **App name**: Choose a name (e.g., "Social Media Manager")
   - **App contact email**: Your email
   - **Business account** (optional): Select if applicable

5. Click "Create App"

6. You may need to verify your account via email or 2FA

## Step 5: Add Instagram Graph API

1. In your app dashboard, scroll to "Add Products to Your App"

2. Find "Instagram Graph API" and click "Set Up"

3. Or click "Add Product" and select "Instagram Graph API"

## Step 6: Configure App Settings

1. Go to your app's Settings → Basic

2. Fill in required fields:
   - **App Domains**: Your domain or `localhost` for testing
   - **Privacy Policy URL**: Your privacy policy URL (can be a placeholder for testing)
   - **Terms of Service URL** (optional)
   - **App Icon** (optional)

3. Save changes

## Step 7: Get Access Token

### Using Facebook Graph API Explorer (Recommended for Testing)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

2. In the top right:
   - Select your app from "Facebook App" dropdown
   - Click "Generate Access Token"

3. Grant permissions when prompted

4. Add the following permissions by clicking "Add a Permission":
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`

5. Click "Generate Access Token"

6. Copy the token (this is a short-lived token, expires in 1 hour)

### Get Long-Lived Access Token

Short-lived tokens expire quickly. Convert to a long-lived token:

1. Use this API call (replace values):
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

2. This returns a long-lived token (valid for 60 days)

3. Copy this token for use in social-cli

### Get Instagram Business Account ID

1. In Graph API Explorer, with your long-lived token selected

2. Make this API call:
```
GET /me/accounts
```

3. This returns your Facebook Pages. Find your page and note its `id`

4. Make this API call (replace PAGE_ID):
```
GET /PAGE_ID?fields=instagram_business_account
```

5. Note the `instagram_business_account.id` - this is your Instagram Business Account ID

## Step 8: Configure in social-cli

Now configure your credentials:

1. Run the setup wizard:
```bash
social-cli auth setup
```

2. Select "Instagram" from the platform list

3. Enter your credentials when prompted:
   - **User Access Token**: Your long-lived access token
   - **Instagram Business Account ID**: The ID from Step 7
   - **App ID**: Your Facebook App ID (from Settings → Basic)
   - **App Secret**: Your Facebook App Secret (from Settings → Basic)

4. The wizard will save these to your `.env` file

## Step 9: Verify Setup

Test your configuration:

```bash
# View your profile
social-cli profile --platform instagram

# View your feed
social-cli feed --platform instagram --limit 5

# Post a test image (requires publicly accessible image URL)
social-cli post "Test post from social-cli!" --platform instagram --media https://example.com/image.jpg
```

## Understanding Instagram API Permissions

### instagram_basic
- Read profile information
- Read media (posts)
- Read media insights

### instagram_content_publish
- Create media containers
- Publish posts
- Check publishing status

### pages_read_engagement
- Read post comments
- Read public page data

### pages_show_list
- List pages you manage
- Required to access page data

## Rate Limits

### Instagram Graph API Limits

**Standard Access:**
- 200 API calls per hour per user
- 25 posts per day

**Business Discovery:**
- 100 API calls per hour per user

The tool will notify you when approaching these limits.

### Publishing Limits

- Maximum 25 posts per day (via API)
- Maximum 50 posts per day (overall, including app posts)
- No limit on comments

## Supported Media Formats

### Images

- **Formats**: JPG, PNG
- **Size**: Maximum 8MB
- **Minimum resolution**: 320 x 320 pixels
- **Aspect ratios**:
  - Square: 1:1 (1080 x 1080 recommended)
  - Landscape: 1.91:1 (1080 x 566)
  - Portrait: 4:5 (1080 x 1350)

### Videos

- **Formats**: MP4, MOV
- **Size**: Maximum 100MB
- **Duration**: 3-60 seconds
- **Frame rate**: 23-60 FPS
- **Aspect ratios**: Same as images
- **Codecs**: H.264 video, AAC audio

## Troubleshooting

### "Invalid OAuth access token"

**Cause:** Expired or invalid token

**Solution:**
1. Generate a new long-lived access token
2. Run `social-cli auth setup` with new token
3. Ensure token has all required permissions

### "Instagram account is not a business account"

**Cause:** Your Instagram account is a personal account

**Solution:**
1. Convert to Business or Creator account (see Step 1)
2. Link to Facebook Page
3. Try setup again

### "Permission denied"

**Cause:** Missing required permissions

**Solution:**
1. Go to Graph API Explorer
2. Add missing permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
3. Generate new token with all permissions

### "Cannot find Instagram Business Account"

**Cause:** Instagram not properly linked to Facebook Page

**Solution:**
1. Go to your Facebook Page → Settings → Instagram
2. Reconnect your Instagram account
3. Verify connection is shown as "Connected"
4. Get new Instagram Business Account ID

### "Media upload failed"

**Cause:** Image/video doesn't meet requirements

**Solution:**
1. Check file format (JPG, PNG for images; MP4, MOV for videos)
2. Verify file size (max 8MB for images, 100MB for videos)
3. Ensure aspect ratio is supported
4. For URLs, ensure they're publicly accessible (no authentication required)

### "Rate limit exceeded"

**Cause:** Too many API calls in the time window

**Solution:**
1. Wait for the rate limit to reset (1 hour)
2. Reduce frequency of API calls
3. Cache results when possible

## Best Practices

### Content Strategy

1. **Optimal posting times**:
   - Weekdays: 9-11 AM, 7-9 PM
   - Weekends: 11 AM - 1 PM

2. **Hashtag strategy**:
   - Use 5-30 hashtags per post
   - Mix popular and niche hashtags
   - Include branded hashtags

3. **Caption best practices**:
   - First sentence is crucial (shown in feed)
   - Use emojis to break up text
   - Include call-to-action
   - Tag relevant accounts

4. **Image optimization**:
   - Use high-quality images (1080 x 1080 for square)
   - Bright, colorful images perform best
   - Include faces when possible
   - Use consistent filters/style

### Security

1. **Protect your access token**
2. **Never commit `.env` to version control**
3. **Regenerate tokens regularly** (every 60 days at minimum)
4. **Monitor app activity** in Facebook App dashboard
5. **Limit app permissions** to only what's needed

### Token Management

1. **Set up token refresh**:
   - Long-lived tokens expire after 60 days
   - Plan to refresh before expiration
   - Store token securely

2. **Monitor token health**:
   - Test token validity regularly
   - Handle expired token errors gracefully
   - Keep backup of app credentials

## API Limitations to Remember

### What You CAN Do:
✅ Post photos and videos to feed
✅ Read your own feed
✅ Comment on your posts
✅ Get post insights
✅ Read comments on your posts

### What You CANNOT Do:
❌ Post Stories (not available in API)
❌ Like posts programmatically
❌ Share/repost others' content
❌ Send Direct Messages
❌ Access other users' private data
❌ Comprehensive hashtag search

## Additional Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Publishing Content](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Instagram Platform Policy](https://developers.facebook.com/docs/instagram-api/overview#instagram-platform-policy)
- [Rate Limits](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)
- [Debugging Access Tokens](https://developers.facebook.com/tools/debug/accesstoken/)

## Getting Help

- [Facebook Developer Community](https://developers.facebook.com/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/instagram-graph-api) (tag: instagram-graph-api)
- [Facebook Developer Support](https://developers.facebook.com/support/)

## Next Steps

Once your Instagram integration is set up:

1. Explore other platforms: [Twitter Setup](TWITTER_SETUP.md) | [LinkedIn Setup](LINKEDIN_SETUP.md)
2. Learn to use the [CLI tool](../README.md#cli-tool)
3. Try the [Claude Code skills](../README.md#claude-code-skills)
4. Launch the [Feed Viewer](../README.md#feed-viewer)
