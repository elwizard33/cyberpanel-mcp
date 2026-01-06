#!/bin/bash
#
# CyberPanel API Keys Plugin Updater
# 
# This script updates the apiKeys plugin without affecting the database.
# It only copies Python files and templates - your API keys are safe in MySQL!
#
# Usage:
#   cd ~/cyberpanel-mcp && git pull && sudo bash update-plugin.sh
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

CYBERPANEL_ROOT="/usr/local/CyberCP"
PLUGIN_NAME="apiKeys"

echo -e "${BLUE}[INFO]${NC} Updating CyberPanel API Keys plugin..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo -e "${YELLOW}[WARNING]${NC} Running as non-root, using sudo for file operations"
fi

# Check current keys in database BEFORE update
echo -e "${BLUE}[INFO]${NC} Checking existing API keys in database..."
KEY_COUNT=$(mysql -u root cyberpanel -N -e "SELECT COUNT(*) FROM api_keys;" 2>/dev/null || echo "0")
echo -e "${GREEN}[INFO]${NC} Found $KEY_COUNT existing API key(s) in database (these will be preserved)"

# Copy plugin files (only Python, templates, static - NOT database)
echo -e "${BLUE}[INFO]${NC} Copying updated plugin files..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -d "$SCRIPT_DIR/apiKeys-plugin" ]]; then
    # Copy files preserving structure
    cp -r "$SCRIPT_DIR/apiKeys-plugin/"* "$CYBERPANEL_ROOT/$PLUGIN_NAME/"
    
    # Fix ownership
    chown -R lscpd:lscpd "$CYBERPANEL_ROOT/$PLUGIN_NAME"
    
    echo -e "${GREEN}[SUCCESS]${NC} Plugin files updated"
else
    echo -e "${YELLOW}[ERROR]${NC} apiKeys-plugin directory not found in $SCRIPT_DIR"
    exit 1
fi

# Clear Python cache
echo -e "${BLUE}[INFO]${NC} Clearing Python cache..."
find "$CYBERPANEL_ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# Restart service
echo -e "${BLUE}[INFO]${NC} Restarting lscpd service..."
systemctl restart lscpd

# Verify keys still exist
echo -e "${BLUE}[INFO]${NC} Verifying API keys are still in database..."
KEY_COUNT_AFTER=$(mysql -u root cyberpanel -N -e "SELECT COUNT(*) FROM api_keys;" 2>/dev/null || echo "0")
echo -e "${GREEN}[SUCCESS]${NC} $KEY_COUNT_AFTER API key(s) found after update"

if [[ "$KEY_COUNT" != "$KEY_COUNT_AFTER" ]]; then
    echo -e "${YELLOW}[WARNING]${NC} Key count changed! Was $KEY_COUNT, now $KEY_COUNT_AFTER"
else
    echo -e "${GREEN}[SUCCESS]${NC} All API keys preserved!"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Plugin updated successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your API keys are stored in MySQL (cyberpanel.api_keys table)"
echo "They persist across plugin updates."
echo ""
echo "To view your keys: mysql -u root cyberpanel -e 'SELECT id, name, LEFT(\`key\`, 20) as preview FROM api_keys;'"
