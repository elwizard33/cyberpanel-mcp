/**
 * SSL Certificate Management Prompts
 * @module cyberpanel-mcp/prompts/ssl
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSSLPrompts(server: McpServer): void {

  server.registerPrompt(
    'ssl-issue',
    {
      title: 'Issue SSL Certificate',
      description: 'Get Let\'s Encrypt SSL for a domain',
      argsSchema: {
        domain: z.string().describe('Domain for SSL'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Issue SSL for ${domain}:

1. issue_ssl - domain: ${domain}
2. Verify HTTPS accessible
3. Check certificate expiry

Report certificate details.`
        }
      }]
    })
  );

  server.registerPrompt(
    'ssl-mail',
    {
      title: 'Issue Mail SSL',
      description: 'Get SSL certificate for mail server',
      argsSchema: {
        domain: z.string().describe('Domain for mail SSL'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Issue mail SSL for ${domain}:

1. issue_mail_ssl - domain: ${domain}
2. Verify mail.${domain} has SSL
3. Test SMTP/IMAP on secure ports

SMTP: 465 (SSL), 587 (STARTTLS)
IMAP: 993 (SSL)`
        }
      }]
    })
  );

  server.registerPrompt(
    'ssl-install-custom',
    {
      title: 'Install Custom SSL',
      description: 'Install a custom SSL certificate',
      argsSchema: {
        domain: z.string().describe('Domain for SSL'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Install custom SSL for ${domain}:

Provide:
1. Certificate (PEM format)
2. Private Key
3. CA Bundle (optional)

Use install_custom_ssl with the certificate data.
Verify installation after.`
        }
      }]
    })
  );

  server.registerPrompt(
    'ssl-renew-all',
    {
      title: 'Renew All SSL',
      description: 'Check and renew expiring certificates',
      argsSchema: {}
    },
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Check SSL certificates:

1. list_websites - Get all domains
2. For each domain: check SSL expiry
3. issue_ssl - Renew if expiring < 30 days

Report certificates needing renewal.`
        }
      }]
    })
  );
}
