/**
 * CyberPanel MCP Server - Backup Management Tools
 * 
 * Tools for managing website backups in CyberPanel.
 * Supports local backups with status tracking.
 * 
 * Controllers from cloudAPI/views.py:
 * - submitBackupCreation (line 218): Create website backup
 * - getCurrentBackups (line 220): List backups for a website
 * - deleteBackup (line 222): Delete a backup
 * - backupStatusFunc (line 216): Get backup operation status
 * 
 * Note: Backups are stored in /home/{domain}/backup/
 * Cloud/S3 backups use separate controllers.
 * 
 * @module cyberpanel-mcp/tools/backups
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register backup management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerBackupTools(server: McpServer, client: CyberPanelClient): void {
  
  // Create a backup for a website
  server.tool(
    'create_backup',
    'Create a backup of a website. Backups include files and databases. Stored in /home/{domain}/backup/',
    {
      websiteToBeBacked: z.string().describe('Domain name of the website to backup (e.g., example.com)'),
    },
    async ({ websiteToBeBacked }) => {
      const result = await client.call('submitBackupCreation', { websiteToBeBacked });
      
      if (result.status === 0 || result.metaStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating backup: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Backup initiated for ${websiteToBeBacked}.\n\nTemp storage: ${result.tempStorage || 'N/A'}\n\nUse get_backup_status to monitor progress.` 
        }],
      };
    }
  );

  // List backups for a website
  server.tool(
    'list_backups',
    'List all backups for a website domain',
    {
      websiteToBeBacked: z.string().describe('Domain name to list backups for'),
    },
    async ({ websiteToBeBacked }) => {
      const result = await client.call('getCurrentBackups', { websiteToBeBacked });
      
      if (result.status === 0 || result.fetchStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing backups: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the backup data if it's a JSON string
      let backups = result.data;
      if (typeof backups === 'string') {
        try {
          backups = JSON.parse(backups);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format backups for display
      let backupText = '';
      if (Array.isArray(backups) && backups.length > 0) {
        backupText = backups.map((b: any, i: number) => 
          `${i + 1}. ${b.fileName || b.name || 'N/A'} (${b.date || 'N/A'}, ${b.size || 'N/A'})`
        ).join('\n');
      } else {
        backupText = 'No backups found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `Backups for ${websiteToBeBacked}:\n\n${backupText}` }],
      };
    }
  );

  // Get backup status
  server.tool(
    'get_backup_status',
    'Get the status of an ongoing backup operation',
    {
      websiteToBeBacked: z.string().describe('Domain name of the website being backed up'),
    },
    async ({ websiteToBeBacked }) => {
      const result = await client.call('backupStatusFunc', { websiteToBeBacked });
      
      if (result.status === 0 && result.abort === 0) {
        return {
          content: [{ type: 'text' as const, text: `Backup error: ${result.errorMessage || result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Backup status for ${websiteToBeBacked}:\n\n${JSON.stringify(result, null, 2)}` }],
      };
    }
  );

  // Delete a backup
  server.tool(
    'delete_backup',
    'Delete a website backup by its ID',
    {
      backupID: z.number().describe('ID of the backup to delete'),
    },
    async ({ backupID }) => {
      const result = await client.call('deleteBackup', { backupID });
      
      if (result.status === 0 || result.deleteStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting backup: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Backup ${backupID} deleted successfully.` }],
      };
    }
  );
}
