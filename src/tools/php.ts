/**
 * CyberPanel MCP Server - PHP Management Tools
 * 
 * Comprehensive tools for managing PHP versions and configuration in CyberPanel.
 * PHP is managed by LiteSpeed. Multiple versions can be installed simultaneously.
 * 
 * Controllers from cloudAPI/views.py:
 * - changePHP (line 214): Change PHP version for a website
 * - submitChangePHP (line 396): Submit PHP version change
 * - getCurrentPHPConfig (line 404): Get PHP configuration
 * - savePHPConfigBasic (line 406): Save basic PHP config
 * - fetchPHPSettingsAdvance (line 408): Get advanced PHP settings (raw config file)
 * - savePHPConfigAdvance (line 410): Save advanced PHP config
 * - fetchPHPExtensions (line 412): List PHP extensions
 * - submitExtensionRequest (line 414): Install/uninstall PHP extensions
 * 
 * Supported PHP versions: 5.4, 5.5, 5.6, 7.0, 7.1, 7.2, 7.3, 7.4, 8.0, 8.1, 8.2, 8.3
 * 
 * @module cyberpanel-mcp/tools/php
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register PHP management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerPhpTools(server: McpServer, client: CyberPanelClient): void {
  
  // Change PHP version for a website
  server.tool(
    'change_php_version',
    'Change the PHP version for a website or child domain',
    {
      childDomain: z.string().describe('Domain name to change PHP version for'),
      phpSelection: z.string().describe('PHP version (e.g., "PHP 8.1", "PHP 7.4", "PHP 8.2")'),
    },
    async (params) => {
      const result = await client.call('changePHP', {
        childDomain: params.childDomain,
        phpSelection: params.phpSelection,
      });
      
      if (result.status === 0 || result.changePHP === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error changing PHP version: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `PHP version changed to ${params.phpSelection} for ${params.childDomain}.` }],
      };
    }
  );

  // Submit PHP version change (async operation)
  server.tool(
    'submit_php_change',
    'Submit a PHP version change request (async operation with background processing)',
    {
      childDomain: z.string().describe('Domain name to change PHP version for'),
      phpSelection: z.string().describe('PHP version (e.g., "PHP 8.1", "PHP 7.4")'),
    },
    async (params) => {
      const result = await client.call('submitChangePHP', {
        childDomain: params.childDomain,
        phpSelection: params.phpSelection,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error submitting PHP change: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `PHP version change submitted for ${params.childDomain} to ${params.phpSelection}.\n\nThis is processed in the background.`
        }],
      };
    }
  );

  // Get current PHP configuration
  server.tool(
    'get_php_config',
    'Get the current PHP configuration settings for a specific PHP version',
    {
      phpSelection: z.string().describe('PHP version to get config for (e.g., "PHP 7.4", "PHP 8.1")'),
    },
    async ({ phpSelection }) => {
      const result = await client.call('getCurrentPHPConfig', { phpSelection });
      
      if (result.status === 0 || result.fetchStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching PHP config: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `PHP ${phpSelection} Configuration:\n\n` +
            `- memory_limit: ${result.memory_limit}\n` +
            `- max_execution_time: ${result.max_execution_time}\n` +
            `- upload_max_filesize: ${result.upload_max_filesize}\n` +
            `- max_input_time: ${result.max_input_time}\n` +
            `- post_max_size: ${result.post_max_size}\n` +
            `- allow_url_fopen: ${result.allow_url_fopen === '1' ? 'On' : 'Off'}\n` +
            `- display_errors: ${result.display_errors === '1' ? 'On' : 'Off'}\n` +
            `- file_uploads: ${result.file_uploads === '1' ? 'On' : 'Off'}\n` +
            `- allow_url_include: ${result.allow_url_include === '1' ? 'On' : 'Off'}`
        }],
      };
    }
  );

  // Save basic PHP configuration
  server.tool(
    'save_php_config_basic',
    'Save basic PHP configuration settings for a specific PHP version',
    {
      phpSelection: z.string().describe('PHP version to configure (e.g., "PHP 7.4", "PHP 8.1")'),
      allow_url_fopen: z.boolean().default(false).describe('Allow URL fopen'),
      display_errors: z.boolean().default(false).describe('Display errors'),
      file_uploads: z.boolean().default(true).describe('Allow file uploads'),
      allow_url_include: z.boolean().default(false).describe('Allow URL include'),
      memory_limit: z.string().default('256M').describe('Memory limit (e.g., "256M", "512M")'),
      max_execution_time: z.string().default('30').describe('Max execution time in seconds'),
      upload_max_filesize: z.string().default('20M').describe('Max upload file size'),
      max_input_time: z.string().default('60').describe('Max input time in seconds'),
      post_max_size: z.string().default('25M').describe('Max POST size'),
    },
    async (params) => {
      const result = await client.call('savePHPConfigBasic', {
        phpSelection: params.phpSelection,
        allow_url_fopen: params.allow_url_fopen,
        display_errors: params.display_errors,
        file_uploads: params.file_uploads,
        allow_url_include: params.allow_url_include,
        memory_limit: params.memory_limit,
        max_execution_time: params.max_execution_time,
        upload_max_filesize: params.upload_max_filesize,
        max_input_time: params.max_input_time,
        post_max_size: params.post_max_size,
      });
      
      if (result.status === 0 || result.saveStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error saving PHP config: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `PHP configuration saved successfully for ${params.phpSelection}.` }],
      };
    }
  );

  // Get advanced PHP settings (raw config file)
  server.tool(
    'get_php_settings_advanced',
    'Get advanced PHP settings - returns the raw PHP-FPM configuration file content',
    {
      phpSelection: z.string().describe('PHP version to get advanced config for (e.g., "PHP 7.4", "PHP 8.1")'),
    },
    async ({ phpSelection }) => {
      const result = await client.call('fetchPHPSettingsAdvance', { phpSelection });
      
      if (result.status === 0 || result.fetchStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching advanced PHP settings: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Advanced PHP Configuration for ${phpSelection}:\n\n${result.configData}`
        }],
      };
    }
  );

  // Save advanced PHP configuration
  server.tool(
    'save_php_config_advanced',
    'Save advanced PHP configuration - accepts raw PHP-FPM config file content',
    {
      phpVersion: z.string().describe('PHP version to configure (e.g., "PHP 7.4", "PHP 8.1")'),
      configData: z.string().describe('Raw PHP-FPM configuration file content'),
    },
    async (params) => {
      const result = await client.call('savePHPConfigAdvance', {
        phpVersion: params.phpVersion,
        configData: params.configData,
      });
      
      if (result.status === 0 || result.saveStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error saving advanced PHP config: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Advanced PHP configuration saved successfully for ${params.phpVersion}. PHP-FPM has been restarted.`
        }],
      };
    }
  );

  // List PHP extensions
  server.tool(
    'get_php_extensions',
    'List available PHP extensions and their installation status',
    {
      phpVersion: z.string().describe('PHP version to list extensions for (e.g., "PHP 7.4", "PHP 8.1")'),
    },
    async ({ phpVersion }) => {
      const result = await client.call('fetchPHPExtensions', { phpVersion });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching PHP extensions: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the extensions data if it's a JSON string
      let extensions = result.data;
      if (typeof extensions === 'string') {
        try {
          extensions = JSON.parse(extensions);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      return {
        content: [{ type: 'text' as const, text: `PHP Extensions for ${phpVersion}:\n\n${JSON.stringify(extensions, null, 2)}` }],
      };
    }
  );

  // Install PHP extension
  server.tool(
    'install_php_extension',
    'Install a PHP extension',
    {
      extensionName: z.string().describe('Extension name to install (e.g., "php74-php-redis", "php81-php-imagick")'),
    },
    async ({ extensionName }) => {
      const result = await client.call('submitExtensionRequest', {
        extensionName,
        type: 'install',
      });
      
      if (result.status === 0 || result.extensionRequestStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error installing extension: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `PHP extension installation started for ${extensionName}.\n\nThis is processed in the background. Use get_extension_status to check progress.`
        }],
      };
    }
  );

  // Uninstall PHP extension
  server.tool(
    'uninstall_php_extension',
    'Uninstall a PHP extension',
    {
      extensionName: z.string().describe('Extension name to uninstall (e.g., "php74-php-redis", "php81-php-imagick")'),
    },
    async ({ extensionName }) => {
      const result = await client.call('submitExtensionRequest', {
        extensionName,
        type: 'uninstall',
      });
      
      if (result.status === 0 || result.extensionRequestStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error uninstalling extension: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `PHP extension uninstallation started for ${extensionName}.\n\nThis is processed in the background.`
        }],
      };
    }
  );

  // Get extension request status
  server.tool(
    'get_extension_status',
    'Get the status of a PHP extension installation/uninstallation request',
    {
      extensionName: z.string().describe('Extension name to check status for'),
      size: z.number().default(0).describe('Previous response size (for incremental updates)'),
    },
    async (params) => {
      const result = await client.call('getRequestStatus', {
        extensionName: params.extensionName,
        size: params.size,
      });
      
      if (result.status === 0 || result.extensionRequestStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error getting extension status: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      const finished = result.finished === 1 ? 'Yes' : 'No';
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Extension Request Status for ${params.extensionName}:\n\n` +
            `- Finished: ${finished}\n` +
            `- Output Size: ${result.size}\n\n` +
            `Log Output:\n${result.requestStatus || 'No output yet'}`
        }],
      };
    }
  );
}
