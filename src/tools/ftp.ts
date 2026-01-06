/**
 * CyberPanel MCP Server - FTP Management Tools
 * 
 * Tools for managing FTP accounts in CyberPanel (Pure-FTPd).
 * 
 * Controllers from cloudAPI/views.py:
 * - getAllFTPAccounts: List FTP accounts for a domain
 * - submitFTPCreation: Create FTP account
 * - submitFTPDelete: Delete FTP account
 * 
 * Note: FTP uses Pure-FTPd. Path is relative to website's home directory.
 * 
 * @module cyberpanel-mcp/tools/ftp
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register FTP management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerFtpTools(server: McpServer, client: CyberPanelClient): void {
  
  // List FTP accounts for a domain
  server.tool(
    'list_ftp_accounts',
    'List FTP accounts for a website domain',
    {
      selectedDomain: z.string().describe('Domain name to list FTP accounts for'),
    },
    async ({ selectedDomain }) => {
      const result = await client.call('getAllFTPAccounts', { selectedDomain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing FTP accounts: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Format FTP accounts for display
      const accounts = result.data || [];
      let ftpText = '';
      if (Array.isArray(accounts) && accounts.length > 0) {
        ftpText = accounts.map((acc: any, i: number) => 
          `${i + 1}. ${acc.ftpUser || acc.userName || 'N/A'}${acc.path ? ` (Path: ${acc.path})` : ''}`
        ).join('\n');
      } else {
        ftpText = 'No FTP accounts found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `FTP accounts for ${selectedDomain}:\n\n${ftpText}` }],
      };
    }
  );

  // Create a new FTP account
  server.tool(
    'create_ftp_account',
    'Create a new FTP account for a website',
    {
      ftpDomain: z.string().describe('Domain name for the FTP account'),
      ftpUserName: z.string().describe('FTP username'),
      passwordByPass: z.string().describe('Password for the FTP account'),
      path: z.string().default('').describe('Path relative to website home directory (empty for root)'),
    },
    async (params) => {
      const result = await client.call('submitFTPCreation', {
        ftpDomain: params.ftpDomain,
        ftpUserName: params.ftpUserName,
        passwordByPass: params.passwordByPass,
        path: params.path || 'None',
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating FTP account: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `FTP account ${params.ftpUserName} created successfully for ${params.ftpDomain}.` }],
      };
    }
  );

  // Delete an FTP account
  server.tool(
    'delete_ftp_account',
    'Delete an FTP account',
    {
      ftpUsername: z.string().describe('FTP username to delete'),
    },
    async ({ ftpUsername }) => {
      const result = await client.call('submitFTPDelete', { ftpUsername });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting FTP account: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `FTP account ${ftpUsername} deleted successfully.` }],
      };
    }
  );

  // Change FTP account password
  server.tool(
    'change_ftp_password',
    'Change the password for an existing FTP account',
    {
      ftpUserName: z.string().describe('FTP username to change password for'),
      passwordByPass: z.string().describe('New password for the FTP account'),
    },
    async (params) => {
      const result = await client.call('changeFTPPassword', {
        ftpUserName: params.ftpUserName,
        passwordByPass: params.passwordByPass,
      });
      
      if (result.status === 0 || result.changePasswordStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error changing FTP password: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Password changed successfully for FTP account ${params.ftpUserName}.` }],
      };
    }
  );

  console.error('Registered FTP management tools: list_ftp_accounts, create_ftp_account, delete_ftp_account, change_ftp_password');
}
