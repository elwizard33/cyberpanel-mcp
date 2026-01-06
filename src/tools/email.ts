/**
 * CyberPanel MCP Server - Email Management Tools
 * 
 * Tools for managing email accounts in CyberPanel (Postfix/Dovecot).
 * 
 * Controllers from cloudAPI/views.py:
 * - getEmailsForDomain: List email accounts for a domain
 * - submitEmailCreation: Create email account
 * - submitEmailDeletion: Delete email account
 * 
 * Note: Email functionality requires Postfix/Dovecot to be installed and configured.
 * 
 * @module cyberpanel-mcp/tools/email
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CyberPanelClient } from '../client/cyberpanel.js';

/**
 * Register email management tools with the MCP server
 * 
 * @param server - McpServer instance
 * @param client - CyberPanelClient for API calls
 */
export function registerEmailTools(server: McpServer, client: CyberPanelClient): void {
  
  // List email accounts for a domain
  server.tool(
    'list_email_accounts',
    'List email accounts for a domain',
    {
      domain: z.string().describe('Domain name to list email accounts for'),
    },
    async ({ domain }) => {
      const result = await client.call('getEmailsForDomain', { domain });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error listing email accounts: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      // Parse the email data if it's a JSON string
      let emails = result.data;
      if (typeof emails === 'string') {
        try {
          emails = JSON.parse(emails);
        } catch {
          // Leave as-is if parsing fails
        }
      }
      
      // Format emails for display
      let emailsText = '';
      if (Array.isArray(emails) && emails.length > 0) {
        emailsText = emails.map((e: any, i: number) => 
          `${i + 1}. ${e.email || 'N/A'} (Quota: ${e.quota || 'N/A'}, Status: ${e.status || 'N/A'})`
        ).join('\n');
      } else {
        emailsText = 'No email accounts found';
      }
      
      return {
        content: [{ type: 'text' as const, text: `Email accounts for ${domain}:\n\n${emailsText}` }],
      };
    }
  );

  // Create a new email account
  server.tool(
    'create_email_account',
    'Create a new email account for a domain',
    {
      domain: z.string().describe('Domain name for the email account'),
      username: z.string().describe('Email username (part before @)'),
      passwordByPass: z.string().describe('Password for the email account'),
      EmailLimits: z.number().int().min(-1).default(-1).describe('Email sending limit per 30 days (-1 for unlimited)'),
    },
    async (params) => {
      const result = await client.call('submitEmailCreation', {
        domain: params.domain,
        username: params.username,
        passwordByPass: params.passwordByPass,
        EmailLimits: params.EmailLimits,
      });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error creating email account: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      const fullEmail = `${params.username}@${params.domain}`;
      return {
        content: [{ type: 'text' as const, text: `Email account ${fullEmail} created successfully.` }],
      };
    }
  );

  // Delete an email account
  server.tool(
    'delete_email_account',
    'Delete an email account',
    {
      email: z.string().email().describe('Full email address to delete (e.g., user@domain.com)'),
    },
    async ({ email }) => {
      const result = await client.call('submitEmailDeletion', { email });
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting email account: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ type: 'text' as const, text: `Email account ${email} deleted successfully.` }],
      };
    }
  );

  console.error('Registered email management tools: list_email_accounts, create_email_account, delete_email_account');

  // Change email password
  server.tool(
    'change_email_password',
    'Change the password for an email account',
    {
      email: z.string().email().describe('Full email address'),
      passwordByPass: z.string().describe('New password for the email account'),
    },
    async (params) => {
      const result = await client.call('submitPasswordChange', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // List email forwardings
  server.tool(
    'list_email_forwardings',
    'List email forwarding rules for an email address',
    {
      emailAddress: z.string().email().describe('Source email address to list forwardings for'),
      forwardingOption: z.enum(['Forward to email', 'Pipe to program']).describe('Type of forwarding to list'),
    },
    async (params) => {
      const result = await client.call('fetchCurrentForwardings', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Create email forwarding
  server.tool(
    'create_email_forwarding',
    'Create an email forwarding rule',
    {
      source: z.string().email().describe('Source email address'),
      destination: z.string().describe('Destination email address or program path'),
      forwardingOption: z.enum(['Forward to email', 'Pipe to program']).describe('Type of forwarding'),
    },
    async (params) => {
      const result = await client.call('submitEmailForwardingCreation', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Delete email forwarding
  server.tool(
    'delete_email_forwarding',
    'Delete an email forwarding rule',
    {
      source: z.string().email().describe('Source email address'),
      destination: z.string().describe('Destination to remove'),
      forwardingOption: z.enum(['Forward to email', 'Pipe to program']).describe('Type of forwarding'),
    },
    async (params) => {
      const result = await client.call('submitForwardDeletion', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Fetch DKIM keys
  server.tool(
    'get_dkim_keys',
    'Get DKIM public and private keys for a domain',
    {
      domainName: z.string().describe('Domain name to get DKIM keys for'),
    },
    async (params) => {
      const result = await client.call('fetchDKIMKeys', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Generate DKIM keys
  server.tool(
    'generate_dkim_keys',
    'Generate new DKIM keys for a domain and create DNS records',
    {
      domainName: z.string().describe('Domain name to generate DKIM keys for'),
    },
    async (params) => {
      const result = await client.call('generateDKIMKeys', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Fix mail SSL
  server.tool(
    'fix_mail_ssl',
    'Fix SSL certificates for mail server (Postfix/Dovecot)',
    {
      domainName: z.string().describe('Domain name to fix mail SSL for'),
    },
    async (params) => {
      const result = await client.call('fixMailSSL', params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Run server-level email checks
  server.tool(
    'run_email_checks',
    'Run server-level email health checks and diagnostics',
    {},
    async () => {
      const result = await client.call('RunServerLevelEmailChecks', {});
      
      if (result.status === 0) {
        return {
          content: [{ type: 'text' as const, text: `Error: ${result.error_message || 'Unknown error'}` }],
          isError: true,
        };
      }
      
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Email checks started.\nStatus file: ${result.tempStatusPath}\nReport file: ${result.reportFile}\n\nUse read_email_report with the reportFile path to get results.` 
        }],
      };
    }
  );
}
