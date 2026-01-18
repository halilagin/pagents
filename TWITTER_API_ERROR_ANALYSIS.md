# Twitter API Error Analysis

## Error
```
❌ Error fetching twitter feed: Request failed with code 402
```

## Root Cause: Credits Depleted ✅ IDENTIFIED

The Twitter API returned detailed error information:

```json
{
  "code": 402,
  "title": "CreditsDepleted",
  "detail": "Your enrolled account [2012982477812371456] does not have any credits to fulfill this request.",
  "type": "https://api.twitter.com/2/problems/credits"
}
```

**HTTP 402 = Payment Required**

The Twitter Developer account has exhausted its API credits allocation.

---

## Endpoint Testing Results

| Endpoint | Status | Reason |
|----------|--------|--------|
| `v2.me()` - Get current user | ✅ WORKS | Basic endpoint, no credits needed |
| `v2.homeTimeline()` - Home feed | ❌ FAILS | CreditsDepleted |
| `v2.userTimeline()` - Own tweets | ❌ FAILS | CreditsDepleted |
| `v2.userMentionTimeline()` - Mentions | ❌ FAILS | CreditsDepleted |
| `v2.followers()` - Followers | ❌ FAILS | CreditsDepleted |
| `v2.following()` - Following | ❌ FAILS | CreditsDepleted |

**Confirmed**: Authentication is working correctly (user: `hailo_berto`)

---

## Twitter API v2 Credit System

### How Credits Work

Twitter's API v2 uses a credit-based system:

1. **Free Tier**: Limited monthly credits
   - ~1,500 tweet reads per month
   - ~50 tweet posts per month
   - Credits reset monthly

2. **Basic Tier** ($100/month):
   - 10,000 tweet reads per month
   - 3,000 tweet posts per month
   - Higher rate limits

3. **Pro Tier** ($5,000/month):
   - 1,000,000 tweet reads per month
   - 300,000 tweet posts per month
   - Full archive search

### Credit Usage

Different operations cost different amounts of credits:
- Reading tweets: Uses read credits
- Posting tweets: Uses post credits
- Timeline operations: Uses read credits
- Search: Uses read credits

---

## Why This Happened

The account `hailo_berto` is on the **Free tier** and has:
1. Used all available monthly credits
2. No credits remaining for tweet reading operations
3. Only basic endpoints (like `v2.me()`) still work

---

## Solutions

### Option 1: Wait for Credit Reset (Free)
- Credits reset at the beginning of each billing cycle
- Check Twitter Developer Portal for reset date
- **Cost**: Free, but limited functionality

### Option 2: Purchase More Credits
- Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- Navigate to your app → "Subscriptions"
- Purchase additional credits
- **Cost**: Varies by amount

### Option 3: Upgrade to Basic Tier
- Go to Twitter Developer Portal
- Upgrade to Basic tier
- Get 10,000 reads/month + 3,000 posts/month
- **Cost**: $100/month

### Option 4: Use Different Account
- Create new Twitter Developer account
- Set up new API credentials
- Will have fresh credit allocation
- **Cost**: Free, but requires new account setup

---

## Verification Steps

### Check Current Credit Status

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Click "Usage" or "Subscriptions"
4. View remaining credits and reset date

### Test Credentials

```bash
# This still works (basic endpoint):
node -e "
import { TwitterApi } from 'twitter-api-v2';
const client = new TwitterApi({...credentials...});
const me = await client.v2.me();
console.log('User:', me.data.username);
"
```

---

## Code Changes Recommended

### Improve Error Messages

Update `src/platforms/twitter.ts` to show better error:

```typescript
protected handleError(error: any): never {
  if (error.code === 402 && error.data?.title === 'CreditsDepleted') {
    throw this.createError(
      `Twitter API credits depleted. Your account has no remaining credits. ` +
      `Visit developer.twitter.com to purchase more or wait for monthly reset.`,
      402
    );
  }
  // ... existing error handling
}
```

### Add Credit Check

Could add a method to check credits before operations:

```typescript
async checkCredits(): Promise<boolean> {
  try {
    await this.client.v2.homeTimeline({ max_results: 1 });
    return true;
  } catch (error) {
    if (error.data?.title === 'CreditsDepleted') {
      return false;
    }
    throw error;
  }
}
```

---

## Summary

### Root Cause
✅ **Twitter API credits exhausted** (not a code bug)

### The Code is Working Correctly
✅ Authentication successful (user: hailo_berto)
✅ API connection established
✅ Error handling working
✅ Proper error code returned (402)

### What Needs to Happen
1. Purchase more Twitter API credits, OR
2. Upgrade to Basic tier ($100/month), OR
3. Wait for monthly credit reset, OR
4. Use a different Twitter Developer account

### Temporary Workaround
- The `v2.me()` endpoint still works
- Can show user profile without credits
- Timeline features unavailable until credits restored

---

## Quick Reference

### Check if it's a credit issue:
```bash
npm run viewer:watch -- --once
# Look for: "Request failed with code 402"
```

### Test authentication only:
```bash
social-cli profile --platform twitter
# Should show user info if auth works
```

### Error codes:
- **401** = Invalid credentials
- **402** = Credits depleted (this case)
- **403** = Forbidden (permissions issue)
- **429** = Rate limit exceeded

---

## Action Items

1. ⬜ Check Twitter Developer Portal for credit status
2. ⬜ Decide: wait for reset, buy credits, or upgrade
3. ⬜ (Optional) Update error handling for better messages
4. ⬜ Test again after credits are restored

---

**Status**: Root cause identified. This is a **billing/quota issue**, not a code bug. The system is working correctly - Twitter's API is rejecting requests due to exhausted credits.
