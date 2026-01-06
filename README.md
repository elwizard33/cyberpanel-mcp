<p align="center">
  <img src="https://community.cyberpanel.net/uploads/default/original/1X/416fdec0e96357d11f7b2756166c61b1aeca5939.png" alt="CyberPanel Logo" width="200">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://www.cdata.com/drivers/_img/mcp.png" alt="MCP Logo" width="65">
</p>

<h1 align="center">CyberPanel MCP Server</h1>

<p align="center">
  <strong>Model Context Protocol server for CyberPanel - Control your server with AI</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cyberpanel-mcp">
    <img src="https://img.shields.io/npm/v/cyberpanel-mcp?style=flat-square&color=cb3837" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/cyberpanel-mcp">
    <img src="https://img.shields.io/npm/dm/cyberpanel-mcp?style=flat-square&color=cb3837" alt="npm downloads">
  </a>
  <a href="https://github.com/elwizard33/cyberpanel-mcp/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/elwizard33/cyberpanel-mcp?style=flat-square&color=blue" alt="license">
  </a>
  <a href="https://github.com/elwizard33/cyberpanel-mcp/releases">
    <img src="https://img.shields.io/github/v/release/elwizard33/cyberpanel-mcp?style=flat-square&color=green" alt="GitHub release">
  </a>
</p>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [⚠️ Important: IDE Tool Limits](#️-important-ide-tool-limits)
- [🚀 Quick Start](#-quick-start)
  - [One-Click Install for VS Code](#one-click-install-for-vs-code)
  - [Manual Installation](#manual-installation)
- [📦 Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [For VS Code with GitHub Copilot](#for-vs-code-with-github-copilot)
  - [For Cursor IDE](#for-cursor-ide)
  - [For Claude Desktop](#for-claude-desktop)
- [🔧 Environment Variables](#-environment-variables)
- [🛠️ Available Tools](#️-available-tools)
  - [Website Management](#website-management-25-tools)
  - [Database Management](#database-management-15-tools)
  - [Email Management](#email-management-20-tools)
  - [DNS Management](#dns-management-10-tools)
  - [SSL Management](#ssl-management-8-tools)
  - [File Management](#file-management-15-tools)
  - [FTP Management](#ftp-management-6-tools)
  - [Firewall Management](#firewall-management-8-tools)
  - [Backup Management](#backup-management-10-tools)
  - [Docker Management](#docker-management-12-tools)
  - [Server Management](#server-management-15-tools)
- [🔒 Security](#-security)
- [🏗️ Development](#️-development)
- [📝 API Keys Plugin](#-api-keys-plugin)
  - [Plugin Installation](#plugin-installation)
  - [CyberPanel Upgrade Behavior](#️-cyberpanel-upgrade-behavior)
  - [Plugin Commands](#plugin-commands)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

- 🔧 **200+ Tools** - Comprehensive server management through AI
- 🔐 **Secure Authentication** - API key-based authentication
- 🌐 **Website Management** - Create, modify, delete websites
- 📧 **Email Administration** - Full email server control
- 🗄️ **Database Operations** - MySQL/MariaDB management
- 📁 **File Manager** - Browse, edit, upload files
- 🔒 **SSL Certificates** - Automated certificate management
- 🔥 **Firewall Rules** - Security configuration
- 📊 **Server Monitoring** - Status and performance metrics
- 🐳 **Docker Support** - Container management
- 💾 **Backup & Restore** - Automated backups

---

## ⚠️ Important: IDE Tool Limits

> **This MCP server provides 200+ tools.** Some IDEs and AI clients have tool limits that can affect behavior when too many tools are enabled.

### VS Code / GitHub Copilot

VS Code with GitHub Copilot has a recommended limit of **128 tools**. When more tools are enabled:
- Tool quality and selection may degrade
- Some tools may show as "disabled by user" even when enabled
- AI responses may be slower or less accurate
- The IDE may randomly disable tools to stay under the limit

**Recommendations for VS Code users:**

1. **Disable other MCP servers** when using CyberPanel MCP, or
2. **Use tool groups selectively** - Only enable the tool categories you need for your current task
3. **Restart VS Code** if tools appear incorrectly disabled after configuration changes

### Claude Desktop

Claude Desktop generally handles larger tool counts better, but for optimal performance:
- Consider disabling unused MCP servers when working with CyberPanel
- If experiencing slow responses, reduce the number of active tools

### Other MCP Clients

Check your client's documentation for tool limits. Common limits:
- **Cursor**: Similar to VS Code (~128 tools recommended)
- **Windsurf**: Check their documentation for current limits
- **Custom clients**: Implement pagination or categorization if needed

### Future Improvements

We're considering these options to better handle tool limits:
- **Tool categories/groups** - Enable/disable entire categories at once
- **Separate server profiles** - `cyberpanel-websites`, `cyberpanel-email`, etc.
- **Dynamic tool loading** - Only load tools as needed

If you have suggestions, please [open an issue](https://github.com/elwizard33/cyberpanel-mcp/issues)!

---

## 🚀 Quick Start

### One-Click Install (Recommended)

The easiest way to get started is through the **CyberPanel API Keys plugin**, which provides one-click install buttons for all major IDEs:

1. Install the **API Keys** plugin in CyberPanel
2. Generate an API key
3. Click the install button for your IDE:
   - **VS Code** - Opens VS Code and configures MCP automatically
   - **Cursor** - Opens Cursor IDE and configures MCP automatically  
   - **Claude Code** - Copies the CLI command to add MCP to Claude

<p align="center">
  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VS Code">
  <img src="https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white" alt="Cursor">
  <img src="https://img.shields.io/badge/Claude-FF7043?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude">
</p>

### Manual Installation

```bash
# Using npx (no installation required)
npx cyberpanel-mcp

# Or install globally
npm install -g cyberpanel-mcp
```

---

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- CyberPanel server with API Keys plugin installed
- Valid API key

### For VS Code with GitHub Copilot

> 💡 **Tip:** The CyberPanel API Keys plugin provides a one-click install button that configures this automatically!

Add to your VS Code `.vscode/mcp.json` or user `settings.json`:

```json
{
  "servers": {
    "cyberpanel": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "cyberpanel-mcp"],
      "env": {
        "CYBERPANEL_HOST": "https://your-server.com:8090",
        "CYBERPANEL_API_KEY": "your-api-key"
      }
    }
  }
}
```

> ⚠️ **Note:** See the [IDE Tool Limits](#️-important-ide-tool-limits) section if you're using multiple MCP servers.

### For Cursor IDE

> 💡 **Tip:** The CyberPanel API Keys plugin provides a one-click install button that configures this automatically!

Cursor uses the same MCP configuration format. Add to your Cursor MCP settings:

**Option 1: One-Click Install (via CyberPanel plugin)**

The API Keys plugin generates a Cursor deeplink that automatically configures MCP when clicked.

**Option 2: Manual Configuration**

Add to your Cursor `mcp.json` configuration:

```json
{
  "cyberpanel": {
    "command": "npx",
    "args": ["-y", "cyberpanel-mcp"],
    "env": {
      "CYBERPANEL_HOST": "https://your-server.com:8090",
      "CYBERPANEL_API_KEY": "your-api-key"
    }
  }
}
```

> ⚠️ **Note:** Cursor has similar tool limits to VS Code. See the [IDE Tool Limits](#️-important-ide-tool-limits) section.

### For Claude Desktop

> 💡 **Tip:** The CyberPanel API Keys plugin provides a CLI command you can copy and run to configure Claude!

**Option 1: Claude CLI (Recommended)**

```bash
claude mcp add cyberpanel \
  -e CYBERPANEL_HOST=https://your-server.com:8090 \
  -e CYBERPANEL_API_KEY=your-api-key \
  -- npx -y cyberpanel-mcp
```

**Option 2: Manual Configuration**

Add to your Claude configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cyberpanel": {
      "command": "npx",
      "args": ["-y", "cyberpanel-mcp"],
      "env": {
        "CYBERPANEL_HOST": "https://your-server.com:8090",
        "CYBERPANEL_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CYBERPANEL_HOST` | ✅ | Your CyberPanel server URL with port (e.g., `https://server.com:8090`) |
| `CYBERPANEL_API_KEY` | ✅ | API key generated from CyberPanel |

---

## 🛠️ Available Tools

This server provides **200+ tools** organized into categories:

### Website Management (25 tools)
| Tool | Description |
|------|-------------|
| `list_websites` | List all websites on the server |
| `create_website` | Create a new website |
| `delete_website` | Delete a website |
| `suspend_website` | Suspend a website |
| `unsuspend_website` | Unsuspend a website |
| `change_php_version` | Change PHP version |
| `get_php_config` | Get PHP configuration |
| `save_php_config` | Save PHP configuration |

### Database Management (15 tools)
| Tool | Description |
|------|-------------|
| `list_databases` | List all databases for a website |
| `create_database` | Create a new database |
| `delete_database` | Delete a database |
| `list_database_users` | List database users |
| `create_database_user` | Create database user |
| `delete_database_user` | Delete database user |

### Email Management (20 tools)
| Tool | Description |
|------|-------------|
| `list_email_accounts` | List email accounts for a domain |
| `create_email_account` | Create a new email account |
| `delete_email_account` | Delete an email account |
| `change_email_password` | Change email password |
| `list_email_forwardings` | List email forwardings |
| `create_email_forwarding` | Create email forwarding |

### DNS Management (10 tools)
| Tool | Description |
|------|-------------|
| `list_dns_zones` | List all DNS zones |
| `list_dns_records` | List DNS records for a zone |
| `create_dns_record` | Create a DNS record |
| `delete_dns_record` | Delete a DNS record |
| `create_dns_zone` | Create a new DNS zone |

### SSL Management (8 tools)
| Tool | Description |
|------|-------------|
| `issue_ssl` | Issue SSL certificate |
| `issue_wildcard_ssl` | Issue wildcard SSL |
| `get_ssl_status` | Get SSL status for domain |
| `install_custom_ssl` | Install custom SSL certificate |

### File Management (15 tools)
| Tool | Description |
|------|-------------|
| `list_files` | List files in directory |
| `read_file` | Read file contents |
| `write_file` | Write to a file |
| `delete_file` | Delete a file |
| `create_directory` | Create a directory |
| `upload_file` | Upload a file |
| `download_file` | Download a file |

### FTP Management (6 tools)
| Tool | Description |
|------|-------------|
| `list_ftp_accounts` | List FTP accounts |
| `create_ftp_account` | Create FTP account |
| `delete_ftp_account` | Delete FTP account |
| `change_ftp_password` | Change FTP password |

### Firewall Management (8 tools)
| Tool | Description |
|------|-------------|
| `get_firewall_status` | Get firewall status |
| `list_firewall_rules` | List firewall rules |
| `add_firewall_rule` | Add firewall rule |
| `delete_firewall_rule` | Delete firewall rule |

### Backup Management (10 tools)
| Tool | Description |
|------|-------------|
| `create_backup` | Create backup |
| `restore_backup` | Restore from backup |
| `list_backups` | List available backups |
| `delete_backup` | Delete a backup |
| `schedule_backup` | Schedule automated backups |

### Docker Management (12 tools)
| Tool | Description |
|------|-------------|
| `list_containers` | List containers |
| `create_container` | Create container |
| `start_container` | Start container |
| `stop_container` | Stop container |
| `delete_container` | Delete container |
| `list_images` | List Docker images |

### Server Management (15 tools)
| Tool | Description |
|------|-------------|
| `get_server_status` | Get server status |
| `restart_service` | Restart a service |
| `list_packages` | List hosting packages |
| `create_package` | Create hosting package |
| `list_users` | List server users |
| `create_user` | Create a new user |

### And Many More...
- **Package Management** - Hosting packages and limits
- **User Management** - Admin and reseller users
- **Log Viewing** - Access and error logs
- **WordPress Management** - Plugins, themes, staging
- **Cron Jobs** - Scheduled task management
- **Server Statistics** - Resource monitoring
- **Cloud Backups** - AWS S3, DigitalOcean Spaces, MINIO

---

## 🔒 Security

- All API communications are encrypted (HTTPS)
- API keys are stored securely in the CyberPanel database (SHA-256 hashed)
- Keys can be enabled/disabled without deletion
- Full audit trail of key usage

---

## 🏗️ Development

```bash
# Clone the repository
git clone https://github.com/elwizard33/cyberpanel-mcp.git
cd cyberpanel-mcp

# Install dependencies
npm install

# Build
npm run build

# Run locally
CYBERPANEL_HOST=https://your-server:8090 CYBERPANEL_API_KEY=your-key npm start
```

---

## 📝 API Keys Plugin

The API Keys plugin for CyberPanel provides:

- 🔑 Secure API key generation with SHA-256 hashing
- ✅ Enable/disable keys without deletion
- 📋 One-click configuration for Claude & VS Code
- 🔄 Auto-recovery after CyberPanel upgrades (optional)
- 📊 Key management interface

### Plugin Installation

**Basic Installation:**
```bash
# Download and run the install script
curl -sL https://raw.githubusercontent.com/usmannasir/cyberpanel/stable/cyberpanel-mcp/install-plugin.sh | sudo bash
```

**With Auto-Recovery (recommended):**
```bash
# Automatically reinstalls after CyberPanel upgrades
curl -sL https://raw.githubusercontent.com/usmannasir/cyberpanel/stable/cyberpanel-mcp/install-plugin.sh | sudo bash -s -- --auto-recovery
```

### ⚠️ CyberPanel Upgrade Behavior

**Important:** CyberPanel upgrades completely replace the `/usr/local/CyberCP` directory, which removes this plugin. You have two options:

1. **Manual reinstall** - After each CyberPanel upgrade, run the install script again
2. **Auto-recovery** - Install with `--auto-recovery` flag to automatically reinstall after upgrades

The auto-recovery option creates a systemd service that detects when the plugin is missing and reinstalls it automatically. Your API keys in the database are preserved across upgrades.

### Plugin Commands

```bash
# Install with auto-recovery
sudo bash install-plugin.sh --auto-recovery

# Uninstall completely (removes auto-recovery too)
sudo bash install-plugin.sh --uninstall

# Show help
sudo bash install-plugin.sh --help
```

---

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

**Quick Start:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit using [Conventional Commits](https://conventionalcommits.org) (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See our [Issue Guide](.github/ISSUE_TEMPLATE/README.md) for reporting bugs and requesting features.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [CyberPanel](https://cyberpanel.net/) - The hosting panel this integrates with
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [Anthropic](https://anthropic.com/) - For Claude and the MCP SDK

---

<p align="center">
  Made with ❤️ for the CyberPanel community
</p>

<p align="center">
  <a href="https://github.com/elwizard33/cyberpanel-mcp/issues">Report Bug</a> •
  <a href="https://github.com/elwizard33/cyberpanel-mcp/issues">Request Feature</a>
</p>
