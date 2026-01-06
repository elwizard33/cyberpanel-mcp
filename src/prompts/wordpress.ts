/**
 * WordPress Management Prompts
 * @module cyberpanel-mcp/prompts/wordpress
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerWordPressPrompts(server: McpServer): void {

  server.registerPrompt(
    'wordpress-install',
    {
      title: 'Install WordPress',
      description: 'Deploy WordPress on a website',
      argsSchema: {
        domain: z.string().describe('Domain for WordPress'),
        title: z.string().optional().describe('Site title'),
      }
    },
    async ({ domain, title }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Install WordPress on ${domain}:

1. Verify ${domain} exists in list_websites
2. install_wordpress - domain: ${domain}, title: ${title || domain}
3. verify_wordpress_installation
4. wordpress_auto_login - Get admin URL

Return admin credentials and login URL.`
        }
      }]
    })
  );

  server.registerPrompt(
    'wordpress-staging',
    {
      title: 'WordPress Staging',
      description: 'Create a staging copy of WordPress site',
      argsSchema: {
        domain: z.string().describe('Production domain'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Create staging for ${domain}:

1. verify_wordpress_installation - Check WordPress exists
2. create_wordpress_staging - domain: ${domain}
3. Report staging URL

Staging will be at staging.${domain} or similar.`
        }
      }]
    })
  );

  server.registerPrompt(
    'wordpress-security',
    {
      title: 'WordPress Security Audit',
      description: 'Check and improve WordPress security',
      argsSchema: {
        domain: z.string().describe('WordPress domain'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Security audit for ${domain}:

1. get_wordpress_details - Check version
2. save_wordpress_auto_updates - Enable auto-updates
3. Check installed plugins
4. Verify SSL active

Recommendations:
- Keep WordPress core updated
- Remove unused themes/plugins
- Use strong passwords
- Enable 2FA if available`
        }
      }]
    })
  );

  server.registerPrompt(
    'wordpress-clone',
    {
      title: 'Clone WordPress Site',
      description: 'Clone WordPress to another domain',
      argsSchema: {
        source: z.string().describe('Source domain'),
        target: z.string().describe('Target domain'),
      }
    },
    async ({ source, target }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Clone WordPress: ${source} → ${target}

1. Verify both domains exist
2. clone_wordpress - source: ${source}, target: ${target}
3. verify_wordpress_installation - target: ${target}
4. Update site URLs in WordPress

Note: Database and files will be copied.`
        }
      }]
    })
  );

  server.registerPrompt(
    'wordpress-troubleshoot',
    {
      title: 'WordPress Troubleshoot',
      description: 'Diagnose WordPress issues',
      argsSchema: {
        domain: z.string().describe('WordPress domain'),
        issue: z.enum(['white-screen', 'login-loop', 'slow', '500-error']).describe('Issue type'),
      }
    },
    async ({ domain, issue }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Troubleshoot ${domain} - ${issue}:

1. get_error_logs - domain: ${domain}
2. get_wordpress_details
3. Check PHP version and memory

Common fixes:
- white-screen: Increase memory, disable plugins
- login-loop: Clear cookies, check wp-config.php
- slow: Check database, enable caching
- 500-error: Check .htaccess, PHP errors

Report findings.`
        }
      }]
    })
  );
}
