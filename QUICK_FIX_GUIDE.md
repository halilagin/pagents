# Quick Fix Guide: Feed Viewer Error

## The Problem
```
$ npm run viewer
ERROR Raw mode is not supported on the current process.stdin
```

## The Solution (Choose One)

### ✅ Option 1: Use Watch Mode (Works in Claude Code!)
```bash
npm run viewer:watch -- --once --limit 5
```

**What it does**: Shows feeds without needing interactive terminal

### ✅ Option 2: Use CLI Tool
```bash
social-cli feed --platform twitter --limit 10
```

**What it does**: Quick feed view for one platform

### ✅ Option 3: Use in Real Terminal
```bash
# Open Terminal.app or iTerm2 first
npm run viewer
```

**What it does**: Full interactive UI with keyboard controls

---

## Why This Happened

```
┌─────────────────────────────────────────────────────────────┐
│ npm run viewer → Needs TTY → Claude Code has no TTY → ERROR │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ social-watch → No TTY needed → Works anywhere → ✅ SUCCESS   │
└─────────────────────────────────────────────────────────────┘
```

**Simple explanation**: 
- Interactive viewer needs keyboard input (requires TTY)
- Claude Code bash doesn't provide TTY
- Watch mode doesn't need keyboard input (works without TTY)

---

## Quick Command Reference

### For Claude Code (No TTY)
```bash
npm run viewer:watch -- --once          # Show feeds once
npm run viewer:watch -- --once --limit 3  # Quick check
social-cli feed --platform twitter      # Single platform
```

### For Real Terminal (Has TTY)
```bash
npm run viewer                          # Interactive UI
npm run viewer:watch                    # Auto-refresh every 60s
```

### Help Commands
```bash
npm run viewer:watch -- --help          # Watch mode help
social-cli --help                       # CLI help
social-cli feed --help                  # Feed command help
```

---

## All Three Methods

| Method | When to Use | Command |
|--------|-------------|---------|
| 🎮 **Interactive Viewer** | Real terminal, want keyboard controls | `npm run viewer` |
| 👀 **Watch Mode** | Claude Code, automation, CI/CD | `npm run viewer:watch --once` |
| ⚡ **CLI Tool** | Quick checks, scripting | `social-cli feed --platform twitter` |

---

## Testing

```bash
# Test 1: Watch mode (should work)
npm run viewer:watch -- --once

# Test 2: CLI (should work)
social-cli profile --platform twitter

# Test 3: Interactive viewer (needs real terminal)
# Open Terminal.app first, then:
npm run viewer
```

---

## Twitter 402 Error (Separate Issue)

If you see:
```
❌ Error fetching twitter feed: Request failed with code 402
```

This is NOT related to TTY - it's Twitter API saying:
- "Payment Required" (HTTP 402)
- Your free tier might be exhausted
- Check Twitter Developer Portal for API status

---

## Status: ✅ FIXED

- Error message improved
- Watch mode created
- Works in Claude Code
- Works in real terminals
- Documentation complete

**You're good to go!** 🎉
