# Claude Code CLI - Installation and Setup

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Dual-core 1.6 GHz | Quad-core 2.4 GHz or better |
| RAM | 4 GB | 8 GB or more |
| Disk Space | 500 MB free | 1 GB or more free |
| Network | Broadband connection | High-speed broadband connection |

### Software Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| Operating System | macOS 10.15+ or Linux (Ubuntu 18.04+, Debian 10+, etc.) | Windows not supported directly (requires WSL) |
| Node.js | v18.0.0 or higher | LTS version recommended |
| npm | v7.0.0 or higher | Included with Node.js |
| Git | Any recent version | Required for version control features |

## Installation Methods

### Global Installation (Recommended)

```bash
npm install -g @anthropic-ai/claude-code
```

This will install Claude Code globally, making the `claude` command available throughout your system.

### Project-Specific Installation

```bash
cd your-project-directory
npm install @anthropic-ai/claude-code
```

When installed locally, you can run it using:

```bash
npx claude
```

### Installation Verification

To verify the installation was successful:

```bash
claude --version
```

This should display the current version of Claude Code.

## First-Time Setup

### Authentication Setup

1. Run `claude` in your terminal
2. You will be prompted to authenticate with Anthropic
3. A browser window will open for OAuth authentication
4. Sign in with your Anthropic Console account
5. Grant the requested permissions
6. Return to the terminal where authentication will be confirmed

### Workspace Configuration

Claude Code automatically recognizes and works with existing project structures, including:

- Git repositories
- npm/yarn projects
- Standard directory layouts for common frameworks

No additional configuration is typically required.

### Optional Configuration

A configuration file can be created at `~/.claude-code/config.json` with the following structure:

```json
{
  "telemetry": true,
  "logLevel": "info",
  "maxHistorySize": 1000,
  "theme": "dark",
  "editor": {
    "preferredLauncher": "code"
  },
  "git": {
    "preferredRemote": "origin"
  }
}
```

## Environment Configuration

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLAUDE_API_KEY` | Override API key | OAuth-provided token |
| `CLAUDE_CONFIG_PATH` | Custom config location | `~/.claude-code/config.json` |
| `CLAUDE_LOG_LEVEL` | Set logging verbosity | `info` |
| `CLAUDE_TELEMETRY` | Enable/disable telemetry | `true` |
| `CLAUDE_WORKSPACE` | Default workspace | Current directory |

### Proxy Configuration

Claude Code respects standard proxy environment variables:

- `HTTP_PROXY` / `http_proxy`
- `HTTPS_PROXY` / `https_proxy`
- `NO_PROXY` / `no_proxy`

## Update Procedures

### Manual Update

```bash
npm update -g @anthropic-ai/claude-code
```

### Automatic Update Checking

Claude Code checks for updates on startup and notifies when a new version is available.

### Version Rollback

If needed, you can install a specific version:

```bash
npm install -g @anthropic-ai/claude-code@0.2.28
```

## Troubleshooting

### Common Installation Issues

| Issue | Possible Cause | Resolution |
|-------|---------------|------------|
| Permission errors | Insufficient npm permissions | Use `sudo` or fix npm permissions |
| Node version error | Outdated Node.js | Update Node.js to v18+ |
| Command not found | Path issues | Check PATH environment variable |
| Installation hangs | Network issues | Check network connection, try with `--verbose` |

### Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify Claude installation
which claude

# Check Claude version
claude --version

# Run with verbose logging
claude --verbose
```

### Support Resources

- GitHub issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://docs.anthropic.com/en/docs/agents/claude-code/introduction

## Uninstallation

### Complete Removal

```bash
npm uninstall -g @anthropic-ai/claude-code
rm -rf ~/.claude-code
```

### Preserving Configuration

```bash
npm uninstall -g @anthropic-ai/claude-code
# Configuration remains in ~/.claude-code for future installations
``` 