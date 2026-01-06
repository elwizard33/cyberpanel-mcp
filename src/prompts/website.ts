/**
 * Website Management Prompts
 * @module cyberpanel-mcp/prompts/website
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerWebsitePrompts(server: McpServer): void {
  
  server.registerPrompt(
    'website-setup',
    {
      title: 'Website Setup',
      description: 'Create and configure a new website with SSL and email',
      argsSchema: {
        domain: z.string().describe('Domain name (e.g., example.com)'),
        adminEmail: z.string().email().describe('Admin email for notifications'),
        phpVersion: z.string().optional().default('PHP 8.1').describe('PHP version'),
      }
    },
    async ({ domain, adminEmail, phpVersion }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Set up website: ${domain}

Steps:
1. create_website - domain: ${domain}, email: ${adminEmail}, php: ${phpVersion}
2. issue_ssl - domain: ${domain}
3. create_email_account - email: admin@${domain}
4. generate_dkim_keys - domain: ${domain}

Report results for each step.`
        }
      }]
    })
  );

  server.registerPrompt(
    'website-migrate',
    {
      title: 'Website Migration',
      description: 'Migrate a website from another server',
      argsSchema: {
        domain: z.string().describe('Domain to migrate'),
        sourceType: z.enum(['cpanel', 'plesk', 'manual']).describe('Source panel type'),
      }
    },
    async ({ domain, sourceType }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Migrate ${domain} from ${sourceType}:

1. create_website - Set up ${domain}
2. For database: create_database, create_database_user
3. issue_ssl - Get SSL certificate
4. Verify: list_websites

Guide me through importing files and database.`
        }
      }]
    })
  );

  server.registerPrompt(
    'website-troubleshoot',
    {
      title: 'Website Troubleshoot',
      description: 'Diagnose and fix common website issues',
      argsSchema: {
        domain: z.string().describe('Domain to troubleshoot'),
        issue: z.enum(['502', '503', 'ssl', 'slow', 'blank']).describe('Issue type'),
      }
    },
    async ({ domain, issue }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Troubleshoot ${domain} - Issue: ${issue}

Diagnostics:
1. list_websites - Check website status
2. get_error_logs - domain: ${domain}
3. get_access_logs - Check recent requests
4. get_php_config - If PHP related

Report findings and suggest fixes.`
        }
      }]
    })
  );
}
