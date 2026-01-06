/**
 * CyberPanel MCP Server - WordPress Management Tools
 * 
 * Comprehensive tools for managing WordPress installations in CyberPanel.
 * WordPress installation uses WP-CLI internally for all operations.
 * 
 * Controllers from cloudAPI/views.py:
 * - DeployWordPress (line 106): Install WordPress on a website
 * - FetchWordPressDetails (line 108): Get WordPress site details
 * - AutoLogin (line 110): Auto-login to WordPress admin
 * - DeletePlugins (line 112): Delete WordPress plugins
 * - GetCurrentThemes (line 114): List installed themes
 * - UpdateThemes (line 116): Update WordPress themes
 * - ChangeStateThemes (line 118): Activate/deactivate themes
 * - DeleteThemes (line 120): Delete WordPress themes
 * - UpdateWPSettings (line 130): Update WP settings (LSCache, debug, etc.)
 * - GetCurrentPlugins (line 132): List installed plugins
 * - UpdatePlugins (line 134): Update WordPress plugins
 * - ChangeState (line 136): Activate/deactivate plugins
 * - saveWPSettings (line 138): Save WP settings
 * - WPScan (line 140): Verify WordPress installation
 * - CreateStaging (line 284): Create staging environment
 * - startSync (line 286): Sync staging to production
 * - SaveAutoUpdateSettings (line 288): Configure auto-updates
 * - fetchWPSettings (line 290): Fetch WP CLI settings
 * - updateWPCLI (line 292): Update WP-CLI
 * 
 * @module cyberpanel-mcp/tools/wordpress
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register WordPress management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerWordPressTools(server: McpServer, client: CyberPanelClient): void {
  
  // Install WordPress on a website
  server.tool(
    'install_wordpress',
    'Install WordPress on a website domain. Returns tempStatusPath for monitoring progress.',
    {
      domain: z.string().describe('Domain name to install WordPress on'),
      title: z.string().describe('WordPress site title'),
      userName: z.string().describe('WordPress admin username'),
      passwordByPass: z.string().describe('WordPress admin password'),
      email: z.string().email().describe('WordPress admin email'),
      version: z.string().default('latest').describe('WordPress version (e.g., "latest", "6.4")'),
      path: z.string().default('').describe('Subdirectory path (empty for root)'),
      appsSet: z.string().default('starter').describe('Application set (starter/business/developer)'),
      updates: z.enum(['on', 'off']).default('on').describe('Enable WordPress auto-updates'),
      pluginUpdates: z.enum(['on', 'off']).default('on').describe('Enable plugin auto-updates'),
      themeUpdates: z.enum(['on', 'off']).default('on').describe('Enable theme auto-updates'),
      createSite: z.boolean().default(false).describe('Create website if it doesn\'t exist'),
    },
    async (params) => {
      const result = await client.call('DeployWordPress', {
        domain: params.domain,
        title: params.title,
        userName: params.userName,
        passwordByPass: params.passwordByPass,
        email: params.email,
        version: params.version,
        path: params.path,
        appsSet: params.appsSet,
        updates: params.updates,
        pluginUpdates: params.pluginUpdates,
        themeUpdates: params.themeUpdates,
        createSite: params.createSite ? 1 : 0,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error installing WordPress: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress installation started for ${params.domain}.\n\nTitle: ${params.title}\nAdmin: ${params.userName}\nEmail: ${params.email}\n\nStatus Path: ${result.tempStatusPath}\n\nMonitor installation progress using the status path.` 
        }],
      };
    }
  );

  // Get WordPress site details
  server.tool(
    'get_wordpress_details',
    'Get details about a WordPress installation including version, LSCache status, and debug mode',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
    },
    async ({ domain }) => {
      const result = await client.call('FetchWordPressDetails', { domain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching WordPress details: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress Details for ${domain}:\n\n` +
            `- WordPress Version: ${result.version || 'Unknown'}\n` +
            `- PHP Version: ${result.php || 'Unknown'}\n` +
            `- LSCache: ${result.lscache === 1 ? 'Active' : 'Inactive'}\n` +
            `- Debug Mode: ${result.debugging === 1 ? 'Enabled' : 'Disabled'}\n` +
            `- Maintenance Mode: ${result.maintenanceMode === 1 ? 'On' : 'Off'}`
        }],
      };
    }
  );

  // Create staging environment
  server.tool(
    'create_wordpress_staging',
    'Create a staging copy of a WordPress site for testing',
    {
      masterDomain: z.string().describe('Source domain (production site)'),
      domainName: z.string().describe('Staging domain name'),
    },
    async (params) => {
      const result = await client.call('CreateStaging', {
        masterDomain: params.masterDomain,
        domainName: params.domainName,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating staging: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Staging environment creation started.\n\nSource: ${params.masterDomain}\nStaging: ${params.domainName}\n\nStatus Path: ${result.tempStatusPath}\n\nThe staging site will be a complete clone including files and database.` 
        }],
      };
    }
  );

  // Auto-login to WordPress admin
  server.tool(
    'wordpress_auto_login',
    'Generate auto-login credentials for WordPress admin panel. Creates a temporary admin user.',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
    },
    async ({ domain }) => {
      const result = await client.call('AutoLogin', { domain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error generating auto-login: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress Auto-Login for ${domain}:\n\n` +
            `Username: cyberpanel\n` +
            `Password: ${result.password}\n\n` +
            `Login URL: https://${domain}/wp-admin\n\n` +
            `Note: This creates/updates a temporary admin user named "cyberpanel".`
        }],
      };
    }
  );

  // Get current plugins
  server.tool(
    'get_wordpress_plugins',
    'List all installed WordPress plugins with their status',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
    },
    async ({ domain }) => {
      const result = await client.call('GetCurrentPlugins', { domain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching plugins: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress Plugins for ${domain}:\n\n${result.data}`
        }],
      };
    }
  );

  // Update plugins
  server.tool(
    'update_wordpress_plugins',
    'Update WordPress plugins (all, selected, or single plugin)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Plugin slug to update, "all" for all plugins, or "selected" for specific list'),
      plugins: z.array(z.string()).optional().describe('Array of plugin slugs when using "selected" mode'),
      allPluginsChecked: z.boolean().optional().describe('If true with "selected", updates all plugins'),
    },
    async (params) => {
      const result = await client.call('UpdatePlugins', {
        domain: params.domain,
        plugin: params.plugin,
        plugins: params.plugins || [],
        allPluginsChecked: params.allPluginsChecked || false,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error updating plugins: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || 'Plugin updates started in the background.')
        }],
      };
    }
  );

  // Change plugin state (activate/deactivate)
  server.tool(
    'toggle_wordpress_plugin',
    'Activate or deactivate a WordPress plugin (toggles current state)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Plugin slug to toggle'),
    },
    async (params) => {
      const result = await client.call('ChangeState', {
        domain: params.domain,
        plugin: params.plugin,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error toggling plugin: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || `Plugin ${params.plugin} state toggled successfully.`)
        }],
      };
    }
  );

  // Delete plugins
  server.tool(
    'delete_wordpress_plugins',
    'Delete WordPress plugins (single or multiple)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Plugin slug to delete, or "selected" for multiple plugins'),
      plugins: z.array(z.string()).optional().describe('Array of plugin slugs when using "selected" mode'),
    },
    async (params) => {
      const result = await client.call('DeletePlugins', {
        domain: params.domain,
        plugin: params.plugin,
        plugins: params.plugins || [],
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting plugins: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || 'Plugin deletion started in the background.')
        }],
      };
    }
  );

  // Get current themes
  server.tool(
    'get_wordpress_themes',
    'List all installed WordPress themes with their status',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
    },
    async ({ domain }) => {
      const result = await client.call('GetCurrentThemes', { domain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching themes: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress Themes for ${domain}:\n\n${result.data}`
        }],
      };
    }
  );

  // Update themes
  server.tool(
    'update_wordpress_themes',
    'Update WordPress themes (all, selected, or single theme)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Theme slug to update, "all" for all themes, or "selected" for specific list'),
      plugins: z.array(z.string()).optional().describe('Array of theme slugs when using "selected" mode'),
      allPluginsChecked: z.boolean().optional().describe('If true with "selected", updates all themes'),
    },
    async (params) => {
      const result = await client.call('UpdateThemes', {
        domain: params.domain,
        plugin: params.plugin,
        plugins: params.plugins || [],
        allPluginsChecked: params.allPluginsChecked || false,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error updating themes: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || 'Theme updates started in the background.')
        }],
      };
    }
  );

  // Change theme state (activate/deactivate)
  server.tool(
    'toggle_wordpress_theme',
    'Activate or deactivate a WordPress theme (toggles current state)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Theme slug to toggle'),
    },
    async (params) => {
      const result = await client.call('ChangeStateThemes', {
        domain: params.domain,
        plugin: params.plugin,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error toggling theme: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || `Theme ${params.plugin} state toggled successfully.`)
        }],
      };
    }
  );

  // Delete themes
  server.tool(
    'delete_wordpress_themes',
    'Delete WordPress themes (single or multiple)',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      plugin: z.string().describe('Theme slug to delete, or "selected" for multiple themes'),
      plugins: z.array(z.string()).optional().describe('Array of theme slugs when using "selected" mode'),
    },
    async (params) => {
      const result = await client.call('DeleteThemes', {
        domain: params.domain,
        plugin: params.plugin,
        plugins: params.plugins || [],
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting themes: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || 'Theme deletion started in the background.')
        }],
      };
    }
  );

  // Update WordPress settings
  server.tool(
    'update_wordpress_settings',
    'Update WordPress settings like LSCache, debug mode, search indexing, or maintenance mode',
    {
      domain: z.string().describe('Domain name of the WordPress site'),
      setting: z.enum(['lscache', 'debugging', 'searchIndex', 'maintenanceMode']).describe('Setting to update'),
      settingValue: z.boolean().describe('Enable (true) or disable (false) the setting'),
    },
    async (params) => {
      const result = await client.call('UpdateWPSettings', {
        domain: params.domain,
        setting: params.setting,
        settingValue: params.settingValue,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error updating setting: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: String(result.message || `Setting ${params.setting} updated successfully.`)
        }],
      };
    }
  );

  // WordPress scan (verify installation)
  server.tool(
    'verify_wordpress_installation',
    'Verify that a domain has a valid WordPress installation',
    {
      domainName: z.string().describe('Domain name to scan for WordPress'),
    },
    async ({ domainName }) => {
      const result = await client.call('WPScan', { domainName });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `WordPress verification failed: ${result.error_message || 'Not a valid WordPress installation'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `✓ WordPress installation verified for ${domainName}`
        }],
      };
    }
  );

  // Sync staging to production
  server.tool(
    'sync_wordpress_staging',
    'Sync changes from staging environment to production',
    {
      masterDomain: z.string().describe('Production domain to sync to'),
      stagingDomain: z.string().describe('Staging domain to sync from'),
    },
    async (params) => {
      const result = await client.call('startSync', {
        masterDomain: params.masterDomain,
        domainName: params.stagingDomain,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error syncing staging: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Staging sync started.\n\nSource: ${params.stagingDomain}\nTarget: ${params.masterDomain}\n\nStatus Path: ${result.tempStatusPath || 'Monitor progress in CyberPanel'}`
        }],
      };
    }
  );

  // Save auto-update settings
  server.tool(
    'save_wordpress_auto_updates',
    'Configure WordPress auto-update settings for core, plugins, and themes',
    {
      domainName: z.string().describe('Domain name of the WordPress site'),
      wpCore: z.enum(['Disabled', 'Minor and Security Updates', 'All Updates']).describe('WordPress core auto-update setting'),
      plugins: z.enum(['on', 'off']).describe('Enable/disable plugin auto-updates'),
      themes: z.enum(['on', 'off']).describe('Enable/disable theme auto-updates'),
    },
    async (params) => {
      const result = await client.call('SaveAutoUpdateSettings', {
        domainName: params.domainName,
        domain: params.domainName,
        wpCore: params.wpCore,
        plugins: params.plugins,
        themes: params.themes,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error saving auto-update settings: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Auto-update settings saved for ${params.domainName}:\n\n` +
            `- WordPress Core: ${params.wpCore}\n` +
            `- Plugins: ${params.plugins}\n` +
            `- Themes: ${params.themes}`
        }],
      };
    }
  );

  // Fetch WP-CLI settings
  server.tool(
    'get_wpcli_settings',
    'Get WP-CLI version and auto-update cron configuration',
    {},
    async () => {
      const result = await client.call('fetchWPSettings', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching WP-CLI settings: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WP-CLI Settings:\n\n` +
            `- CLI Version: ${result.cliVersion}\n` +
            `- Auto-Update Cron: ${result.finalCron}`
        }],
      };
    }
  );

  // Update WP-CLI
  server.tool(
    'update_wpcli',
    'Update WP-CLI to the latest version',
    {},
    async () => {
      const result = await client.call('updateWPCLI', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error updating WP-CLI: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WP-CLI updated successfully to the latest version.`
        }],
      };
    }
  );

  // Save WP settings (same as updateWPCLI in current implementation)
  server.tool(
    'save_wp_settings',
    'Save WordPress global settings',
    {},
    async () => {
      const result = await client.call('saveWPSettings', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error saving WP settings: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `WordPress settings saved successfully.`
        }],
      };
    }
  );
}
