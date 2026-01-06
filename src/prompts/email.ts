/**
 * Email Management Prompts
 * @module cyberpanel-mcp/prompts/email
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerEmailPrompts(server: McpServer): void {

  server.registerPrompt(
    'email-domain-setup',
    {
      title: 'Email Domain Setup',
      description: 'Configure email for a domain with DKIM/SPF',
      argsSchema: {
        domain: z.string().describe('Domain to configure'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Configure email for ${domain}:

1. generate_dkim_keys - domain: ${domain}
2. get_dkim_keys - Get public key for DNS
3. create_email_account - postmaster@${domain}

DNS records needed:
- MX: mail.${domain} (priority 10)
- SPF: v=spf1 mx ~all
- DKIM: (from get_dkim_keys)

Report DKIM record for DNS.`
        }
      }]
    })
  );

  server.registerPrompt(
    'email-account-manage',
    {
      title: 'Email Account Management',
      description: 'Create, modify, or delete email accounts',
      argsSchema: {
        domain: z.string().describe('Domain for email'),
        action: z.enum(['create', 'delete', 'list', 'password']).describe('Action'),
        email: z.string().optional().describe('Email address (for create/delete)'),
      }
    },
    async ({ domain, action, email }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Email ${action} for ${domain}:

${action === 'create' ? `1. create_email_account - ${email || 'new@' + domain}
2. Generate secure password
3. Return IMAP/SMTP settings` :
action === 'delete' ? `1. list_email_accounts - Verify ${email} exists
2. delete_email_account - ${email}` :
action === 'password' ? `1. change_email_password - ${email}
2. Generate new secure password` :
`1. list_email_accounts - domain: ${domain}`}

Report results.`
        }
      }]
    })
  );

  server.registerPrompt(
    'email-forwarding',
    {
      title: 'Email Forwarding',
      description: 'Set up email forwarding rules',
      argsSchema: {
        source: z.string().describe('Source email'),
        destination: z.string().describe('Forward to address'),
      }
    },
    async ({ source, destination }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Set up forwarding: ${source} → ${destination}

1. create_email_forwarding - source: ${source}, dest: ${destination}
2. list_email_forwardings - Verify setup

Report confirmation.`
        }
      }]
    })
  );

  server.registerPrompt(
    'email-deliverability',
    {
      title: 'Email Deliverability Check',
      description: 'Diagnose email delivery issues',
      argsSchema: {
        domain: z.string().describe('Domain to check'),
      }
    },
    async ({ domain }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Check email deliverability for ${domain}:

1. get_dkim_keys - Verify DKIM configured
2. Check DNS records: MX, SPF, DKIM, DMARC
3. list_email_accounts - Check active accounts

Required DNS records:
- MX → mail.${domain}
- TXT (SPF) → v=spf1 mx ~all
- TXT (DKIM) → from get_dkim_keys
- TXT (DMARC) → v=DMARC1; p=none

Report missing records.`
        }
      }]
    })
  );
}
