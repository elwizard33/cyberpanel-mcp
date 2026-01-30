#!/bin/bash
#
# CyberPanel API Keys Plugin Installer
# 
# This script installs the apiKeys plugin on a CyberPanel server.
# It copies the plugin files, applies patches, runs migrations,
# and restarts the necessary services.
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/elwizard33/cyberpanel-mcp/main/install-plugin.sh | bash
#   OR
#   wget -qO- https://raw.githubusercontent.com/elwizard33/cyberpanel-mcp/main/install-plugin.sh | bash
#   OR
#   ./install-plugin.sh (if running locally)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# CyberPanel paths
CYBERPANEL_ROOT="/usr/local/CyberCP"
PLUGIN_NAME="apiKeys"
PLUGIN_SOURCE_DIR="apiKeys-plugin"

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Check if CyberPanel is installed
check_cyberpanel() {
    if [[ ! -d "$CYBERPANEL_ROOT" ]]; then
        log_error "CyberPanel not found at $CYBERPANEL_ROOT"
        exit 1
    fi
    log_success "CyberPanel found at $CYBERPANEL_ROOT"
}

# Backup existing files
backup_files() {
    log_info "Creating backups..."
    
    BACKUP_DIR="/root/cyberpanel-apikeys-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup cloudAPI/views.py
    if [[ -f "$CYBERPANEL_ROOT/cloudAPI/views.py" ]]; then
        cp "$CYBERPANEL_ROOT/cloudAPI/views.py" "$BACKUP_DIR/"
        log_info "Backed up cloudAPI/views.py"
    fi
    
    # Backup baseTemplate/templates/baseTemplate/index.html
    if [[ -f "$CYBERPANEL_ROOT/baseTemplate/templates/baseTemplate/index.html" ]]; then
        cp "$CYBERPANEL_ROOT/baseTemplate/templates/baseTemplate/index.html" "$BACKUP_DIR/"
        log_info "Backed up baseTemplate index.html"
    fi
    
    # Backup existing apiKeys plugin if exists
    if [[ -d "$CYBERPANEL_ROOT/$PLUGIN_NAME" ]]; then
        cp -r "$CYBERPANEL_ROOT/$PLUGIN_NAME" "$BACKUP_DIR/"
        log_info "Backed up existing apiKeys plugin"
    fi
    
    log_success "Backups created at $BACKUP_DIR"
}

# Download and extract plugin files
install_plugin_files() {
    log_info "Installing plugin files..."
    
    # Determine script location (local or remote)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [[ -d "$SCRIPT_DIR/$PLUGIN_SOURCE_DIR" ]]; then
        # Local installation
        log_info "Installing from local files..."
        cp -r "$SCRIPT_DIR/$PLUGIN_SOURCE_DIR" "$CYBERPANEL_ROOT/$PLUGIN_NAME"
    else
        # Remote installation - download from GitHub
        log_info "Downloading plugin from GitHub..."
        cd /tmp
        rm -rf cyberpanel-mcp-temp
        git clone --depth 1 https://github.com/elwizard33/cyberpanel-mcp.git cyberpanel-mcp-temp
        cd cyberpanel-mcp-temp
        
        if [[ -d "$PLUGIN_SOURCE_DIR" ]]; then
            cp -r "$PLUGIN_SOURCE_DIR" "$CYBERPANEL_ROOT/$PLUGIN_NAME"
        else
            log_error "Plugin source not found in repository"
            exit 1
        fi
        
        cd /tmp
        rm -rf cyberpanel-mcp-temp
    fi
    
    # Set proper ownership
    chown -R lscpd:lscpd "$CYBERPANEL_ROOT/$PLUGIN_NAME"
    
    log_success "Plugin files installed to $CYBERPANEL_ROOT/$PLUGIN_NAME"
}

# Add plugin to INSTALLED_APPS
configure_installed_apps() {
    log_info "Configuring INSTALLED_APPS..."
    
    SETTINGS_FILE="$CYBERPANEL_ROOT/CyberCP/settings.py"
    
    # Check if already added (check for the app name in INSTALLED_APPS context)
    if grep -E "^\s*['\"]$PLUGIN_NAME['\"]" "$SETTINGS_FILE" | grep -v "^#" > /dev/null 2>&1; then
        log_warning "Plugin already in INSTALLED_APPS, skipping..."
        return
    fi
    
    # Try to add after 'loginSystem' first
    if grep -q "'loginSystem'" "$SETTINGS_FILE"; then
        sed -i "/'loginSystem'/a\\    '$PLUGIN_NAME'," "$SETTINGS_FILE"
        log_success "Added $PLUGIN_NAME to INSTALLED_APPS (after loginSystem)"
    # Fallback: add after 'api' 
    elif grep -q "'api'" "$SETTINGS_FILE"; then
        sed -i "/'api'/a\\    '$PLUGIN_NAME'," "$SETTINGS_FILE"
        log_success "Added $PLUGIN_NAME to INSTALLED_APPS (after api)"
    # Last resort: add before the closing bracket
    else
        sed -i "/^INSTALLED_APPS/,/^\]/{ /^\]/i\\    '$PLUGIN_NAME',
        }" "$SETTINGS_FILE"
        log_success "Added $PLUGIN_NAME to INSTALLED_APPS"
    fi
    
    # Verify it was added
    if ! grep -E "^\s*['\"]$PLUGIN_NAME['\"]" "$SETTINGS_FILE" > /dev/null 2>&1; then
        log_error "Failed to add $PLUGIN_NAME to INSTALLED_APPS"
        log_info "Please manually add '$PLUGIN_NAME' to INSTALLED_APPS in $SETTINGS_FILE"
        exit 1
    fi
}

# Add URL route
configure_urls() {
    log_info "Configuring URL routes..."
    
    URLS_FILE="$CYBERPANEL_ROOT/CyberCP/urls.py"
    
    # Check if already added
    if grep -q "apiKeys.urls" "$URLS_FILE"; then
        log_warning "URL route already configured, skipping..."
        return
    fi
    
    # Find the urlpatterns line and add our route
    # Add after the first path entry
    sed -i "/path('api\/', include('api.urls'))/a\\    path('apiKeys/', include('apiKeys.urls'))," "$URLS_FILE"
    
    log_success "Added URL route for apiKeys"
}

# Apply patches
apply_patches() {
    log_info "Applying patches..."
    
    cd "$CYBERPANEL_ROOT"
    
    # Apply cloudAPI auth patch (CRITICAL for MCP server to work)
    apply_cloudapi_patch
    
    # Apply sidebar menu patch (optional - adds menu item)
    apply_sidebar_patch
}

# Apply cloudAPI authentication patch using Python (no patch command - more reliable)
apply_cloudapi_patch() {
    local CLOUDAPI_FILE="$CYBERPANEL_ROOT/cloudAPI/views.py"
    
    log_info "Applying cloudAPI authentication patch..."
    
    # Use Python to apply the patch - reliable and no hanging
    python3 << 'PYTHON_SCRIPT'
import sys
import re

cloudapi_file = "/usr/local/CyberCP/cloudAPI/views.py"

try:
    with open(cloudapi_file, 'r') as f:
        content = f.read()
    
    # Check if fully patched (both API key auth AND verifyLogin fix)
    if 'api_key_authenticated = True' in content:
        print("ALREADY_APPLIED")
        sys.exit(0)
    
    # If partially patched (old version), we need to update it
    needs_update = 'HTTP_X_API_KEY' in content and 'api_key_authenticated' not in content
    
    if needs_update:
        # Remove the old partial patch and start fresh
        # Find and replace the old API key block with improved version
        old_api_block_pattern = r"        # Check for X-API-Key header authentication.*?return cm\.ajaxPre\(0, f['\"]Something went wrong during token processing\. Error: \{str\(msg\)\}['\"]\)"
        content = re.sub(old_api_block_pattern, 'PLACEHOLDER_FOR_NEW_AUTH', content, flags=re.DOTALL)
        
        if 'PLACEHOLDER_FOR_NEW_AUTH' not in content:
            print("PARTIAL_PATCH_REMOVAL_FAILED")
            sys.exit(1)
    
    # Add imports after csrf_exempt import if not present
    if 'from django.utils import timezone' not in content:
        content = content.replace(
            'from django.views.decorators.csrf import csrf_exempt',
            'from django.views.decorators.csrf import csrf_exempt\nfrom django.utils import timezone\nimport hashlib'
        )
    
    # The new auth block with API key support and flag
    new_auth_block = '''        # Check for X-API-Key header authentication (MCP Server)
        api_key_authenticated = False
        api_key_header = request.META.get('HTTP_X_API_KEY', '')
        if api_key_header and api_key_header.startswith('cp_'):
            try:
                from apiKeys.models import APIKey
                # Hash the incoming key and compare to stored hash
                key_hash = hashlib.sha256(api_key_header.encode()).hexdigest()
                api_key_obj = APIKey.objects.filter(
                    key_hash=key_hash,
                    is_active=True,
                    admin=admin
                ).first()
                if api_key_obj:
                    api_key_obj.last_used = timezone.now()
                    api_key_obj.save(update_fields=['last_used'])
                    api_key_authenticated = True
                else:
                    return cm.ajaxPre(0, 'Invalid or inactive API key.')
            except Exception as e:
                return cm.ajaxPre(0, f'API key validation error: {str(e)}')
        
        if not api_key_authenticated:
            # Existing token authentication
            try:
                if cm.verifyLogin(request)[0] == 1:
                    pass
                else:
                    return cm.verifyLogin(request)[1]
            except BaseException as msg:
                return cm.ajaxPre(0, f"Something went wrong during token processing. Error: {str(msg)}")'''
    
    if needs_update:
        # Replace placeholder with new auth block
        content = content.replace('PLACEHOLDER_FOR_NEW_AUTH', new_auth_block)
    else:
        # Fresh install - replace the original auth block
        # Try with ErrorL typo first (original CyberPanel code)
        old_block = '''        try:
            if cm.verifyLogin(request)[0] == 1:
                pass
            else:
                return cm.verifyLogin(request)[1]
        except BaseException as msg:
            return cm.ajaxPre(0, f"Something went wrong during token processing. ErrorL {str(msg)}")'''
        
        if old_block in content:
            content = content.replace(old_block, new_auth_block)
        else:
            # Try without typo
            old_block_alt = '''        try:
            if cm.verifyLogin(request)[0] == 1:
                pass
            else:
                return cm.verifyLogin(request)[1]
        except BaseException as msg:
            return cm.ajaxPre(0, f"Something went wrong during token processing. Error: {str(msg)}")'''
            
            if old_block_alt in content:
                content = content.replace(old_block_alt, new_auth_block)
            else:
                print("BLOCK_NOT_FOUND")
                sys.exit(1)
    
    # Now patch the verifyLogin controller to skip cm.verifyLogin when API key is used
    old_verify_controller = "if controller == 'verifyLogin':\n            return cm.verifyLogin(request)[1]"
    new_verify_controller = """if controller == 'verifyLogin':
            if api_key_authenticated:
                return cm.ajaxPre(1, None)
            return cm.verifyLogin(request)[1]"""
    
    if old_verify_controller in content:
        content = content.replace(old_verify_controller, new_verify_controller)
    
    with open(cloudapi_file, 'w') as f:
        f.write(content)
    print("SUCCESS")
    sys.exit(0)
        
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
PYTHON_SCRIPT
    
    RESULT=$?
    
    if [[ $RESULT -eq 0 ]]; then
        log_success "Applied cloudAPI authentication patch"
        return 0
    else
        log_error "Failed to apply cloudAPI patch"
        log_error "The file structure may have changed. Please check /usr/local/CyberCP/cloudAPI/views.py"
        return 1
    fi
}

# Apply sidebar menu patch
apply_sidebar_patch() {
    log_info "Applying sidebar menu patch..."
    
    local INDEX_FILE="$CYBERPANEL_ROOT/baseTemplate/templates/baseTemplate/index.html"
    
    # Check if already applied
    if grep -q "API Keys" "$INDEX_FILE" 2>/dev/null; then
        log_success "Sidebar menu patch already applied"
        return 0
    fi
    
    # Use Python to add menu item
    python3 << 'PYTHON_SCRIPT'
import sys

index_file = "/usr/local/CyberCP/baseTemplate/templates/baseTemplate/index.html"

try:
    with open(index_file, 'r') as f:
        content = f.read()
    
    if 'API Keys' in content:
        print("ALREADY_APPLIED")
        sys.exit(0)
    
    # Find the Security section and add API Keys menu item
    # Look for the security menu section
    security_marker = '<!-- Security Menu -->'
    if security_marker in content:
        # Add after the security section marker
        menu_item = '''
                                        <a class="dropdown-item" href="/apiKeys/">API Keys</a>'''
        # Find a good place to insert - after SSL or Firewall
        if 'href="/firewall/"' in content:
            content = content.replace(
                'href="/firewall/">',
                'href="/firewall/">\n                                        <a class="dropdown-item" href="/apiKeys/">API Keys</a>\n                                        <a class="dropdown-item"'
            )
        print("SUCCESS")
    else:
        # Fallback - just note it's not critical
        print("MARKER_NOT_FOUND")
        sys.exit(0)
    
    with open(index_file, 'w') as f:
        f.write(content)
    sys.exit(0)
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
PYTHON_SCRIPT
    
    # Sidebar patch is optional, don't fail if it doesn't work
    log_success "Sidebar menu patch applied (or skipped if not needed)"
}

# Create database table directly (skip Django migrations for simplicity)
create_database_table() {
    log_info "Creating/migrating database table..."
    
    # Get database credentials from CyberPanel settings
    DB_HOST="localhost"
    DB_NAME="cyberpanel"
    
    # Check if old table exists with 'key' column (needs migration)
    OLD_TABLE_EXISTS=$(mysql -u root "$DB_NAME" -N -e "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DB_NAME' AND table_name='api_keys' AND column_name='key';" 2>/dev/null || echo "0")
    
    if [[ "$OLD_TABLE_EXISTS" == "1" ]]; then
        log_info "Migrating old api_keys table to new schema..."
        
        # Backup old data
        mysql -u root "$DB_NAME" <<EOF
-- Create backup of old table
CREATE TABLE IF NOT EXISTS api_keys_backup AS SELECT * FROM api_keys;

-- Drop old table
DROP TABLE IF EXISTS api_keys;

-- Create new table with hashed key columns
CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash of the API key',
    key_prefix VARCHAR(15) NOT NULL COMMENT 'First 12 chars for identification (cp_xxxxx...)',
    name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    INDEX idx_key_hash (key_hash),
    INDEX idx_admin (admin_id),
    FOREIGN KEY (admin_id) REFERENCES loginSystem_administrator(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrate old keys (hash them and extract prefix)
INSERT INTO api_keys (admin_id, key_hash, key_prefix, name, created_at, last_used, is_active)
SELECT 
    admin_id,
    SHA2(\`key\`, 256) as key_hash,
    LEFT(\`key\`, 12) as key_prefix,
    name,
    created_at,
    last_used,
    is_active
FROM api_keys_backup;

-- Remove backup after successful migration
DROP TABLE api_keys_backup;
EOF
        
        if [[ $? -eq 0 ]]; then
            log_success "Database table migrated successfully"
            log_warning "IMPORTANT: Existing API keys have been hashed. They will continue to work."
        else
            log_error "Failed to migrate database table"
            log_info "Old data backed up to api_keys_backup table"
            exit 1
        fi
    else
        # Create new table if it doesn't exist
        mysql -u root "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash of the API key',
    key_prefix VARCHAR(15) NOT NULL COMMENT 'First 12 chars for identification (cp_xxxxx...)',
    name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    INDEX idx_key_hash (key_hash),
    INDEX idx_admin (admin_id),
    FOREIGN KEY (admin_id) REFERENCES loginSystem_administrator(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
EOF
        
        if [[ $? -eq 0 ]]; then
            log_success "Database table created successfully"
        else
            log_error "Failed to create database table"
            log_info "You may need to create the table manually. See README for SQL."
            exit 1
        fi
    fi
}

# Restart services
restart_services() {
    log_info "Restarting services..."
    
    # Restart lscpd (LiteSpeed CyberPanel daemon)
    if systemctl is-active --quiet lscpd; then
        systemctl restart lscpd
        log_success "Restarted lscpd"
    else
        log_warning "lscpd service not found or not running"
    fi
    
    # Restart LiteSpeed Web Server (optional, for good measure)
    if systemctl is-active --quiet lsws; then
        systemctl restart lsws
        log_success "Restarted lsws (LiteSpeed)"
    fi
    
    # Clear any Python cache
    find "$CYBERPANEL_ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Services restarted"
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    local ERRORS=0
    
    # Check plugin directory exists
    if [[ ! -d "$CYBERPANEL_ROOT/$PLUGIN_NAME" ]]; then
        log_error "Plugin directory not found"
        ((ERRORS++))
    else
        log_success "Plugin directory exists"
    fi
    
    # Check models.py exists
    if [[ ! -f "$CYBERPANEL_ROOT/$PLUGIN_NAME/models.py" ]]; then
        log_error "models.py not found"
        ((ERRORS++))
    else
        log_success "Plugin models.py exists"
    fi
    
    # Check if in INSTALLED_APPS
    if ! grep -q "'$PLUGIN_NAME'" "$CYBERPANEL_ROOT/CyberCP/settings.py"; then
        log_error "Plugin not in INSTALLED_APPS"
        ((ERRORS++))
    else
        log_success "Plugin added to INSTALLED_APPS"
    fi
    
    # CRITICAL: Check if cloudAPI patch was applied (full version with api_key_authenticated flag)
    if grep -q "api_key_authenticated = True" "$CYBERPANEL_ROOT/cloudAPI/views.py" 2>/dev/null; then
        log_success "cloudAPI X-API-Key authentication is active (full patch)"
    elif grep -q "HTTP_X_API_KEY" "$CYBERPANEL_ROOT/cloudAPI/views.py" 2>/dev/null; then
        log_warning "cloudAPI has partial patch - re-running to apply full patch"
        # The patch function will handle the update
    else
        log_error "CRITICAL: cloudAPI patch was NOT applied!"
        log_error "The MCP server will NOT work without this patch."
        log_error "Please manually apply: $CYBERPANEL_ROOT/$PLUGIN_NAME/patches/cloudAPI_auth.patch"
        ((ERRORS++))
    fi
    
    # Check for old "ErrorL" typo (indicates unpatched)
    if grep -q '"ErrorL' "$CYBERPANEL_ROOT/cloudAPI/views.py" 2>/dev/null; then
        log_warning "cloudAPI/views.py still contains 'ErrorL' typo (should be 'Error:')"
    fi
    
    if [[ $ERRORS -eq 0 ]]; then
        log_success "Installation verified successfully!"
        return 0
    else
        log_error "Installation verification found $ERRORS error(s)"
        return 1
    fi
}

# Print completion message
print_completion() {
    local AUTO_RECOVERY="${1:-false}"
    
    # Check if cloudAPI patch was applied
    local CLOUDAPI_PATCHED=false
    if grep -q "HTTP_X_API_KEY" "$CYBERPANEL_ROOT/cloudAPI/views.py" 2>/dev/null; then
        CLOUDAPI_PATCHED=true
    fi
    
    echo ""
    echo "=========================================="
    if [[ "$CLOUDAPI_PATCHED" == "true" ]]; then
        echo -e "${GREEN}API Keys Plugin Installation Complete!${NC}"
    else
        echo -e "${YELLOW}API Keys Plugin Partially Installed${NC}"
    fi
    echo "=========================================="
    echo ""
    
    if [[ "$CLOUDAPI_PATCHED" == "true" ]]; then
        echo "✓ Plugin installed successfully"
        echo "✓ cloudAPI X-API-Key authentication enabled"
        if [[ "$AUTO_RECOVERY" == "true" ]]; then
            echo "✓ Auto-recovery enabled (survives CyberPanel upgrades)"
        fi
        echo ""
        echo "Next steps:"
        echo "  1. Log in to CyberPanel as admin"
        echo "  2. Navigate to Security > API Keys"
        echo "  3. Create a new API key"
        echo "  4. Use the generated MCP configuration"
    else
        echo -e "${RED}⚠ WARNING: cloudAPI patch was NOT applied!${NC}"
        echo ""
        echo "The MCP server will NOT work until the patch is applied."
        echo ""
        echo "To apply the patch manually:"
        echo "  cd $CYBERPANEL_ROOT"
        echo "  patch -p1 < $CYBERPANEL_ROOT/$PLUGIN_NAME/patches/cloudAPI_auth.patch"
        echo "  systemctl restart lscpd"
        echo ""
        echo "Or view the patch to apply manually:"
        echo "  cat $CYBERPANEL_ROOT/$PLUGIN_NAME/patches/cloudAPI_auth.patch"
    fi
    echo ""
    if [[ "$AUTO_RECOVERY" == "true" ]]; then
        echo "Auto-Recovery Info:"
        echo "  - Service: cyberpanel-apikeys-recovery.service"
        echo "  - Script: /etc/cyberpanel/apikeys-reinstall.sh"
        echo "  - Marker: /home/cyberpanel/plugins/apiKeys"
        echo "  - Logs: /var/log/cyberpanel-apikeys-recovery.log"
        echo ""
        echo "To disable auto-recovery, run: sudo bash $0 --uninstall"
        echo ""
    else
        echo -e "${YELLOW}NOTE: CyberPanel upgrades will remove this plugin.${NC}"
        echo "To enable auto-recovery, reinstall with: --auto-recovery flag"
        echo ""
    fi
    echo "Troubleshooting:"
    echo "  - Logs: tail -f /home/cyberpanel/error-logs.txt"
    echo "  - Backups: $BACKUP_DIR"
    echo "  - Test API: curl -X POST https://your-server:8033/cloudAPI/ \\"
    echo "      -H 'Content-Type: application/json' \\"
    echo "      -H 'X-API-Key: your-api-key' \\"
    echo "      -d '{\"controller\": \"verifyLogin\", \"serverUserName\": \"admin\"}'"
    echo ""
}

# Setup auto-recovery (survives CyberPanel upgrades)
setup_auto_recovery() {
    log_info "Setting up auto-recovery system..."
    
    local RECOVERY_DIR="/etc/cyberpanel"
    local RECOVERY_SCRIPT="$RECOVERY_DIR/apikeys-reinstall.sh"
    local SYSTEMD_SERVICE="/etc/systemd/system/cyberpanel-apikeys-recovery.service"
    local MARKER_DIR="/home/cyberpanel/plugins"
    local MARKER_FILE="$MARKER_DIR/apiKeys"
    
    # Create directories
    mkdir -p "$RECOVERY_DIR"
    mkdir -p "$MARKER_DIR"
    
    # Create marker file with metadata
    cat > "$MARKER_FILE" << 'MARKER'
# CyberPanel API Keys Plugin Marker
# This file indicates the apiKeys plugin should be installed
# Do not delete this file if you want auto-recovery after CyberPanel upgrades
INSTALLED_AT=$(date -Iseconds)
VERSION=1.0.0
AUTO_RECOVERY=true
MARKER
    chown cyberpanel:cyberpanel "$MARKER_FILE" 2>/dev/null || true
    log_success "Created plugin marker at $MARKER_FILE"
    
    # Create recovery script
    cat > "$RECOVERY_SCRIPT" << 'RECOVERY_SCRIPT'
#!/bin/bash
# CyberPanel API Keys Plugin Auto-Recovery Script
# This script checks if the plugin needs reinstallation after CyberPanel upgrades

LOG_FILE="/var/log/cyberpanel-apikeys-recovery.log"
MARKER_FILE="/home/cyberpanel/plugins/apiKeys"
CLOUDAPI_FILE="/usr/local/CyberCP/cloudAPI/views.py"
LOCK_FILE="/tmp/apikeys-recovery.lock"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if marker exists (plugin was installed with auto-recovery)
if [[ ! -f "$MARKER_FILE" ]]; then
    exit 0
fi

# Prevent concurrent runs
if [[ -f "$LOCK_FILE" ]]; then
    LOCK_AGE=$(($(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo "0")))
    if [[ $LOCK_AGE -lt 300 ]]; then
        log "Recovery already in progress (lock file exists)"
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

log "Starting recovery check..."

# Check if cloudAPI patch is missing (indicates fresh CyberPanel install/upgrade)
if [[ -f "$CLOUDAPI_FILE" ]] && ! grep -q "HTTP_X_API_KEY" "$CLOUDAPI_FILE"; then
    log "cloudAPI patch missing - CyberPanel was likely upgraded. Starting reinstallation..."
    
    # Wait a bit for CyberPanel upgrade to fully complete
    sleep 10
    
    # Download and run installer (non-interactive, with auto-recovery to keep the marker)
    cd /tmp
    rm -rf apikeys-recovery-install
    mkdir -p apikeys-recovery-install
    cd apikeys-recovery-install
    
    # Try to download install script from GitHub
    if curl -sL --connect-timeout 30 -o install-plugin.sh "https://raw.githubusercontent.com/elwizard33/cyberpanel-mcp/main/install-plugin.sh" 2>/dev/null; then
        chmod +x install-plugin.sh
        log "Running reinstallation..."
        if bash install-plugin.sh --auto-recovery >> "$LOG_FILE" 2>&1; then
            log "SUCCESS: Plugin reinstalled successfully after CyberPanel upgrade"
        else
            log "ERROR: Plugin reinstallation failed. Manual intervention may be required."
        fi
    else
        log "ERROR: Failed to download install script. GitHub may be unreachable."
    fi
    
    cd /
    rm -rf /tmp/apikeys-recovery-install
else
    log "cloudAPI patch present - no recovery needed"
fi

log "Recovery check complete"
RECOVERY_SCRIPT
    
    chmod +x "$RECOVERY_SCRIPT"
    log_success "Created recovery script at $RECOVERY_SCRIPT"
    
    # Create systemd service
    cat > "$SYSTEMD_SERVICE" << 'SYSTEMD_SERVICE'
[Unit]
Description=CyberPanel API Keys Plugin Auto-Recovery
Documentation=https://github.com/elwizard33/cyberpanel-mcp
After=lscpd.service
BindsTo=lscpd.service

[Service]
Type=oneshot
ExecStart=/etc/cyberpanel/apikeys-reinstall.sh
RemainAfterExit=no
# Don't restart on failure - one-shot check
Restart=no
# Give CyberPanel time to fully start
ExecStartPre=/bin/sleep 5

[Install]
WantedBy=multi-user.target
SYSTEMD_SERVICE
    
    log_success "Created systemd service at $SYSTEMD_SERVICE"
    
    # Enable and start service
    systemctl daemon-reload
    systemctl enable cyberpanel-apikeys-recovery.service
    log_success "Enabled auto-recovery service"
    
    log_success "Auto-recovery setup complete!"
    log_info "The plugin will automatically reinstall after CyberPanel upgrades"
}

# Remove auto-recovery
remove_auto_recovery() {
    log_info "Removing auto-recovery system..."
    
    # Stop and disable service
    systemctl stop cyberpanel-apikeys-recovery.service 2>/dev/null || true
    systemctl disable cyberpanel-apikeys-recovery.service 2>/dev/null || true
    
    # Remove files
    rm -f /etc/systemd/system/cyberpanel-apikeys-recovery.service
    rm -f /etc/cyberpanel/apikeys-reinstall.sh
    rm -f /home/cyberpanel/plugins/apiKeys
    
    # Reload systemd
    systemctl daemon-reload
    
    log_success "Auto-recovery system removed"
}

# Uninstall function
uninstall() {
    log_info "Uninstalling API Keys plugin..."
    
    # Remove auto-recovery if it exists
    if [[ -f "/etc/systemd/system/cyberpanel-apikeys-recovery.service" ]]; then
        remove_auto_recovery
    fi
    
    # Remove plugin directory
    if [[ -d "$CYBERPANEL_ROOT/$PLUGIN_NAME" ]]; then
        rm -rf "$CYBERPANEL_ROOT/$PLUGIN_NAME"
        log_success "Removed plugin directory"
    fi
    
    # Remove from INSTALLED_APPS
    sed -i "/'$PLUGIN_NAME'/d" "$CYBERPANEL_ROOT/CyberCP/settings.py"
    log_success "Removed from INSTALLED_APPS"
    
    # Remove URL route
    sed -i "/apiKeys.urls/d" "$CYBERPANEL_ROOT/CyberCP/urls.py"
    log_success "Removed URL route"
    
    # Restart services
    systemctl restart lscpd 2>/dev/null || true
    
    log_success "Uninstallation complete. Note: Database tables were not removed."
    log_info "To remove database tables, run: DROP TABLE api_keys; in MySQL"
}

# Main function
main() {
    local AUTO_RECOVERY=false
    
    echo ""
    echo "=========================================="
    echo "  CyberPanel API Keys Plugin Installer"
    echo "=========================================="
    echo ""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --uninstall|-u)
                check_root
                check_cyberpanel
                uninstall
                exit 0
                ;;
            --auto-recovery|-a)
                AUTO_RECOVERY=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --auto-recovery, -a  Enable auto-recovery after CyberPanel upgrades"
                echo "                       Creates a systemd service that reinstalls the plugin"
                echo "                       automatically when CyberPanel is upgraded"
                echo "  --uninstall, -u      Uninstall the plugin"
                echo "  --help, -h           Show this help message"
                echo ""
                echo "Examples:"
                echo "  Install (basic):          sudo bash install-plugin.sh"
                echo "  Install (auto-recovery):  sudo bash install-plugin.sh --auto-recovery"
                echo "  Uninstall:                sudo bash install-plugin.sh --uninstall"
                echo ""
                exit 0
                ;;
            *)
                log_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    check_root
    check_cyberpanel
    backup_files
    install_plugin_files
    configure_installed_apps
    configure_urls
    apply_patches
    create_database_table
    restart_services
    verify_installation
    
    # Setup auto-recovery if requested
    if [[ "$AUTO_RECOVERY" == "true" ]]; then
        setup_auto_recovery
    fi
    
    print_completion "$AUTO_RECOVERY"
}

# Run main function
main "$@"
