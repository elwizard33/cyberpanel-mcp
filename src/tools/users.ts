/**
 * CyberPanel MCP Server - User Management Tools
 * 
 * Tools for managing CyberPanel users and administrators.
 * Only admin users can manage other users.
 * 
 * Controllers from cloudAPI/views.py:
 * - fetchUsers (line 228): List all users
 * - submitUserCreation (line 226): Create new user
 * - submitUserDeletion (line 230): Delete user
 * - saveModificationsUser (line 232): Modify user settings
 * 
 * Note: ACL controls which features users can access.
 * Available ACLs: admin, reseller, user
 * 
 * @module cyberpanel-mcp/tools/users
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register user management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerUserTools(server: McpServer, client: CyberPanelClient): void {
  
  // List all users
  server.tool(
    'list_users',
    'List all CyberPanel users/administrators',
    {},
    async () => {
      const result = await client.call('fetchUsers', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing users: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the users data if it's a JSON string
      let users = result.data;
      if (typeof users === 'string') {
        try {
          users = JSON.parse(users);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format users for display
      let usersText = '';
      if (Array.isArray(users) && users.length > 0) {
        usersText = users.map((u: any, i: number) => 
          `${i + 1}. ${u.userName || 'N/A'} (${u.email || 'N/A'}) - ${u.acl || 'user'}, ${u.websitesLimit || 0} sites limit`
        ).join('\n');
      } else {
        usersText = 'No users found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `CyberPanel Users:\n\n${usersText}` }],
      };
    }
  );

  // Create a new user
  server.tool(
    'create_user',
    'Create a new CyberPanel user/administrator',
    {
      firstName: z.string().min(2).describe('First name (min 2 chars, alphabetic only)'),
      lastName: z.string().min(2).describe('Last name (min 2 chars, alphabetic only)'),
      email: z.string().email().describe('Valid email address'),
      userName: z.string().describe('Username for login'),
      password: z.string().min(8).describe('Password (min 8 chars)'),
      websitesLimit: z.number().default(10).describe('Maximum number of websites user can create'),
      selectedACL: z.string().default('user').describe('Access control level (admin, reseller, user)'),
    },
    async (params) => {
      const result = await client.call('submitUserCreation', {
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        userName: params.userName,
        password: params.password,
        websitesLimit: params.websitesLimit,
        selectedACL: params.selectedACL,
      });
      
      if (result.status === 0 || result.createStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating user: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `User "${params.userName}" created successfully.\n\nACL: ${params.selectedACL}\nWebsites Limit: ${params.websitesLimit}` 
        }],
      };
    }
  );

  // Delete a user
  server.tool(
    'delete_user',
    'Delete a CyberPanel user',
    {
      accountUsername: z.string().describe('Username of the account to delete'),
      force: z.boolean().default(false).describe('Force delete including all user websites'),
    },
    async (params) => {
      const result = await client.call('submitUserDeletion', {
        accountUsername: params.accountUsername,
        force: params.force ? 1 : 0,
      });
      
      if (result.status === 0 || result.deleteStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting user: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `User "${params.accountUsername}" deleted successfully.` }],
      };
    }
  );

  // Modify user settings
  server.tool(
    'modify_user',
    'Modify an existing CyberPanel user\'s settings',
    {
      accountUsername: z.string().describe('Username of the account to modify'),
      firstName: z.string().min(2).describe('New first name'),
      lastName: z.string().min(2).describe('New last name'),
      email: z.string().email().describe('New email address'),
      passwordByPass: z.string().min(8).describe('New password'),
      securityLevel: z.enum(['HIGH', 'LOW']).default('HIGH').describe('Security level'),
      twofa: z.number().default(0).describe('Two-factor auth enabled (0 or 1)'),
    },
    async (params) => {
      const result = await client.call('saveModificationsUser', {
        accountUsername: params.accountUsername,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordByPass: params.passwordByPass,
        securityLevel: params.securityLevel,
        twofa: params.twofa,
      });
      
      if (result.status === 0 || result.saveStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error modifying user: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `User "${params.accountUsername}" modified successfully.` }],
      };
    }
  );

  // List users with reseller privileges
  server.tool(
    'list_resellers',
    'List all users with reseller privileges',
    {},
    async () => {
      const result = await client.call('userWithResellerPriv', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      let resellers = result.data;
      if (typeof resellers === 'string') {
        try {
          resellers = JSON.parse(resellers);
        } catch {
          // Leave as-is
        }
      }
      
      return {
        content: [{ type: 'text' as const, text: `Reseller Users:\n\n${JSON.stringify(resellers, null, 2)}` }],
      };
    }
  );

  // Save reseller changes
  server.tool(
    'save_reseller_changes',
    'Save reseller settings for a user',
    {
      accountUsername: z.string().describe('Username of the reseller account'),
      aclName: z.string().describe('ACL name to assign'),
      websitesLimit: z.number().describe('Maximum websites limit'),
    },
    async (params) => {
      const result = await client.call('saveResellerChanges', params);
      
      if (result.status === 0 || result.saveStatus === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Reseller settings saved for "${params.accountUsername}".` }],
      };
    }
  );
}
