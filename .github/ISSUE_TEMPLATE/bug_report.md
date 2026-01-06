---
name: Bug Report
about: Report a bug or unexpected behavior
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Bug Description

A clear and concise description of what the bug is.

## 📋 Steps to Reproduce

1. Go to '...'
2. Run command '...'
3. See error

## ✅ Expected Behavior

A clear description of what you expected to happen.

## ❌ Actual Behavior

A clear description of what actually happened.

## 📸 Screenshots / Logs

If applicable, add screenshots or error logs to help explain the problem.

<details>
<summary>Click to expand logs</summary>

```
Paste your logs here
```

</details>

## 🌍 Environment

- **OS**: [e.g., macOS 14.0, Ubuntu 22.04, Windows 11]
- **Node.js version**: [e.g., 20.10.0]
- **npm version**: [e.g., 10.2.0]
- **cyberpanel-mcp version**: [e.g., 1.0.0]
- **CyberPanel version**: [e.g., 2.3.5]
- **MCP Client**: [e.g., Claude Desktop, VS Code]

## 🔧 Configuration

Please share your MCP configuration (remove sensitive data like API keys):

```json
{
  "mcpServers": {
    "cyberpanel": {
      "command": "npx",
      "args": ["-y", "cyberpanel-mcp"],
      "env": {
        "CYBERPANEL_URL": "https://your-server:8090",
        "CYBERPANEL_API_KEY": "REDACTED"
      }
    }
  }
}
```

## 📝 Additional Context

Add any other context about the problem here.

## ✔️ Checklist

- [ ] I have searched existing issues to ensure this is not a duplicate
- [ ] I have provided all relevant information
- [ ] I have removed any sensitive information from logs/config
- [ ] I am using the latest version of cyberpanel-mcp
