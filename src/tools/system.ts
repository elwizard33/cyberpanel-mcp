/**
 * CyberPanel MCP Server - System Management Tools
 * 
 * Tools for CyberPanel system-level operations including upgrades and process management.
 * 
 * Controllers from cloudAPI/views.py:
 * - SubmitCyberPanelUpgrade (line 98): Upgrade CyberPanel installation
 * - obtainServer (line 264): Get server type information
 * - killProcess (line 332): Kill a process by PID
 * 
 * WARNING: System operations can affect the entire server. Use with caution.
 * 
 * @module cyberpanel-mcp/tools/system
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register system management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerSystemTools(server: McpServer, client: CyberPanelClient): void {
  
  // Upgrade CyberPanel
  server.tool(
    'upgrade_cyberpanel',
    'Upgrade CyberPanel to the latest version. WARNING: This is a major system operation.',
    {
      CyberPanelBranch: z.string().default('master').describe('Git branch to upgrade to (e.g., "master", "stable")'),
      mail: z.boolean().default(false).describe('Upgrade mail server components'),
      dns: z.boolean().default(false).describe('Upgrade DNS server components'),
      ftp: z.boolean().default(false).describe('Upgrade FTP server components'),
    },
    async (params) => {
      const result = await client.call('SubmitCyberPanelUpgrade', {
        CyberPanelBranch: params.CyberPanelBranch,
        mail: params.mail ? 1 : 0,
        dns: params.dns ? 1 : 0,
        ftp: params.ftp ? 1 : 0,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error initiating upgrade: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `CyberPanel upgrade initiated.\n\n` +
            `- Branch: ${params.CyberPanelBranch}\n` +
            `- Upgrade Mail: ${params.mail ? 'Yes' : 'No'}\n` +
            `- Upgrade DNS: ${params.dns ? 'Yes' : 'No'}\n` +
            `- Upgrade FTP: ${params.ftp ? 'Yes' : 'No'}\n\n` +
            `The upgrade process runs in the background. Check server logs for progress.`
        }],
      };
    }
  );

  // Get server information
  server.tool(
    'get_server_info',
    'Get server type information (LiteSpeed or OpenLiteSpeed)',
    {},
    async () => {
      const result = await client.call('obtainServer', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error getting server info: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      const serverType = result.serverStatus === 'LiteSpeed' ? 'LiteSpeed Enterprise' : 
                         result.serverStatus === 'OLS' ? 'OpenLiteSpeed' : result.serverStatus;
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Server Information:\n\n- Web Server: ${serverType}`
        }],
      };
    }
  );

  // Note: kill_process is registered in server-status.ts
}
