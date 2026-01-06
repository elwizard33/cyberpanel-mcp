/**
 * CyberPanel MCP Server - Website Management Tools
 * 
 * Tools for managing websites/domains in CyberPanel.
 * 
 * Controllers from cloudAPI/views.py:
 * - fetchWebsites: List websites (uses WebsiteManager.getFurtherAccounts)
 * - submitWebsiteCreation: Create new website
 * - submitWebsiteDeletion: Delete website
 * - submitWebsiteStatus: Suspend/unsuspend website
 * 
 * @module cyberpanel-mcp/tools/websites
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register website management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerWebsiteTools(server: McpServer, client: CyberPanelClient): void {
  
  /**
   * List all websites on the server
   * Controller: fetchWebsites
   * Required params: page (default 1)
   */
  server.tool(
    'list_websites',
    'List all websites/domains on the CyberPanel server',
    {
      page: z.number().int().min(1).default(1).describe('Page number for pagination'),
    },
    async ({ page }) => {
      const result = await client.call('fetchWebsites', { page });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error listing websites: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      // Parse the websites data if it's a JSON string
      let websites = result.data;
      if (typeof websites === 'string') {
        try {
          websites = JSON.parse(websites);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format websites for display
      let websitesText = '';
      if (Array.isArray(websites) && websites.length > 0) {
        websitesText = websites.map((w: any, i: number) => 
          `${i + 1}. ${w.domain || 'N/A'} (${w.admin || 'N/A'}) - ${w.package || 'N/A'}, ${w.state || 'N/A'}, Disk: ${w.diskUsed || 'N/A'}`
        ).join('\n');
      } else {
        websitesText = 'No websites found';
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Websites (page ${page}):\n\n${websitesText}` 
        }],
      };
    }
  );

  /**
   * Create a new website
   * Controller: submitWebsiteCreation
   * Required params: domainName, adminEmail, phpSelection, package, websiteOwner
   */
  server.tool(
    'create_website',
    'Create a new website/domain on CyberPanel',
    {
      domainName: z.string().describe('Domain name for the website (e.g., example.com)'),
      adminEmail: z.string().email().describe('Admin email address for the website'),
      package: z.string().describe('Hosting package name to use'),
      websiteOwner: z.string().describe('Username of the website owner'),
      phpSelection: z.string().default('PHP 8.1').describe('PHP version (e.g., PHP 7.4, PHP 8.0, PHP 8.1, PHP 8.2)'),
      ssl: z.boolean().default(true).describe('Enable SSL certificate'),
      dkim: z.boolean().default(false).describe('Enable DKIM for email'),
      openBasedir: z.boolean().default(true).describe('Enable open_basedir protection'),
    },
    async (params) => {
      const result = await client.call('submitWebsiteCreation', {
        domainName: params.domainName,
        adminEmail: params.adminEmail,
        phpSelection: params.phpSelection,
        package: params.package,
        websiteOwner: params.websiteOwner,
        ssl: params.ssl ? 1 : 0,
        dkim: params.dkim ? 1 : 0,
        openBasedir: params.openBasedir ? 1 : 0,
      });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error creating website: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text', 
          text: `Website ${params.domainName} created successfully.\n\n${JSON.stringify(result, null, 2)}` 
        }],
      };
    }
  );

  /**
   * Delete a website
   * Controller: submitWebsiteDeletion
   * Required params: websiteName
   */
  server.tool(
    'delete_website',
    'Delete a website/domain from CyberPanel',
    {
      websiteName: z.string().describe('Domain name of the website to delete'),
    },
    async ({ websiteName }) => {
      const result = await client.call('submitWebsiteDeletion', { websiteName });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error deleting website: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text', 
          text: `Website ${websiteName} deleted successfully.` 
        }],
      };
    }
  );

  /**
   * Suspend or unsuspend a website
   * Controller: submitWebsiteStatus
   * Required params: websiteName, state (Suspend/Un-Suspend)
   */
  server.tool(
    'suspend_website',
    'Suspend or unsuspend a website on CyberPanel',
    {
      websiteName: z.string().describe('Domain name of the website'),
      suspend: z.boolean().describe('true to suspend, false to unsuspend'),
    },
    async ({ websiteName, suspend }) => {
      const state = suspend ? 'Suspend' : 'Un-Suspend';
      const result = await client.call('submitWebsiteStatus', { websiteName, state });
      
      if (result.status === 0) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error ${suspend ? 'suspending' : 'unsuspending'} website: ${result.error_message || 'Unknown error'}` 
          }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text', 
          text: `Website ${websiteName} has been ${suspend ? 'suspended' : 'unsuspended'} successfully.` 
        }],
      };
    }
  );

  console.error('Registered website management tools: list_websites, create_website, delete_website, suspend_website - websites.ts:177');

  // Fetch website creation data (packages and admin users)
  server.tool(
    'get_website_creation_data',
    'Get available packages and admin users for creating a new website',
    {},
    async () => {
      const result = await client.call('fetchWebsiteDataJSON', {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Fetch data for modifying a website
  server.tool(
    'get_website_modify_data',
    'Get current settings and available options for modifying a website',
    {
      websiteToBeModified: z.string().describe('Domain name of the website to modify'),
    },
    async (params) => {
      const result = await client.call('fetchModifyData', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Save website modifications
  server.tool(
    'save_website_modifications',
    'Save modifications to a website (package, email, PHP version, owner)',
    {
      domain: z.string().describe('Domain name of the website'),
      packForWeb: z.string().describe('Package name to assign'),
      email: z.string().email().describe('Admin email for the website'),
      phpVersion: z.string().describe('PHP version (e.g., PHP 8.1)'),
      admin: z.string().describe('Username of the new owner'),
    },
    async (params) => {
      const result = await client.call('saveModifications', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Change open_basedir setting
  server.tool(
    'change_open_basedir',
    'Change the open_basedir PHP setting for a website (admin only)',
    {
      domainName: z.string().describe('Domain name of the website'),
      openBasedirValue: z.enum(['1', '0']).describe("'1' to enable open_basedir, '0' to disable"),
    },
    async (params) => {
      const result = await client.call('changeOpenBasedir', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Check installation/operation status
  server.tool(
    'get_operation_status',
    'Check the status of a long-running operation using its status file path',
    {
      statusFile: z.string().describe('Path to the status file returned from an operation'),
    },
    async (params) => {
      const result = await client.call('statusFunc', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Get detailed website data (quotas, usage)
  server.tool(
    'get_website_data',
    'Get detailed website data including FTP, database quotas and usage',
    {
      domainName: z.string().describe('Domain name of the website'),
    },
    async (params) => {
      const result = await client.call('fetchWebsiteData', params);
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
