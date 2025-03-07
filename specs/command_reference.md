# Claude Code CLI - Command Reference

## Base Command

```
claude [options]
```

The base command launches the Claude Code CLI in the current directory context.

## Core Commands

### Help and Information

| Command | Description |
|---------|-------------|
| `claude --help` | Display help information |
| `claude --version` | Display version information |
| `/help` | Show in-application help |
| `/commands` | List available slash commands |

### Session Management

| Command | Description |
|---------|-------------|
| `/exit` or `/quit` | Exit the application |
| `/clear` | Clear the current session |
| `/reset` | Reset the conversation context |
| `/history` | View conversation history |

### Feature-Specific Commands

| Command | Description |
|---------|-------------|
| `/edit [file]` | Edit a specified file |
| `/search [term]` | Search the codebase for a term |
| `/run [command]` | Execute a terminal command |
| `/explain [file or code]` | Get explanation for code |
| `/git [operation]` | Perform git operations |

### User Preferences

| Command | Description |
|---------|-------------|
| `/config` | View or edit configuration |
| `/theme [name]` | Change the UI theme |
| `/verbosity [level]` | Set output verbosity |

### Feedback and Support

| Command | Description |
|---------|-------------|
| `/bug` | Report a bug or issue |
| `/feedback` | Provide general feedback |

## Natural Language Commands

Claude Code is primarily designed to accept natural language commands. Some examples include:

### Code Understanding

- "Explain how the authentication system works in this codebase"
- "What does this function do?" (when in a file context)
- "How are API requests handled in this application?"
- "Find all usages of the User class"

### Code Editing

- "Create a new file called utils.js with helper functions for date formatting"
- "Fix the bug in the login function that doesn't handle empty passwords"
- "Refactor this function to use async/await instead of promises"
- "Add error handling to this API endpoint"

### Development Workflows

- "Run the tests for the user module"
- "Build the project and tell me if there are any errors"
- "Install the latest version of express and update package.json"
- "Start the development server and monitor for errors"

### Git Operations

- "Create a commit with the message 'Fix login bug'"
- "Show me the recent changes to the authentication module"
- "Create a new branch called feature/user-profiles"
- "Help me resolve these merge conflicts"

## Command Options

### Global Options

| Option | Description |
|--------|-------------|
| `--workspace=<path>` | Specify a workspace directory |
| `--config=<path>` | Use a custom configuration file |
| `--verbose` | Enable verbose output |
| `--quiet` | Minimize output to essential information |
| `--debug` | Enable debug mode with additional logging |

### Authentication Options

| Option | Description |
|--------|-------------|
| `--login` | Force authentication flow |
| `--logout` | Clear saved authentication |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAUDE_API_KEY` | API key for Claude services |
| `CLAUDE_CONFIG_PATH` | Custom path for configuration files |
| `CLAUDE_TELEMETRY` | Enable/disable telemetry (true/false) |
| `CLAUDE_LOG_LEVEL` | Set logging level (debug, info, warn, error) |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Successful execution |
| 1 | General error |
| 2 | Configuration error |
| 3 | Authentication error |
| 4 | Network error |
| 5 | API error | 