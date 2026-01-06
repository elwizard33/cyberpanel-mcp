/**
 * CyberPanel MCP Server - Hosting Package Management Tools
 * 
 * Tools for managing hosting packages that define resource limits for websites.
 * 
 * Controllers from cloudAPI/views.py:
 * - fetchPackages (line 252): List all packages
 * - submitPackage (line 250): Create new package
 * - submitPackageDelete (line 254): Delete package
 * - submitPackageModify (line 256): Modify package
 * 
 * Note: Packages define disk space, bandwidth, databases, FTP accounts,
 * email accounts, and domain limits. Use 0 for unlimited resources.
 * 
 * @module cyberpanel-mcp/tools/packages
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register hosting package management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerPackageTools(server: McpServer, client: CyberPanelClient): void {
  
  // List all hosting packages
  server.tool(
    'list_packages',
    'List all hosting packages with their resource limits',
    {},
    async () => {
      const result = await client.call('fetchPackages', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing packages: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the packages data if it's a JSON string
      let packages = result.data;
      if (typeof packages === 'string') {
        try {
          packages = JSON.parse(packages);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format packages for display
      let packagesText = '';
      if (Array.isArray(packages) && packages.length > 0) {
        packagesText = packages.map((p: any, i: number) => 
          `${i + 1}. ${p.packageName || 'N/A'} - Disk: ${p.diskSpace || 0}MB, BW: ${p.bandwidth || 0}MB, DBs: ${p.dataBases || 0}, FTP: ${p.ftpAccounts || 0}, Emails: ${p.emails || 0}`
        ).join('\n');
      } else {
        packagesText = 'No packages found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `Hosting Packages:\n\n${packagesText}` }],
      };
    }
  );

  // Create a new hosting package
  server.tool(
    'create_package',
    'Create a new hosting package with resource limits. Use 0 for unlimited.',
    {
      packageName: z.string().describe('Package name (will be prefixed with admin username)'),
      diskSpace: z.number().default(0).describe('Disk space in MB (0 = unlimited)'),
      bandwidth: z.number().default(0).describe('Bandwidth in MB/month (0 = unlimited)'),
      dataBases: z.number().default(0).describe('Max databases (0 = unlimited)'),
      ftpAccounts: z.number().default(0).describe('Max FTP accounts (0 = unlimited)'),
      emails: z.number().default(0).describe('Max email accounts (0 = unlimited)'),
      allowedDomains: z.number().default(0).describe('Max addon domains (0 = unlimited)'),
      allowFullDomain: z.number().default(1).describe('Allow full domain registration (1 = yes)'),
      enforceDiskLimits: z.number().default(0).describe('Enforce disk limits (1 = yes)'),
    },
    async (params) => {
      const result = await client.call('submitPackage', {
        packageName: params.packageName,
        diskSpace: params.diskSpace,
        bandwidth: params.bandwidth,
        dataBases: params.dataBases,
        ftpAccounts: params.ftpAccounts,
        emails: params.emails,
        allowedDomains: params.allowedDomains,
        allowFullDomain: params.allowFullDomain,
        enforceDiskLimits: params.enforceDiskLimits,
        api: '1', // API call - don't prefix with username
      });
      
      if (result.status === 0 || result.saveStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating package: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Package "${params.packageName}" created successfully.\n\nLimits:\n- Disk Space: ${params.diskSpace || 'unlimited'} MB\n- Bandwidth: ${params.bandwidth || 'unlimited'} MB/month\n- Databases: ${params.dataBases || 'unlimited'}\n- FTP Accounts: ${params.ftpAccounts || 'unlimited'}\n- Emails: ${params.emails || 'unlimited'}\n- Domains: ${params.allowedDomains || 'unlimited'}` 
        }],
      };
    }
  );

  // Delete a hosting package
  server.tool(
    'delete_package',
    'Delete a hosting package',
    {
      packageName: z.string().describe('Name of the package to delete'),
    },
    async ({ packageName }) => {
      const result = await client.call('submitPackageDelete', { packageName });
      
      if (result.status === 0 || result.deleteStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting package: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Package "${packageName}" deleted successfully.` }],
      };
    }
  );

  // Modify a hosting package
  server.tool(
    'modify_package',
    'Modify an existing hosting package. Use 0 for unlimited.',
    {
      packageName: z.string().describe('Package name to modify'),
      diskSpace: z.number().describe('Disk space in MB (0 = unlimited)'),
      bandwidth: z.number().describe('Bandwidth in MB/month (0 = unlimited)'),
      dataBases: z.number().describe('Max databases (0 = unlimited)'),
      ftpAccounts: z.number().describe('Max FTP accounts (0 = unlimited)'),
      emails: z.number().describe('Max email accounts (0 = unlimited)'),
      allowedDomains: z.number().describe('Max addon domains (0 = unlimited)'),
    },
    async (params) => {
      const result = await client.call('submitPackageModify', {
        packageName: params.packageName,
        diskSpace: params.diskSpace,
        bandwidth: params.bandwidth,
        dataBases: params.dataBases,
        ftpAccounts: params.ftpAccounts,
        emails: params.emails,
        allowedDomains: params.allowedDomains,
      });
      
      if (result.status === 0 || result.modifyStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error modifying package: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Package "${params.packageName}" modified successfully.` }],
      };
    }
  );
}
