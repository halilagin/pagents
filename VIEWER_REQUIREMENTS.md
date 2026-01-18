# Feed Viewer Requirements

## ✅ Root Cause Analysis Complete

### The Problem

When running `npm run viewer`, you encountered this error:
```
ERROR Raw mode is not supported on the current process.stdin
```

### Root Cause Identified

**The feed viewer requires an interactive terminal (TTY) with raw mode support.**

#### Technical Details:

```javascript
// In Claude Code's Bash environment:
process.stdin.isTTY: undefined        // ❌ No TTY
process.stdin.setRawMode: undefined   // ❌ No raw mode support

// The viewer uses Ink's useInput hook which requires:
useInput((input, key) => { ... })     // ❌ Fails without TTY
```

#### Why It Fails:

1. **Ink's `useInput` hook requires stdin to be a TTY** that supports raw mode
2. **Claude Code's Bash tool is non-interactive** - it doesn't provide a TTY
3. **When the hook tries to enable raw mode**, the function doesn't exist
4. **Result**: "Raw mode is not supported" error

### ✅ Fix Applied

Added a TTY check at the start of the viewer that provides a clear error message:

```typescript
// Check if stdin is a TTY before importing Ink
if (!process.stdin.isTTY) {
  console.error('❌ Error: Feed viewer requires an interactive terminal (TTY).');
  // ... helpful error message with alternatives
  process.exit(1);
}
```

### Where the Viewer Works

The feed viewer will work in proper interactive terminals:

✅ **Will Work:**
- Terminal.app (macOS)
- iTerm2 (macOS)
- GNOME Terminal (Linux)
- Konsole (Linux)
- Windows Terminal
- VS Code integrated terminal
- Any terminal emulator with TTY support

❌ **Will NOT Work:**
- Claude Code's Bash tool (no TTY)
- CI/CD environments (non-interactive)
- Piped/redirected stdin
- Background processes
- SSH without TTY allocation
- Docker without -it flags

### How to Use the Viewer

#### Option 1: Run in Your Terminal (Recommended)

```bash
# Open your regular terminal (Terminal.app, iTerm2, etc.)
cd /Users/halilagin/root/github/halil-personal-agents
npm run viewer
```

#### Option 2: Use the CLI Tool Instead

The CLI tool works in ANY environment, including Claude Code:

```bash
# View feed
social-cli feed --platform twitter --limit 10

# View feed as JSON for processing
social-cli feed --platform twitter --limit 20 --json

# View profile
social-cli profile --platform twitter

# Post
social-cli post "Hello world!" --platform twitter
```

### Testing the Viewer

To verify the viewer works, run this in a real terminal:

```bash
# 1. Open Terminal.app or iTerm2
# 2. Navigate to project directory
cd /Users/halilagin/root/github/halil-personal-agents

# 3. Make sure you have credentials configured
social-cli auth setup

# 4. Test the CLI first
social-cli feed --platform twitter --limit 5

# 5. If CLI works, launch the viewer
npm run viewer

# 6. Use keyboard controls:
#    q - quit
#    r - refresh
#    1/2/3 - toggle platforms
```

## Environment Comparison

### Claude Code Bash Environment
```bash
$ node -e "console.log(process.stdin.isTTY)"
undefined                    # ❌ No TTY

$ tty
not a tty                    # ❌ Not a terminal
```

### Real Terminal Environment
```bash
$ node -e "console.log(process.stdin.isTTY)"
true                         # ✅ Has TTY

$ tty
/dev/ttys001                 # ✅ Proper terminal device
```

## Summary

| Feature | Claude Code Bash | Real Terminal |
|---------|-----------------|---------------|
| TTY Support | ❌ No | ✅ Yes |
| Raw Mode | ❌ No | ✅ Yes |
| Feed Viewer | ❌ Won't work | ✅ Works |
| CLI Tool | ✅ Works | ✅ Works |
| Interactive Input | ❌ No | ✅ Yes |
| Keyboard Controls | ❌ No | ✅ Yes |

## Recommendations

1. **For the feed viewer**: Use a real terminal (Terminal.app, iTerm2, etc.)
2. **For automation/scripting**: Use the CLI tool with `--json` output
3. **For Claude Code**: Use the CLI commands or Claude Code skills (`/x`, `/instagram`, `/linkedin`)

## Additional Notes

### Why This Design?

The feed viewer is intentionally designed as an **interactive terminal UI application**:
- Real-time updates with auto-refresh
- Keyboard navigation
- Multi-column layout
- Beautiful terminal interface

These features **require** TTY support and are meant for direct user interaction, not programmatic access.

### Alternative: MCP Server

For programmatic access from Claude Code or other tools, consider implementing an MCP (Model Context Protocol) server in the future. This would provide:
- Programmatic API access
- No TTY requirements
- Integration with Claude Desktop
- Better automation support

## Verification Steps

### Step 1: Verify TTY Check Works
```bash
$ npm run viewer
❌ Error: Feed viewer requires an interactive terminal (TTY).
# ✅ Clear error message instead of raw mode error
```

### Step 2: Verify CLI Works in Claude Code
```bash
$ social-cli feed --platform twitter --limit 5
# ✅ Should show feed or authentication error (not TTY error)
```

### Step 3: Verify Viewer Works in Real Terminal
```bash
# In Terminal.app:
$ npm run viewer
# ✅ Should show interactive feed viewer UI
```

## Troubleshooting

### "command not found: social-cli"
```bash
npm link                     # Link CLI globally
# Or use: node dist/cli/index.js
```

### "No credentials found"
```bash
social-cli auth setup        # Configure credentials
```

### "Rate limit exceeded"
```bash
# Wait for reset time or upgrade API tier
```

### Viewer still shows raw mode error
```bash
npm run build               # Rebuild with fix
npm run viewer              # Should show better error
```

## Conclusion

✅ **Root cause identified**: Feed viewer requires TTY support
✅ **Fix applied**: Clear error message with alternatives
✅ **Workarounds provided**: Use CLI tool or real terminal
✅ **Expected behavior**: This is by design - viewer needs interactive terminal

The viewer is working as designed. Use it in a real terminal for the full interactive experience, or use the CLI tool for command-line access from any environment.
