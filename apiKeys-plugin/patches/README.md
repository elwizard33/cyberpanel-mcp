# CyberPanel API Keys Plugin - Patches

This directory contains patches that add API key authentication support to CyberPanel's CloudAPI and integrate the API Keys management page into the CyberPanel UI.

## Overview

- `cloudAPI_auth.patch` - Modifies `cloudAPI/views.py` to accept `X-API-Key` header authentication (SHA-256 hashed)
- `sidebar_menu.patch` - Adds "API Keys" menu entry to the Security submenu in the sidebar

## Security Note

The `cloudAPI_auth.patch` implements secure API key authentication:
1. API keys are stored as SHA-256 hashes in the database
2. Incoming keys are hashed and compared to stored hashes
3. Raw keys are never stored - only shown once at creation

## Automatic Installation (Recommended)

Use the installation script to automatically install the plugin and apply patches:

```bash
# Run on your CyberPanel server as root
cd /path/to/cyberpanel-mcp
chmod +x install-plugin.sh
./install-plugin.sh
```

Or install directly from GitHub:

```bash
curl -sL https://raw.githubusercontent.com/elwizard33/cyberpanel-mcp/main/install-plugin.sh | bash
```

## Manual Installation

### Prerequisites

1. The apiKeys-plugin folder must be copied to CyberPanel
2. You must have write access to CyberPanel files
3. Backup your files before applying patches

### Apply All Patches

```bash
# Navigate to CyberPanel root directory
cd /usr/local/CyberCP

# Apply CloudAPI authentication patch
patch --dry-run -p1 < /path/to/cyberpanel-mcp/patches/cloudAPI_auth.patch
patch -p1 < /path/to/cyberpanel-mcp/patches/cloudAPI_auth.patch

# Apply sidebar menu patch
patch --dry-run -p1 < /path/to/cyberpanel-mcp/patches/sidebar_menu.patch
patch -p1 < /path/to/cyberpanel-mcp/patches/sidebar_menu.patch

# Restart lscpd to apply changes
systemctl restart lscpd
```

### Reverting Patches

To revert the patches:

```bash
cd /usr/local/CyberCP
patch -R -p1 < /path/to/cyberpanel-mcp/patches/sidebar_menu.patch
patch -R -p1 < /path/to/cyberpanel-mcp/patches/cloudAPI_auth.patch
systemctl restart lscpd
```

## What the Patch Does

### cloudAPI_auth.patch

This patch modifies the `router()` function in `cloudAPI/views.py`:

1. **Adds import**: `from django.utils import timezone`
2. **Adds X-API-Key check**: Before the existing token authentication, checks for `X-API-Key` header
3. **Validates API key**: Looks up the key in the `api_keys` table (from apiKeys plugin)
4. **Updates last_used**: Tracks when the API key was last used
5. **Non-breaking**: If no `X-API-Key` header is present or doesn't start with `cp_`, falls back to existing token auth

### Authentication Flow After Patch

```
Request received
    │
    ├─ Has X-API-Key header starting with 'cp_'?
    │   ├─ Yes → Validate against api_keys table
    │   │   ├─ Valid & Active → Proceed to controller
    │   │   └─ Invalid/Inactive → Return error
    │   │
    │   └─ No → Use existing token authentication
    │       ├─ Token valid → Proceed to controller
    │       └─ Token invalid → Return error
```

## Alternative: Direct File Edit

If you prefer not to use patches, you can manually edit `/usr/local/CyberCP/cloudAPI/views.py`:

1. Add `from django.utils import timezone` to imports
2. Find the `try: if cm.verifyLogin(request)[0] == 1:` block
3. Wrap it with the API key check as shown in the patch

## Security Notes

- API keys are stored hashed in the database
- Keys can be revoked without deleting them
- The `last_used` field tracks key usage for auditing
- Only keys linked to the admin user in the request are accepted
